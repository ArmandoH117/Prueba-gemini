import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert, Animated, Dimensions, FlatList, Image, KeyboardAvoidingView,
    Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View, ActivityIndicator
} from 'react-native';
import { getData } from '../utils/LocalStorage';
import { makeRequest } from "../services/fetchRequest";
import ComentariosModal from './ComentarioScreen';
import { RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import PostImagesGrid from '../components/PostImagesGrid';
import ComposerBtn from '../components/btns/ComposerBtn';
import { pickMultipleImages } from '../utils/selectImages';
import askPerms from '../utils/selectImages';
import FeedItem from '../components/FeedItem';
import MediaPost from '../components/MediaPost';
import { useColorsTheme } from '../theme/colors';
import { homeScrollRef } from "../navigation/AppTabs";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const STORY_DURATION_MS = 3_000;
const MAX_VIDEO_MS = 3_000;
const SCREEN_W = Dimensions.get('window').width;

export default function HomeScreen() {
    const { user, loadingUser, signOut, refreshUser, setUser } = useAuth();
    const navigation = useNavigation();

    const [comentariosVisible, setComentariosVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const handleOpenComentarios = (postId) => {
        setSelectedPostId(postId);
        setComentariosVisible(true);
    };

    // Colores por tema
    const colorsTheme = useColorsTheme();

    // Perfil
    const [avatarUri, setAvatarUri] = useState(null);

    // Historias
    const [stories, setStories] = useState([]);
    const [activeStories, setActiveStories] = useState([]);
    const [historiaActual, setHistoriaActual] = useState([]);
    const hasActiveStory = activeStories.length > 0;

    // Visor historias
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIdx, setViewerIdx] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);

    // Publicaciones
    const [posts, setPosts] = useState([]);
    const [uploadingPost, setUploadingPost] = useState(null);
    const [composerOpen, setComposerOpen] = useState(false);
    const [sharePost, setSharePost] = useState(false);
    const [postText, setPostText] = useState('');
    const [postImages, setPostImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [lstHistorias, setLstHistorias] = useState([]);
    const [postVideo, setPostVideo] = useState(null);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(MAX_VIDEO_MS);
    const [mediaOpen, setMediaOpen] = useState(false);
    const [mediaPost, setMediaPost] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [hasMoreHitorias, setHasMoreHitorias] = useState(true);
    const [loadingHitorias, setLoadingHitorias] = useState(false);

    const loadPosts = useCallback(async (page, isRefresh = false) => {

        if (loading && !isRefresh && user == null) {
            return;
        }

        if (!hasMore && !isRefresh && page > 0) {
            return;
        }

        try {
            setLoading(true);
            let idUser = await getData('idUser', null);

            const url = `/publicaciones/listado/${idUser}/${page}`;

            const result = await makeRequest(url);
            const list = Array.isArray(result.data) ? result.data : [];

            const normalized = list.map(post => normalizePost(post));

            const hasMorePages = normalized.length === 10;
            setHasMore(hasMorePages);

            if (isRefresh || page === 0) {
                setPosts(normalized);
                setCurrentPage(0);
            } else {
                setPosts(prevPosts => [...prevPosts, ...normalized]);
                setCurrentPage(page);
            }

            setAttempted(true);

        } catch (error) {
            console.error('ror loading posts:', error);
            setAttempted(true);
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loading, hasMore, posts.length, user]);

    const cargarHistorias = async () => {
        if (user == null || !hasMoreHitorias || loadingHitorias) return;

        try {
            setLoadingHitorias(true);
            const data = await makeRequest(`/historias/listado/${user.idUsuario}/${Math.round(lstHistorias.length / 10)}`);
            setHasMoreHitorias(data.data.length === 10);

            setLstHistorias(prev => [...prev, ...data.data]);
        } catch (error) {
            console.error('ror loading posts:', error);
        } finally {
            setLoadingHitorias(false);
        }
    };

    useEffect(() => {
        if (user != null) {
            cargarHistorias();
            setAvatarUri(user.usuarioImagen);
        }
    }, [user]);

    const normalizePost = (post) => {
        if (post == undefined) return post;

        return {
            id: post.publicacionId ?? 0,
            authorName: post.usuario ?? 'Usuario no identificado',
            text: post.publicacionContenido ?? '',
            images: Array.isArray(post.imagenes)
                ? post.imagenes
                : (post.imagenes ? [post.imagenes] : []),
            video: post.videos ?? null,
            createdAt: post.publicacionCreacion ?? Date.now(),
            reactions: post.reactions ?? { like: 0, love: 0 },
            myReaction: post.tipoReaccionUsuario ? post.tipoReaccionUsuario : null,
            comments: post.comments ?? [],
            shares: post.shares ?? 0,
            numberComments: post.publicacionComentarios ?? 0,
            numberReactions: post.publicacionReacciones ?? 0,
            usuarioImagen: post.usuarioImagen || avatarUri,
            usuarioId: post.usuarioId,
            publicacionOriginalId: post.publicacionOriginalId,
            publicacionOriginal: normalizePost(post.publicacionOriginal),
        }
    };

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadPosts(currentPage + 1, false);
        }
    }, [loading, hasMore, currentPage, loadPosts]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setHasMore(true);
        setAttempted(false);
        loadPosts(0, true);
    }, [loadPosts]);

    const renderFooter = useCallback(() => {
        if (!loading || refreshing) return null;

        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#60a5fa" />
                <Text style={{ marginTop: 8, fontSize: 14, color: '#999' }}>
                    Cargando más publicaciones...
                </Text>
            </View>
        );
    }, [loading, refreshing]);

    const renderEndMessage = useCallback(() => {
        if (!hasMore && posts.length > 0 && !loading) {
            return (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: '#999', fontStyle: 'italic' }}>
                        Ya viste todas las publicaciones
                    </Text>
                </View>
            );
        }
        return null;
    }, [hasMore, posts.length, loading]);


    useEffect(() => {
        if (posts.length === 0 && !loading && !attempted) {
            loadPosts(0, false);
        }
    }, [posts.length, loading, attempted, loadPosts]);


    const listData = useMemo(() => posts, [posts]);
    useEffect(() => { if (viewerOpen) startProgress(); }, [viewerOpen, viewerIdx, stories.length]);

    if (loadingUser) {
        return <LoadingScreen />
    }

    const guessExt = (uri = '', fallback = 'jpg') =>
        (uri.split('.').pop() || fallback).toLowerCase();


    const normalizeAsset = (asset) => {
        const ext = guessExt(asset.uri);
        const isVideo = asset.type === 'video' || /mp4|mov|mkv|webm/i.test(ext);
        return {
            uri: asset.uri,
            name: (asset.fileName || (isVideo ? `video.${ext}` : `image.${ext}`)),
            type: isVideo ? `video/${ext === 'mov' ? 'quicktime' : 'mp4'}` : `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            size: asset.fileSize ?? 0,
        };
    };

    const pickFromLibrary = async () => {
        if (!(await askPerms())) return null;

        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.95 });

        if (res.canceled) return null;

        return res.assets[0].uri;
    };

    const ImagenesSeleccionadas = (res) => {
        const assets = (res || []).map(normalizeAsset);
        setSelectedImages(prev => [...prev, ...assets]);
        setPostImages(prev => [...prev, ...res.map(a => a.uri)]);
        setPostVideo(null);
        setComposerOpen(true);
    }

    const takePhoto = async () => {
        if (!(await askPerms())) return null;
        const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.95 });
        if (res.canceled) return null;
        return res.assets[0].uri;
    };

    const pickVideoFromLibrary = async () => {
        if (!(await askPerms())) return null;
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 1 });
        if (res.canceled) return null;
        const a = res.assets[0];
        const durationMs = a.duration ? Math.round(a.duration * 1000) : MAX_VIDEO_MS;
        setPostVideo({ uri: a.uri, durationMs });
        setTrimStart(0);
        setTrimEnd(Math.min(durationMs, MAX_VIDEO_MS));
        setComposerOpen(true);
        setPostImages([]);
    };

    /* ===== Historias ===== */
    const addStory = async (asset) => {
        try {
            const mime = asset.mimeType ?? `image/${ext}`;
            const ext = mime.split('.').pop();
            console.log(user);

            const info = new FormData();
            info.append('idUsuario', user.idUsuario);
            info.append('historiaContenido', "");
            info.append('archivoHistoria', {
                uri: asset.uri,
                name: asset.fileName ?? `photo_${Date.now()}.${ext}`,
                type: mime,
                size: asset.fileSize,
            });

            const data = await makeRequest(`/historias/agregar`, { method: 'post' }, info);
            
            setLstHistorias(prev => {
                const index = prev.findIndex(item => item.idUsuario === user.idUsuario);

                if (index === -1) {
                    return [
                        ...prev,
                        {
                            idUsuario: user.idUsuario,
                            nombreUsuario: user.nombreUsuario,
                            historiaUrl: data.data.historiaUrl,
                        },
                    ];
                }

                const copia = [...prev];
                copia[index] = {
                    ...copia[index],
                    historiaUrl: data.data.historiaUrl,
                };

                return copia;
            });

        } catch (error) {
            console.error('ror loading posts:', error);
        } finally {
            setLoadingHitorias(false);
        }
    };

    const handleCreateStory = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            addStory(result.assets[0])
        }
    };

    const handleEditStory = async (idx) => {
        const target = activeStories[idx]; if (!target) return;
        const uri = await pickFromLibrary(); if (!uri) return;
        const updated = stories.map(s => s.id === target.id ? { ...s, uri } : s);
        setStories(updated);

    };

    const handleDeleteStory = async (idx) => {
        const target = activeStories[idx]; if (!target) return;
        const updated = stories.filter(s => s.id !== target.id);
        setStories(updated);
        if (activeStories.length <= 1) closeViewer(); else { const nextIdx = Math.min(idx, activeStories.length - 2); setViewerIdx(nextIdx); restartProgress(); }
    };

    const openViewer = async (item) => {
        if (item.historias == undefined) {
            try {
                const data = await makeRequest(`/historias/usuario/${item.idUsuario}`)
                setActiveStories(data.data || []);
            } catch (ex) {
                return
            }
        } else {
            setActiveStories(item.historias);
        }
        setHistoriaActual(item);
        setViewerIdx(0);
        setViewerOpen(true);
    };

    const closeViewer = () => { setViewerOpen(false); stopProgress(); progress.setValue(0); };

    const startProgress = () => {
        progress.setValue(0);
        Animated.timing(progress, { toValue: 1, duration: STORY_DURATION_MS, useNativeDriver: false })
            .start(({ finished }) => { if (finished) goNext(); });
        timerRef.current && clearTimeout(timerRef.current);
        timerRef.current = setTimeout(goNext, STORY_DURATION_MS + 100);
    };

    const stopProgress = () => { progress.stopAnimation(); timerRef.current && clearTimeout(timerRef.current); };

    const restartProgress = () => { stopProgress(); startProgress(); };

    const goNext = () => { stopProgress(); if (viewerIdx + 1 < activeStories.length) { setViewerIdx(i => i + 1); startProgress(); } else closeViewer(); };
    const goPrev = () => { stopProgress(); if (viewerIdx > 0) { setViewerIdx(i => i - 1); startProgress(); } else closeViewer(); };

    const openComposer = () => { setComposerOpen(true); };

    const resetComposer = () => {
        setPostText('');
        setPostImages([]);
        setPostVideo(null);
        setTrimStart(0);
        setTrimEnd(MAX_VIDEO_MS);
        setComposerOpen(false);
        setSharePost(null);
    };

    const submitPost = async () => {
        if (!postText && postImages.length == 0 && !postVideo) return;

        const userId = await getData('idUser', null);

        if (!userId) {
            Alert.alert('Error', 'No se pudo identificar el usuario');
            return;
        }

        try {

            let filesImagenes = [];
            selectedImages.forEach(asset => filesImagenes.push(normalizeAsset(asset)));

            const formData = new FormData();
            formData.append('usuarioId', userId);
            formData.append('publicacionContenido', postText);

            if (sharePost) {
                if (sharePost.publicacionOriginalId != null && sharePost.publicacionOriginalId > 0) {
                    formData.append('publicacionOriginalId', sharePost.publicacionOriginalId);
                } else {
                    formData.append('publicacionOriginalId', sharePost.id);
                }
            }

            if (filesImagenes.length > 0) {
                filesImagenes.forEach(file => {
                    console.log(file);
                    formData.append('filesImagenes', {
                        uri: file.uri,
                        name: file.name,
                        type: file.type,
                    });
                });
            }

            if (postVideo) {
                const file = normalizeAsset(postVideo);

                formData.append('filesVideos', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                });
            }

            const newPost = {
                authorName: `${user.nombreUsuario || 'Tu'} ${user.apellidoUsuario || ''}`,
                text: postText,
                images: postImages,
                video: postVideo,
                createdAt: Date.now(),
                reactions: { like: 0, love: 0 },
                myReaction: null,
                comments: [],
                shares: 0,
                numberComments: 0,
                numberReactions: 0,
                usuarioId: userId,
                usuarioImagen: user.usuarioImagen || avatarUri,
            };

            setUploadingPost(newPost);
            resetComposer();

            const result = await makeRequest(`/publicaciones/publicacion`, {
                method: 'POST',
            }, formData);

            if (sharePost) {
                newPost.publicacionOriginal = sharePost;
                newPost.publicacionOriginalId = sharePost.id;
                const next = posts.map(p => (p.id === sharePost.id ? { ...p, shares: (p.shares || 0) + 1 } : p));
                setPosts(next);
            }

            setSharePost(null);
            setUploadingPost(null);
            newPost.id = result.data;
            setPosts(prevPosts => [newPost, ...prevPosts]);

        } catch (error) {
            setUploadingPost(null);
            console.error('Error al crear post:', error);
            Alert.alert('Error', 'No se pudo crear la publicación');
        }
        setSelectedImages([]);
    };

    const openShare = (item) => {
        setSharePost(item);
        setComposerOpen(true);
    }

    const goToProfile = async () => {
        const userId = await getData('idUser', null);
        try { navigation.navigate('Perfil', { idUsuario: userId }); } catch { }
    };

    /* ===== UI ===== */

    // --- ComposerBar ---
    function ComposerBar() {
        return (
            <View style={[styles.card, { backgroundColor: colorsTheme.CARD, borderColor: colorsTheme.BORDER, paddingVertical: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => goToProfile()}>
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.inputFake, { backgroundColor: colorsTheme.CHIP }]} onPress={openComposer}>
                        <Text style={{ color: colorsTheme.MUTED }}>¿Qué estás pensando?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={async () => pickMultipleImages(ImagenesSeleccionadas)}>
                        <MaterialCommunityIcons name="image-plus" size={22} color={colorsTheme.BLUE} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickVideoFromLibrary}>
                        <MaterialCommunityIcons name="video-plus-outline" size={22} color={colorsTheme.BLUE} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const AddStoryContent = () => {
        return (
            <TouchableOpacity style={[styles.storyCard, { backgroundColor: colorsTheme.CARD }]} onPress={handleCreateStory}>
                <View style={styles.storyCreateImage}>
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="image-outline" size={26} color={colorsTheme.MUTED} />
                        </View>
                    )}
                </View>
                <View style={styles.storyCreateFooter}>
                    <View style={styles.storyPlus}>
                        <Ionicons name="add" size={18} color="#fff" />
                    </View>
                    <Text style={{ color: colorsTheme.TEXT, fontWeight: '600' }}>Crear historia</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const ItemStoryRail = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.storyCard, { backgroundColor: colorsTheme.CARD }]} onPress={() => openViewer(item)}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={{ uri: item.historiaUrl || avatarUri }}
                        style={{ width: '100%', height: '100%', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
                    />
                    {hasActiveStory && (
                        <View style={styles.storyBadge}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{activeStories.length}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.storyUserFooter}>
                    <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '700' }}>{item.nombreUsuario}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const StoryRail = () => (
        <View style={{ paddingVertical: 10 }}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
                data={lstHistorias}
                keyExtractor={(item) => item.idUsuario}
                ListHeaderComponent={() => (<AddStoryContent />)}
                renderItem={({ item }) => <ItemStoryRail item={item} />}
            />
        </View>
    );

    const MediaPostSetter = (props) => {
        setMediaOpen(true);
        setMediaPost(props)
    }

    const UploadingPost = () => {
        if (uploadingPost) {
            return <FeedItem post={uploadingPost} uploading={true} postItem={false} avatarUri={avatarUri}
                user={user} />
        }

        return <></>
    };

    return (
        <View style={[styles.container, { backgroundColor: colorsTheme.BG }]}>
            <ComentariosModal
                visible={comentariosVisible}
                onClose={() => setComentariosVisible(false)}
                publicacionId={selectedPostId}
                user={user}
            />

            <FlatList
                data={listData}
                ref={homeScrollRef}
                keyExtractor={(item) => `post-${item.id}`}
                renderItem={({ item }) => <FeedItem post={item} setMediaPost={MediaPostSetter} openShare={openShare} user={user}
                    handleOpenComentarios={handleOpenComentarios} setPosts={setPosts} posts={posts} avatarUri={avatarUri} />}
                ListHeaderComponent={() => (
                    <>
                        <ComposerBar />
                        <StoryRail />
                        <UploadingPost />
                    </>
                )}
                contentContainerStyle={{ paddingBottom: 60, gap: 10 }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#60a5fa']}
                        tintColor="#60a5fa"
                    />
                }
                ListFooterComponent={() => (
                    <>
                        {renderFooter()}
                        {renderEndMessage()}
                    </>
                )}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
            />

            {/* Composer modal */}
            <Modal visible={composerOpen} animationType="slide" onRequestClose={resetComposer}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colorsTheme.BG }}>
                    <View style={[styles.card, { backgroundColor: colorsTheme.CARD, borderBottomWidth: 0, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <TouchableOpacity onPress={resetComposer}><Ionicons name="close" size={26} color={colorsTheme.TEXT} /></TouchableOpacity>
                        <Text style={{ color: colorsTheme.TEXT, fontWeight: '700' }}>Crear publicación</Text>
                        <TouchableOpacity onPress={submitPost}><Text style={{ color: colorsTheme.BLUE, fontWeight: '700' }}>Publicar</Text></TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={{ uri: avatarUri }} style={styles.postAvatar} />
                            <Text style={{ color: colorsTheme.TEXT, fontWeight: '700' }}>{`${user.nombreUsuario || 'Usuario no identificado'} ${user.apellidoUsuario || ''}`}</Text>
                        </View>

                        <TextInput
                            placeholder="¿Qué estás pensando?"
                            placeholderTextColor={colorsTheme.MUTED}
                            value={postText}
                            onChangeText={setPostText}
                            style={{ color: colorsTheme.TEXT, fontSize: 16, minHeight: 120, textAlignVertical: 'top' }}
                            multiline
                        />

                        {/* preview imágenes múltiples */}
                        {postImages.length > 0 && (
                            <PostImagesGrid images={postImages} onPressIndex={(i) => { setMediaPost({ images: postImages, index: i }); setMediaOpen(true); }} />
                        )}

                        {/* preview video + recorte */}
                        {postVideo ? (
                            <View style={{ backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' }}>
                                <Video source={{ uri: postVideo.uri }} style={{ width: '100%', height: 280 }} resizeMode="contain" useNativeControls />
                                {postVideo.durationMs > MAX_VIDEO_MS && (
                                    <View style={{ padding: 10, gap: 8 }}>
                                        <Text style={{ color: colorsTheme.TEXT, fontWeight: '700' }}>Recortar (máx. 30s)</Text>
                                        <Text style={{ color: colorsTheme.MUTED }}>Inicio: {(trimStart / 1000).toFixed(1)}s • Fin: {(trimEnd / 1000).toFixed(1)}s</Text>
                                        <Slider value={trimStart} minimumValue={0} maximumValue={Math.max(0, postVideo.durationMs - 1000)} step={500} onValueChange={(v) => setTrimStart(Math.min(v, trimEnd - 1000))} />
                                        <Slider value={trimEnd} minimumValue={1000} maximumValue={postVideo.durationMs} step={500} onValueChange={(v) => setTrimEnd(Math.max(v, trimStart + 1000))} />
                                        <Text style={{ color: colorsTheme.MUTED }}>Ventana: {((trimEnd - trimStart) / 1000).toFixed(1)}s / {(postVideo.durationMs / 1000).toFixed(1)}s</Text>
                                    </View>
                                )}
                            </View>
                        ) : null}

                        {sharePost ? (
                            <FeedItem post={sharePost} postItem={false} avatarUri={avatarUri} user={user} />
                        )
                            : (

                                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    <ComposerBtn icon="image-outline" label="Fotos" onPress={async () => pickMultipleImages(ImagenesSeleccionadas)} />
                                    <ComposerBtn icon="camera-outline" label="Cámara" onPress={async () => {
                                        const uri = await takePhoto();
                                        if (uri) { setPostImages(prev => [...prev, uri]); setPostVideo(null); }
                                    }} />
                                    <ComposerBtn icon="videocam-outline" label="Video" onPress={pickVideoFromLibrary} />
                                    {(postImages.length > 0 || postVideo) ? <ComposerBtn icon="close-outline" label="Quitar media" onPress={() => { setPostImages([]); setPostVideo(null); }} /> : null}
                                </View>
                            )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            {/* Visor de historias */}
            <Modal transparent visible={viewerOpen} animationType="fade" onRequestClose={closeViewer}>
                <View style={styles.viewerBackdrop}>
                    <Pressable style={styles.tapLeft} onPress={goPrev} />
                    <Pressable style={styles.tapRight} onPress={goNext} />
                    {activeStories[viewerIdx] && (
                        <Image source={{ uri: activeStories[viewerIdx] }} style={styles.viewerImage} resizeMode="contain" />
                    )}
                    <View style={styles.viewerTopBar}>
                        <View style={styles.progressRow}>
                            {activeStories.map((_, i) => (
                                <View key={i} style={styles.progressTrack}>
                                    <Animated.View
                                        style={[
                                            styles.progressFill,
                                            i < viewerIdx && { width: '100%' },
                                            i === viewerIdx && { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                                        ]}
                                    />
                                </View>
                            ))}
                        </View>

                        {user.idUsuario == historiaActual.idUsuario && (
                            <View style={{ position: 'absolute', right: 8, top: 44, flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => handleEditStory(viewerIdx)} style={styles.topBtn}><Ionicons name="create-outline" size={22} color="#fff" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => Alert.alert('Eliminar historia', '¿Quieres eliminar esta historia?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => handleDeleteStory(viewerIdx) }])} style={styles.topBtn}><Ionicons name="trash-outline" size={22} color="#fff" /></TouchableOpacity>
                                <TouchableOpacity onPress={closeViewer} style={styles.topBtn}><Ionicons name="close" size={26} color="#fff" /></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <MediaPost mediaPost={mediaPost} setMediaOpen={setMediaOpen} mediaOpen={mediaOpen} />

        </View>
    );
}

/* ===== Estilos ===== */
const STORY_W = 110;
const STORY_H = 180;

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 30 },
    card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginHorizontal: 10, marginTop: 10, padding: 12 },

    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ccc' },
    inputFake: { flex: 1, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 12 },

    storyCard: { width: STORY_W, height: STORY_H, borderRadius: 16, overflow: 'hidden' },
    storyCreateImage: { flex: 1 },
    storyCreateFooter: { height: 58, alignItems: 'center', justifyContent: 'center', gap: 8 },
    storyPlus: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
    storyUserFooter: { position: 'absolute', bottom: 8, left: 8, right: 8 },
    storyBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },

    postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
    postImage: { width: '100%', height: 260, borderRadius: 8, marginTop: 6 },

    viewerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', alignItems: 'center', justifyContent: 'center' },
    viewerImage: { width: '100%', height: '100%' },
    viewerTopBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 44, paddingBottom: 8 },
    progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 8 },
    progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#fff' },
    tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%' },
    tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%' },

    topBtn: {
        marginHorizontal: 6, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 20,
        zIndex: 1000
    },
});