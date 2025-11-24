import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Image,
    TextInput,
    Platform,
    Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeRequest } from "../services/fetchRequest";
import { getFormatoFecha } from "../utils/formatDate";
import { getData } from "../utils/LocalStorage";
import TranslatableText from "../components/TranslatableText";
import Loader from "../components/Loader";
import { pickImageAndGalery } from "../utils/selectImages";
import { useNavigation } from "@react-navigation/native";

export default function ComentariosModal({ visible, onClose, publicacionId, user }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [expandedComments, setExpandedComments] = useState({});
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [userId, setUserId] = useState(0);
    const [comments, setComments] = useState([]);
    const [repliesById, setRepliesById] = useState({});
    const [moreById, setMoreById] = useState({});
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [imagen, setImagen] = useState(null);
    const navigation = useNavigation();
    const pager = 10;

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

        (async () => {
            await getData('idUser', setUserId);
        })();

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    useEffect(() => {
        if (visible && publicacionId) {
            cargarComentarios();
        }
    }, [visible, publicacionId]);

    async function cargarComentarios() {
        setLoading(true);
        try {
            setComments([]);
            setRepliesById({});
            setMoreById({});
            setExpandedComments({});

            const data = await makeRequest(`/comentarios/publicacion/${publicacionId}/0`);
            setHasMore(data.data.length == pager);
            setComments(data.data || []);
        } catch (e) {
            console.log("Error cargando comentarios:", e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    const fmtSize = () => {
        const bytes = imagen.size;

        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };


    const removeImage = () => {
        setImagen(null);
        setSelectedImagen(null);
    };


    function imagenSeleccionada(asset) {
        setSelectedImagen(asset.uri);

        const mime = asset.mimeType ?? 'image/jpeg';
        const ext = mime.split('/')[1] ?? 'jpg';

        const file = {
            uri: asset.uri,
            name: asset.fileName ?? `photo_${Date.now()}.${ext}`,
            type: mime,
            size: asset.fileSize,
        };

        setImagen(file);
    }

    async function loadComments() {
        if (loadingMore || !hasMore || comments.length == 0) return;
        setLoadingMore(true);

        setTimeout(async () => {
            try {
                const totalComments = Math.round(comments.length / pager);
                const data = await makeRequest(`/comentarios/publicacion/${publicacionId}/${totalComments}`);

                setHasMore(data.data.length == pager);
                setComments(prev => [...prev, ...data.data]);
            } finally {
                setLoadingMore(false);
            }
        }, 1000);
    }

    const toggleReplies = async (item) => {
        console.log('verificando');
        if (repliesById[item.comentarioId] === undefined) {
            setRepliesById(prev => ({
                ...prev,
                [item.comentarioId]: []
            }));
            repliesById[item.comentarioId] = [];
            await cargarRespuestas(item);
        }

        setExpandedComments((prev) => ({
            ...prev,
            [item.comentarioId]: !prev[item.comentarioId],
        }));
    };

    const handleSendComment = async () => {
        if (commentText.trim() || imagen) {
            try {
                const info = new FormData();
                info.append('comentarioTexto', commentText);
                info.append('publicacionId', publicacionId);
                info.append('usuarioId', userId);

                if (imagen) {
                    info.append('comentarioImagen', imagen);
                }

                if (replyingTo) {
                    info.append('comentarioId', replyingTo.comentarioId);
                }

                setCommentText("");
                setReplyingTo(null);
                setImagen(null);
                setSelectedImagen(null);

                const data = await makeRequest(`/comentarios/agregar`, { method: 'post' }, info);
                console.log(data.data);
                setComments(prev => [...[data.data], ...prev]);

            } catch (error) {
                console.log(error);
            } finally {
            }
        }
    };

    const goToProfile = (idUsuario) => {
        try { navigation.navigate('Perfil', { idUsuario}); } catch(e) { console.log(e); }
    };

    async function cargarRespuestas(item) {
        try{
            if (moreById[item.comentarioId] ?? true) {
                const data = await makeRequest(`/comentarios/respuestas/${item.comentarioId}/${repliesById[item.comentarioId].length / 20}`);
                
                setRepliesById(prev => ({
                    ...prev,
                    [item.comentarioId]: [...repliesById[item.comentarioId], ...data.data],
                }));

                setMoreById(prev => ({
                    ...prev,
                    [item.comentarioId]: data.data.length == 20,
                }));
            }
        }catch(ex){
            console.log(ex);
        }
    }

    const handleReply = (comment) => {
        setReplyingTo(comment);
    };

    const handleClose = () => {
        setCommentText("");
        setReplyingTo(null);
        setExpandedComments({});
        onClose();
        setSelectedImagen(null);
        setImagen(null);
        setReplyingTo(null)
        setCommentText('');
    };

    const renderComment = ({ item, isReply = false }) => (
        <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
            <Image source={{ uri: item.usuarioImagen }} style={styles.commentAvatar} />

            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <TouchableOpacity onPress={() => goToProfile(item.usuarioId)}>
                        <Text style={styles.commentUser}>{item.usuario}</Text>
                    </TouchableOpacity>
                    <Text style={styles.commentDate}>{getFormatoFecha(item.comentarioCreacion)}</Text>
                </View>

                {item.comentarioTexto && (
                    <TranslatableText text={item.comentarioTexto} keyText={`comentario${item.comentarioId}`}
                        styletext={styles.commentText} />
                )}

                {item.comentarioImagen && (
                    <Image
                        source={{ uri: item.comentarioImagen }}
                        style={{ height: 180, borderRadius: 8, backgroundColor: '#f5f5f5', borderColor: "#d3d3d3ff", borderWidth: 1 }}
                        resizeMode="cover" />
                )}

                {!isReply && (
                    <View style={styles.commentActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleReply(item)}
                        >
                            <Text style={styles.actionText}>Responder</Text>
                        </TouchableOpacity>

                        {item.comentarioRespuestas > 0 && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => toggleReplies(item)}
                            >
                                <Text style={styles.actionText}>
                                    {expandedComments[item.comentarioId]
                                        ? "Ocultar respuestas"
                                        : `Ver ${item.comentarioRespuestas} respuesta${item.comentarioRespuestas > 1 ? "s" : ""
                                        }`}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {!isReply &&
                    expandedComments[item.comentarioId] &&
                    (repliesById[item.comentarioId] ?? []) &&
                    (repliesById[item.comentarioId] ?? []).length > 0 && (
                        <View style={styles.repliesContainer}>
                            {(repliesById[item.comentarioId] ?? []).map((reply) => (
                                <View key={reply.comentarioId} style={styles.replyItem}>
                                    <Image
                                        source={{ uri: reply.usuarioImagen }}
                                        style={styles.replyAvatar}
                                    />
                                    <View style={styles.replyContent}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentUser}>{reply.usuario}</Text>
                                            <Text style={styles.commentDate}>{getFormatoFecha(reply.comentarioCreacion)}</Text>
                                        </View>
                                        <Text style={styles.commentText}>{reply.comentarioTexto}</Text>
                                    </View>
                                </View>
                            ))}

                            {(moreById[item.comentarioId] ?? false) && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => cargarRespuestas(item)}>
                                    <Text style={styles.actionText}>Ver más respuestas</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
            </View>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={[
                    styles.modalContent,
                    keyboardHeight > 0 && { marginBottom: keyboardHeight }
                ]}>

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Comentarios</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={comments}
                        keyExtractor={(item) => item.comentarioId}
                        renderItem={renderComment}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.commentsList}
                        onEndReached={hasMore ? loadComments : null}
                        onEndReachedThreshold={0.4}
                        ListFooterComponent={() => Loader(loadingMore)}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={48}
                                    color="#ccc"
                                />
                                <Text style={styles.emptyText}>
                                    Sé el primero en comentar
                                </Text>
                            </View>
                        }
                    />

                    {selectedImagen && (
                        <View style={styles.fileContent}>
                            <View style={styles.viewFile}>
                                <Image
                                    source={{ uri: selectedImagen }}
                                    style={{ height: 180, borderRadius: 8 }}
                                    resizeMode="cover" />

                                <View style={styles.contentImage}>

                                    <Text numberOfLines={1}
                                        style={{ marginTop: 6, fontSize: 12, fontWeight: '600', maxWidth: 88 }}>
                                        {imagen.name}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: '#6b7280' }}>{fmtSize()}</Text>

                                    <TouchableOpacity onPress={removeImage} style={{
                                        marginTop: 6, backgroundColor: "#ef4444", width: "100%",
                                        padding: 5, borderRadius: 5
                                    }}>
                                        <Text style={{
                                            color: '#fff', fontSize: 14,
                                            textAlign: "center"
                                        }}>Quitar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={styles.inputContainer}>

                        {replyingTo && (
                            <View style={styles.replyingToContainer}>
                                <Text style={styles.replyingToText}>
                                    Respondiendo a {replyingTo.usuario}
                                </Text>
                                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                    <Ionicons name="close-circle" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.inputRow}>
                            <Image
                                source={{ uri: user.usuarioImagen }}
                                style={styles.inputAvatar}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Escribe un comentario..."
                                placeholderTextColor="#999"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />

                            <TouchableOpacity style={styles.iconBtn} onPress={() => pickImageAndGalery(imagenSeleccionada, false)} >
                                <Ionicons name="image-outline" size={22} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!commentText.trim() || !imagen) && styles.sendButtonDisabled,
                                ]}
                                onPress={handleSendComment}
                                disabled={!commentText.trim() && !imagen}
                            >
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color={(commentText.trim() || imagen) ? "#007AFF" : "#ccc"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAFAFA",
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
    },
    commentsButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    commentsButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "100%"
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    commentsList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    commentContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },
    replyContainer: {
        marginLeft: 40,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: "#F0F0F0",
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        gap: 8,
    },
    commentUser: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
    },
    commentDate: {
        fontSize: 12,
        color: "#666",
    },
    commentText: {
        fontSize: 14,
        color: "#000",
        lineHeight: 20,
        marginBottom: 8,
    },
    commentActions: {
        flexDirection: "row",
        gap: 16,
    },
    actionButton: {
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 13,
        color: "#666",
        fontWeight: "600",
    },
    repliesContainer: {
        marginTop: 12,
        gap: 12,
    },
    replyItem: {
        flexDirection: "row",
    },
    replyAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        backgroundColor: "#F0F0F0",
    },
    replyContent: {
        flex: 1,
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        backgroundColor: "#fff",
        paddingBottom: Platform.OS === "ios" ? 20 : 8,
    },
    replyingToContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#F8F8F8",
    },
    replyingToText: {
        fontSize: 13,
        color: "#666",
        fontStyle: "italic",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 10,
    },
    inputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F0F0F0",
    },
    input: {
        flex: 1,
        backgroundColor: "#F0F0F0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        color: "#999",
        textAlign: "center",
        marginTop: 12,
        fontSize: 15,
    },
    iconBtn: {
        marginBottom: 8
    }
});