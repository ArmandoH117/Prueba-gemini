import React, { useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform, ScrollView,
    Keyboard,
    Modal,
    Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useActiveChat } from "../contexts/ActiveChatContext";
import { useEffect } from "react";
import { getFormatoFecha } from "../utils/formatDate";
import { makeRequest } from "../services/fetchRequest";
import { takePhoto } from "../utils/selectImages";
import { selectFiles } from "../utils/selectFiles";
import ShowFile from "../components/ShowFile";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { getData } from "../utils/LocalStorage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Loader from "../components/Loader";

const messageRequest = 10;
const SCREEN_W = Dimensions.get('window').width;

export default function ChatScreen({ route, navigation }) {
    const [mensaje, setMensaje] = useState("");
    const [userId, setUserId] = useState(0);
    const listRef = useRef(null);
    const [nameChat, setNameChat] = useState('');
    const [chatId, setChatId] = useState(0);
    const [perfilImage, setPerfilImage] = useState('');
    const { receptorId  } = route.params;
    const [archivos, setArchivos] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [mediaOpen, setMediaOpen] = useState(false);
    const [urlImagen, SetUrlImagen] = useState(null);
    const swipeRef = useRef(null);
    const [replyMessage, setReplyMessage] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const tabBarHeight = useBottomTabBarHeight();
    const mediaListRef = useRef(null);

    const {
        setActiveChatId,
        clearActiveChat,
        activeMessages,
        setActiveMessages,
    } = useActiveChat();

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    useEffect(() => {
        (async () => {
            setActiveChatId(chatId);
            await getData('idUser', setUserId);
        })();

        return () => setActiveChatId(null);
    }, [chatId]);

    const handleReply = (msg) => {
        setReplyMessage(msg);
    };

    useEffect(() => {
        let mounted = true;

        if (userId > 0) {
            (async () => {
                try {
                    setLoadingMore(true);
                    const data = await makeRequest(`/chats/mensajes/${receptorId}/${userId}`);
                    setActiveMessages(prev => [...data.data, ...prev]);
                    setHasMore(data.data.length == messageRequest);
                    setChatId(data.infoChat.chatId);
                    
                    setNameChat(`${data.infoChat.nombreUsuario} ${data.infoChat.apellidoUsuario}`);
                    setPerfilImage(data.infoChat.imagenUsuario);

                    requestAnimationFrame(() => {
                        listRef.current?.scrollToEnd({ animated: true });
                    });
                } catch (e) {
                } finally {
                    setLoadingMore(false);
                }
            })();
        }

        return () => {
            mounted = false;
            clearActiveChat();
        };
    }, [userId]);

    async function loadMessages() {
        if (loadingMore || !hasMore || activeMessages.length < 10) return;
        setLoadingMore(true);

        setTimeout(async () => {
            try {
                const totalMesages = Math.round(activeMessages.length / messageRequest);
                const data = await makeRequest(`/chats/mensajes-anteriores/${chatId}/${totalMesages}`);

                setHasMore(data.data.length == messageRequest);
                setActiveMessages(prev => [...prev, ...data.data]);
            } finally {
                setLoadingMore(false);
            }
        }, 1000);
    }

    async function sendMessage() {
        const text = mensaje.trim();
        if (!text && archivos.length == 0) return;

        const mensajeInfo = new FormData();
        mensajeInfo.append('chatId', chatId);
        mensajeInfo.append('usuarioId', userId);
        mensajeInfo.append('receptorId', receptorId);
        mensajeInfo.append('mensajeTexto', text);

        const dataMessage = {
            chatId: chatId,
            usuarioId: userId,
            mensajeTexto: text
        }

        if (replyMessage) {
            mensajeInfo.append('mensajePadreId', replyMessage.mensajeId);
            dataMessage.mensajePadre = replyMessage.mensajeTexto;
        }

        if (archivos.length > 0) {
            archivos.forEach(file => {
                mensajeInfo.append('files', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                });
            });
        }

        setMensaje("");
        setArchivos([]);
        setReplyMessage(null);

        try {
            const data = await makeRequest(`/chats/mensaje`, { method: 'post' }, mensajeInfo);

            setChatId(data.chatId);
            dataMessage.mensajeId = data.data;
            dataMessage.imagenes = data.files;
            dataMessage.mensajeEnvio = new Date();
        } catch (e) {
            console.log(e);
            return;
        }

        setActiveMessages((prev) => [dataMessage, ...prev]);

        requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({ animated: true });
        });
    }

    const removeAt = (idx) => {
        setArchivos(prev => prev.filter((_, i) => i !== idx));
    };

    const isImage = (file) =>
        file.type?.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name);

    const fmtSize = (bytes = 0) => {
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const MessageItem = ({ item, onReply, index }) => {
        const isMe = item.usuarioId == userId;
        const showTimeInline = true;

        const renderLeftActions = () => (
            <View style={styles.swipeAction}>
                <Text></Text>
            </View>
        );

        const renderRightActions = renderLeftActions;

        return (
            <ReanimatedSwipeable
                ref={swipeRef}
                simultaneousHandlers={listRef}
                waitFor={listRef}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                overshootLeft={false}
                overshootRight={false}
                leftThreshold={10}
                rightThreshold={10}
                friction={0.4}
                overshootFriction={8}
                onSwipeableOpen={() => {
                    onReply(item);
                    swipeRef.current?.close();
                }}
            >
                <View style={[styles.row, isMe ? styles.right : styles.left]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                        {item.mensajePadre && (
                            <View style={[styles.mensajePadre, isMe ? styles.meReplay : styles.friendReplay]}>
                                <Text numberOfLines={2} style={isMe ? styles.meTextReplay : styles.friendTextReplay}>
                                    {item.mensajePadre}
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.text, isMe ? styles.textMe : styles.textOther]}>
                            {item.mensajeTexto}
                        </Text>

                        {Array.isArray(item.imagenes) && item.imagenes.length > 0 && (
                            <View style={styles.attachmentsWrap} >
                                {item.imagenes.map((url, i) => (
                                    <ShowFile key={`${url}-${i}`} url={url} viewerImage={ ShowImage } indexlst={index} indeximg={i}/>
                                ))}
                            </View>
                        )}

                        <View style={styles.meta}>
                            {showTimeInline && (
                                <Text
                                    style={[
                                        styles.time,
                                        isMe ? styles.timeOnPurple : styles.timeOnWhite,
                                    ]}
                                >
                                    {getFormatoFecha(item.mensajeEnvio)}
                                </Text>
                            )}
                            {isMe && (
                                <View style={styles.seenWrap}>
                                    <Feather
                                        name="check"
                                        size={12}
                                        style={[styles.check, item.seen && styles.checkSeen]}
                                    />
                                    <Feather
                                        name="check"
                                        size={12}
                                        style={[
                                            styles.check,
                                            styles.checkOverlap,
                                            item.seen && styles.checkSeen,
                                        ]}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ReanimatedSwipeable>
        );
    };
    
    const ShowImage = (urlImagen, indexlst, indeximg) => {
        SetUrlImagen({ url: urlImagen, index: indeximg, lista: activeMessages[indexlst].imagenes});
        setMediaOpen(true);
    }

    const ModalArchivos = () => {
        return (
            <Modal transparent visible={mediaOpen} animationType="fade" onRequestClose={() => setMediaOpen(false)}>
                <View style={styles.viewerBackdrop}>
                    <TouchableOpacity onPress={() => setMediaOpen(false)} style={[styles.topBtn, { position: 'absolute', right: 10, top: 40, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <Ionicons name="close" size={26} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        ref={mediaListRef}
                        data={urlImagen?.lista}
                        keyExtractor={(uri, i) => (uri || 'img') + '-' + i}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={urlImagen?.index || 0}
                        getItemLayout={(_, i) => ({
                            length: SCREEN_W,
                            offset: SCREEN_W * i,
                            index: i,
                        })}
                        onLayout={() => {
                            const idx = urlImagen?.index || 0;
                            if (idx > 0) {
                                mediaListRef.current?.scrollToIndex({ index: idx, animated: false });
                            }
                        }}
                        renderItem={({ item: uri }) => (
                            <View style={{ width: SCREEN_W, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    source={{ uri }}
                                    style={styles.viewerImage}
                                    resizeMode="contain"
                                    onError={() => console.warn('No se pudo cargar la imagen:', uri)}
                                />
                            </View>
                        )}
                    />
                </View>
            </Modal>
        )
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} />
                </TouchableOpacity>
                <Image source={{ uri: perfilImage }} style={styles.avatar} />

                <View style={styles.headerCenter}>
                    <Text style={styles.name}>{nameChat}</Text>
                    <Text style={styles.role}>En linea</Text>
                </View>
            </View>

            <View
                style={[{ flex: 1 }, 
                keyboardHeight > 0 && { marginBottom: keyboardHeight - tabBarHeight + 20 }]}>
                <GestureHandlerRootView style={{ flex: 1 }}>

                    <FlatList
                        ref={listRef}
                        style={styles.list}
                        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
                        data={activeMessages}
                        keyExtractor={(it) => String(it.mensajeId)}
                        inverted
                        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
                        onEndReached={hasMore ? loadMessages : null}
                        onEndReachedThreshold={0.4}
                        ListFooterComponent={ () => Loader(loadingMore)}
                        initialNumToRender={20}
                        windowSize={10}
                        maxToRenderPerBatch={20}
                        removeClippedSubviews
                        renderItem={({ item, index }) => (
                            <MessageItem item={item} onReply={handleReply} index={ index } />
                        )}
                    />

                    <View>
                        {archivos.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.filesContent}
                            >
                                {archivos.map((f, idx) => (
                                    <View
                                        key={f.uri + idx}
                                        style={styles.viewFile}
                                    >
                                        {isImage(f) ? (
                                            <Image
                                                source={{ uri: f.uri }}
                                                style={{ width: 80, height: 80, borderRadius: 8 }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 80, height: 80, borderRadius: 8,
                                                    backgroundColor: '#f3f4f6',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <Text style={{ fontSize: 32 }}>📎</Text>
                                            </View>
                                        )}

                                        <Text
                                            numberOfLines={1}
                                            style={{ marginTop: 6, fontSize: 12, fontWeight: '600', maxWidth: 88 }}
                                        >
                                            {f.name}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: '#6b7280' }}>{fmtSize(f.size)}</Text>

                                        <TouchableOpacity onPress={() => removeAt(idx)} style={{ marginTop: 6 }}>
                                            <Text style={{ color: '#ef4444', fontSize: 12 }}>Quitar</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {replyMessage && (
                            <View style={styles.replyBanner}>
                                <View style={styles.replyPreview}>
                                    <Text numberOfLines={2}>
                                        {replyMessage.mensajeTexto}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setReplyMessage(null)}
                                    style={styles.replyCloseBtn}>
                                    <Text style={{ fontWeight: "700" }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.inputBar}>
                            <TextInput
                                value={mensaje}
                                onChangeText={setMensaje}
                                style={styles.input}
                                placeholderTextColor="#000"
                                multiline
                            />

                            <TouchableOpacity style={styles.iconBtn} onPress={() => takePhoto(setArchivos)} >
                                <Ionicons name="image-outline" size={22} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconBtn} onPress={() => selectFiles(setArchivos)} >
                                <MaterialCommunityIcons name="paperclip" size={22} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
                                <Ionicons name="paper-plane" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </GestureHandlerRootView>
            </View>

            <ModalArchivos/>
        </SafeAreaView >
    );
}

const PURPLE = "#7C4DFF";
const BG = "#F6F7FB";

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG},
    header: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e6e6e6",
        backgroundColor: "#fff",
    },
    menuBtn: { width: 36, alignItems: "center" },
    moreBtn: { width: 36, alignItems: "center" },
    headerCenter: { flex: 1, alignItems: "center" },
    name: { fontSize: 16, fontWeight: "700", color: "#222" },
    role: { fontSize: 12, color: "#33bd13ff", marginTop: 2 },
    list: { flex: 1 },
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 8,
    },
    left: { justifyContent: "flex-start" },
    right: { justifyContent: "flex-end" },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
    },
    avatarMe: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: 6,
        opacity: 0.85,
    },
    bubble: {
        maxWidth: "75%",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
    },
    bubbleOther: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 6,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#ECECEC",
    },
    bubbleMe: {
        backgroundColor: PURPLE,
        borderTopRightRadius: 6,
    },
    text: { fontSize: 15, lineHeight: 20 },
    textOther: { color: "#222" },
    textMe: { color: "#fff" },
    meta: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    time: { fontSize: 11 },
    timeOnPurple: { color: "rgba(255,255,255,0.85)" },
    timeOnWhite: { color: "#9A9AA1" },
    seenWrap: { flexDirection: "row", alignItems: "center" },
    check: { marginLeft: 2, color: "rgba(255,255,255,0.6)" },
    checkOverlap: { marginLeft: -4 },
    checkSeen: { color: "#CDE7FF" },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e8e8e8",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 110,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: "#F1F2F6",
    },
    iconBtn: { padding: 4 },
    sendBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: PURPLE,
        borderRadius: 16,
    },
    viewFile: {
        width: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 6,
        alignItems: 'center'

    },
    filesContent: {
        marginTop: 12,
        backgroundColor: "#fff",
        padding: 5,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e8e8e8",
    },
    attachmentsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10
    },
    swipeAction: {
        flex: 1,
        backgroundColor: "#E7F5E8",
        justifyContent: "center",
        paddingLeft: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#d9e6da",
    },
    replyBanner: {
        borderTopWidth: StyleSheet.hairlineWidth,
        backgroundColor: "#fff",
        borderColor: "#e8e8e8",
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    replyTitle: { fontWeight: "700", marginRight: 6 },
    replyPreview: {
        color: "#555",
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        borderLeftColor: PURPLE,
        borderLeftWidth: 5
    },
    mensajePadre: {
        flex: 1,
        padding: 5,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        borderLeftWidth: 5,
        marginBottom: 5
    },
    meReplay: {
        backgroundColor: 'rgba(245, 250, 255, 0.7)',
        borderLeftColor: "#aab0e8ff"
    },
    friendReplay: {
        backgroundColor: '#f6f3feff',
        borderLeftColor: PURPLE
    },
    meTextReplay: {
        color: "#848282ff",
    },
    friendTextReplay: {
        color: "#848282ff",
    },
    replyCloseBtn: {
        marginLeft: 10,
        backgroundColor: "#fff",
        borderColor: "#e5e5e5",
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    viewerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', alignItems: 'center', justifyContent: 'center' },
    topBtn: { 
        marginHorizontal: 6, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        padding: 6, 
        borderRadius: 20,
        zIndex: 1000
    },
    viewerImage: { width: '100%', height: '100%' },
});
