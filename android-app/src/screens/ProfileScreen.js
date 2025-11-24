import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { use, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
    Alert, Animated, Platform, ScrollView,
    Dimensions, KeyboardAvoidingView,
    FlatList, Image, Modal, Pressable, StyleSheet, Text,
    TouchableOpacity, View, ActivityIndicator, TextInput
} from 'react-native';
import { getData } from '../utils/LocalStorage';
import { bus } from '../utils/bus';
import { makeRequest } from "../services/fetchRequest";
import { RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import ComentariosModal from './ComentarioScreen';
import PostImagesGrid from '../components/PostImagesGrid';
import FeedItem from '../components/FeedItem';
import ComposerBtn from '../components/btns/ComposerBtn';
import MediaPost from '../components/MediaPost';
import { profileScrollRef } from "../navigation/AppTabs";

const AVATAR_SIZE = 96;
const COVER_H = 170;
const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const STORY_DURATION_MS = 3000;
const MAX_VIDEO_MS = 3_000;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const FRIEND_STATUS = {
    NONE: 'NINGUNA',
    ENVIADA: 'ENVIADA',
    RESPONDER: 'RESPONDER',
    AMIGOS: 'AMIGOS',
    RECHAZADA: 'RECHAZADA'
};

export default function ProfileScreen({ navigation }) {

    const route = useRoute();
    const { user, loadingUser, signOut, refreshUser, setUser } = useAuth();

    const visitedUserIdP = route.params?.idUsuario;
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const { dark } = useTheme();
    const text = dark ? '#fff' : '#111';
    const SHEET = dark ? '#1a1a1a' : '#f7f7f7';

    const BG = dark ? '#0f0f10' : '#f4f4f5';
    const CARD = dark ? '#18181b' : '#ffffff';
    const TEXT = dark ? '#fff' : '#0f172a';
    const MUTED = dark ? '#a1a1aa' : '#6b7280';
    const BORDER = dark ? '#242426' : '#e5e7eb';
    const CHIP = dark ? '#222227' : '#f2f2f2';
    const BLUE = '#3b82f6';

    const [visitedUserId, setVisitedUserId] = useState(0);
    const [profile, setProfile] = useState();
    const [avatarUri, setAvatarUri] = useState(null);
    const [coverUri, setCoverUri] = useState(null);
    const [countFriends, setCountFriends] = useState('No tiene');
    const [activeTab, setActiveTab] = useState('all');
    const [allPosts, setAllPosts] = useState([]);
    const [photoPosts, setPhotoPosts] = useState([]);
    const [reelPosts, setReelPosts] = useState([]);
    const [allPage, setAllPage] = useState(0);
    const [photoPage, setPhotoPage] = useState(0);
    const [reelPage, setReelPage] = useState(0);
    const [allHasMore, setAllHasMore] = useState(true);
    const [photoHasMore, setPhotoHasMore] = useState(true);
    const [reelHasMore, setReelHasMore] = useState(true);
    const [allLoading, setAllLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [reelLoading, setReelLoading] = useState(false);
    const [allRefreshing, setAllRefreshing] = useState(false);
    const [photoRefreshing, setPhotoRefreshing] = useState(false);
    const [reelRefreshing, setReelRefreshing] = useState(false);
    const [allAttempted, setAllAttempted] = useState(false);
    const [photoAttempted, setPhotoAttempted] = useState(false);
    const [reelAttempted, setReelAttempted] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null);
    const [solicitudId, setSolicitudId] = useState(null);
    const [typeList, setTypeList] = useState(null);
    const [estadoAmistad, setEstadoAmistad] = useState(null);
    const [userId, setUserId] = useState(0);
    const [respondSheetOpen, setRespondSheetOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [menuPos, setMenuPos] = useState(0);
    const optionsBtnRef = useRef(null);
    const insets = useSafeAreaInsets();
    const [comentariosVisible, setComentariosVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [composerOpen, setComposerOpen] = useState(false);
    const [sharePost, setSharePost] = useState(false);
    const [mediaPost, setMediaPost] = useState(null);
    const [mediaOpen, setMediaOpen] = useState(false);
    /* Historias */
    const [stories, setStories] = useState([]);

    /* Sheets + visor historias */
    const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
    const [coverSheetOpen, setCoverSheetOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);

    /* POSTS + pestañas */
    const [posts, setPosts] = useState([]);
    const [postText, setPostText] = useState('');
    const [postVideo, setPostVideo] = useState(null);
    const [postImages, setPostImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(MAX_VIDEO_MS);

    /* ===== Visor de FOTOS (pestaña Fotos) ===== */
    const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);   // índice global dentro de todas las fotos

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


    const MediaPostSetter = (props) => {
        setMediaOpen(true);
        setMediaPost(props)
    }

    useEffect(() => {
        setVisitedUserId(visitedUserIdP);
        getData('idUser', setUserId);
    }, [])

    useEffect(() => {
        if (userId != 0 && visitedUserId != 0) {
            setIsOwnProfile(userId == visitedUserId);
        }
    }, [userId, visitedUserId])

    const loadPostsByTab = useCallback(async (tabType, pageNum, isRefresh = false) => {
        if (userId == 0 || visitedUserId == 0) return;
        let loading, setLoading, hasMore, setHasMore, setPosts, setPage, posts, currentPage, setAttempted;

        switch (tabType) {
            case 'all':
                loading = allLoading;
                setLoading = setAllLoading;
                hasMore = allHasMore;
                setHasMore = setAllHasMore;
                setPosts = setAllPosts;
                setPage = setAllPage;
                posts = allPosts;
                currentPage = allPage;
                setAttempted = setAllAttempted;
                break;
            case 'photos':
                loading = photoLoading;
                setLoading = setPhotoLoading;
                hasMore = photoHasMore;
                setHasMore = setPhotoHasMore;
                setPosts = setPhotoPosts;
                setPage = setPhotoPage;
                posts = photoPosts;
                currentPage = photoPage;
                setAttempted = setPhotoAttempted;
                break;
            case 'reels':
                loading = reelLoading;
                setLoading = setReelLoading;
                hasMore = reelHasMore;
                setHasMore = setReelHasMore;
                setPosts = setReelPosts;
                setPage = setReelPage;
                posts = reelPosts;
                currentPage = reelPage;
                setAttempted = setReelAttempted;
                break;
            default:
                return;
        }

        if (loading && !isRefresh) {
            return;
        }

        if (!hasMore && !isRefresh && pageNum > 0) {
            return;
        }

        try {
            setLoading(true);

            let url;
            if (tabType === 'photos') {
                url = `/publicaciones/publicaciones-usuario/${visitedUserId}/fotos/${pageNum}`;
            } else if (tabType === 'reels') {
                url = `/publicaciones/publicaciones-usuario/${visitedUserId}/reels/${pageNum}`;
            } else {
                url = `/publicaciones/publicaciones-usuario/${visitedUserId}/${pageNum}`;
            }

            const result = await makeRequest(url);
            const list = Array.isArray(result.data) ? result.data : [];
            let normalized = [];

            if (tabType === 'photos') {
                normalized = list.map(post => ({
                    id: post.imagenPublicacionId ?? 0,
                    uri: post.publicacionImagenUrl
                }));
            } else if (tabType === 'reels') {
                normalized = list.map(post => ({
                    id: post.imagenPublicacionId ?? 0,
                    uri: post.publicacionImagenUrl
                }));
            } else {
                normalized = list.map(post => (normalizePost(post)));
            }

            const hasMorePages = normalized.length === 10;
            setHasMore(hasMorePages);

            if (isRefresh || pageNum === 0) {
                setPosts(normalized);
                setPage(0);
            } else {
                setPosts(prevPosts => [...prevPosts, ...normalized]);
                setPage(pageNum);
            }

            setAttempted(true);
        } catch (error) {
            setAttempted(true);
            setHasMore(false);
            console.error(`Error loading ${tabType}:`, error);
            Alert.alert('Error', 'No se pudieron cargar las publicaciones');
        } finally {
            setLoading(false);
            if (tabType === 'all') setAllRefreshing(false);
            if (tabType === 'photos') setPhotoRefreshing(false);
            if (tabType === 'reels') setReelRefreshing(false);
        }
    }, [
        allLoading, allHasMore, allPosts, allPage,
        photoLoading, photoHasMore, photoPosts, photoPage,
        reelLoading, reelHasMore, reelPosts, reelPage, userId, visitedUserId
    ]);

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
        };
    };

    const handleLoadMore = useCallback(() => {
        let loading, hasMore, currentPage;

        switch (activeTab) {
            case 'all':
                loading = allLoading;
                hasMore = allHasMore;
                currentPage = allPage;
                break;
            case 'photos':
                loading = photoLoading;
                hasMore = photoHasMore;
                currentPage = photoPage;
                break;
            case 'reels':
                loading = reelLoading;
                hasMore = reelHasMore;
                currentPage = reelPage;
                break;
            default:
                return;
        }

        if (!loading && hasMore) {
            loadPostsByTab(activeTab, currentPage + 1, false);
        }
    }, [
        activeTab,
        allLoading, allHasMore, allPage,
        photoLoading, photoHasMore, photoPage,
        reelLoading, reelHasMore, reelPage,
        loadPostsByTab
    ]);

    const handleRefresh = useCallback(() => {
        switch (activeTab) {
            case 'all':
                setAllRefreshing(true);
                setAllHasMore(true);
                break;
            case 'photos':
                setPhotoRefreshing(true);
                setPhotoHasMore(true);
                break;
            case 'reels':
                setReelRefreshing(true);
                setReelHasMore(true);
                break;
        }

        loadPostsByTab(activeTab, 0, true);
    }, [activeTab, loadPostsByTab]);

    const renderFooter = useCallback(() => {
        let loading, refreshing;

        switch (activeTab) {
            case 'all':
                loading = allLoading;
                refreshing = allRefreshing;
                break;
            case 'photos':
                loading = photoLoading;
                refreshing = photoRefreshing;
                break;
            case 'reels':
                loading = reelLoading;
                refreshing = reelRefreshing;
                break;
            default:
                return null;
        }

        if (!loading || refreshing) return null;

        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#60a5fa" />
                <Text style={{ marginTop: 8, fontSize: 14, color: '#999' }}>
                    Cargando más...
                </Text>
            </View>
        );
    }, [
        activeTab,
        allLoading, allRefreshing,
        photoLoading, photoRefreshing,
        reelLoading, reelRefreshing
    ]);

    useEffect(() => {
        let posts, loading, attempted;

        switch (activeTab) {
            case 'all':
                posts = allPosts;
                loading = allLoading;
                attempted = allAttempted;
                break;
            case 'photos':
                posts = photoPosts;
                loading = photoLoading;
                attempted = photoAttempted;
                break;
            case 'reels':
                posts = reelPosts;
                loading = reelLoading;
                attempted = reelAttempted;
                break;
            default:
                return;
        }

        if (posts.length === 0 && !loading && !attempted) {
            loadPostsByTab(activeTab, 0, false);
        }

    }, [
        activeTab,
        allPosts.length, allLoading, allAttempted,
        photoPosts.length, photoLoading, photoAttempted,
        reelPosts.length, reelLoading, reelAttempted,
        loadPostsByTab
    ]);

    const currentData = useMemo(() => {
        if (activeTab === 'all') return allPosts;
        if (activeTab === 'photos') return photoPosts;
        if (activeTab === 'reels') return reelPosts;

        return [];
    }, [activeTab, allPosts, photoPosts, reelPosts]);

    const currentPhotosFlat = useMemo(() => {
        const arr = [];
        photoPosts.forEach(p => {
            const imgs = Array.isArray(p.images) ? p.images : (p.imageUri ? [p.imageUri] : []);
            imgs.forEach(uri => arr.push({ uri, postId: p.id }));
        });

        reelPosts.forEach(p => {
            const imgs = Array.isArray(p.images) ? p.images : (p.imageUri ? [p.imageUri] : []);
            imgs.forEach(uri => arr.push({ uri, postId: p.id }));
        });

        allPosts.forEach(p => {
            const imgs = Array.isArray(p.images) ? p.images : (p.imageUri ? [p.imageUri] : []);
            imgs.forEach(uri => arr.push({ uri, postId: p.id }));
        })

        return arr;
    }, [photoPosts, allPosts, reelPosts]);

    // ← NUEVO: ref del carrusel del visor
    const photoListRef = useRef(null);

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

            if(sharePost){
                if(sharePost.publicacionOriginalId != null && sharePost.publicacionOriginalId > 0){
                    formData.append('publicacionOriginalId', sharePost.publicacionOriginalId);
                }else{
                    formData.append('publicacionOriginalId', sharePost.id);
                }
            }

            if (filesImagenes.length > 0) {
                filesImagenes.forEach(file => {
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
                usuarioImagen: user.usuarioImagen || avatarUri,
            };

            resetComposer();

            const result = await makeRequest(`/publicaciones/publicacion`, {
                method: 'POST',
            }, formData);

            if(sharePost){
                newPost.publicacionOriginal = sharePost;
                newPost.publicacionOriginalId = sharePost.id;
                const next = posts.map(p => (p.id === sharePost.id ? { ...p, shares: (p.shares || 0) + 1 } : p));
                setPosts(next);
            }

            setSharePost(null);
            newPost.id = result.data;
            setPosts(prevPosts => [newPost, ...prevPosts]);

        } catch (error) {
            console.error('Error al crear post:', error);
            Alert.alert('Error', 'No se pudo crear la publicación');
        }
        setSelectedImages([]);
    };

    const loadBase = useCallback(async () => {
        try {
            if (userId == 0 || visitedUserId == 0) return;

            const infoSolicitud = {
                usuarioId: userId,
                usuarioPerfilId: visitedUserId
            }

            const data = await makeRequest(`/usuarios/perfil`, { method: 'post' }, infoSolicitud);

            setProfile((data.data.nombreUsuario || 'Usuario no identificado') + ' ' + (data.data.apellidoUsuario || ''));
            setAvatarUri(data.data.usuarioImagenUrl || null);
            setCoverUri(data.data.usuarioImagenCoverUrl || null);
            setRequestStatus(data.data.tipoSolicitud || 'NINGUNA');
            setSolicitudId(data.data.solicitudId || null);
            setCountFriends(data.data.cantidadAmistades || 'No tiene');
            setStories(data.data.historias || []);
        } catch (error) {
            console.error('Error cargando perfil:', error);
        }
    }, [userId, visitedUserId]);

    useEffect(() => { loadBase(); }, [loadBase]);

    /* ===== Permisos + helpers ===== */
    const askMedia = async () => {
        const c = await ImagePicker.requestCameraPermissionsAsync();
        const l = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (c.status !== 'granted' && l.status !== 'granted') {
            Alert.alert('Permiso requerido', 'Activa el acceso a cámara/galería para continuar.');
            return false;
        }
        return true;
    };

    const pickFromLibrary = async (cb) => {
        if (!(await askMedia())) return;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.95
        });
        if (!res.canceled) cb(res.assets[0]);
    };


    const takePhoto = async (cb) => {
        if (!(await askMedia())) return;
        const res = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.95
        });
        if (!res.canceled) cb(res.assets[0]);
    };


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

    const updateAvatar = async (asset) => {
        try {
            const normalized = normalizeAsset(asset);

            const formData = new FormData();
            formData.append('idUsuario', userId);
            formData.append('perfil', {
                uri: normalized.uri,
                type: normalized.type,
                name: normalized.name,
            });

            const data = await makeRequest(`/usuarios/update-image`, { method: 'post' }, formData);

            if (data.message?.length > 0) {
                Alert.alert("Error", data.message);
            } else {
                setUser({
                    ...user,
                    usuarioImagen: data.data.usuarioImagenUrl,
                });
                setAvatarUri(data.data.usuarioImagenUrl || "");
            }
            bus.emit('profile:updated');
        } catch (err) {
            Alert.alert("Error", "No se pudo actualizar la imagen de perfil.");
        }
    };

    const updateCover = async (asset) => {
        try {
            const normalized = normalizeAsset(asset);

            const formData = new FormData();
            formData.append('idUsuario', userId);
            formData.append('cover', {
                uri: normalized.uri,
                type: normalized.type,
                name: normalized.name,
            });

            const data = await makeRequest(`/usuarios/update-image`, { method: 'post' }, formData);

            if (data.message?.length > 0) {
                Alert.alert("Error", data.message);
            } else {
                setCoverUri(data.data.usuarioImagenCoverUrl || "");
            }
            bus.emit('profile:updated');
        } catch (err) {
            Alert.alert("Error", "No se pudo actualizar la imagen de perfil.");
        }
    };

    /* Historias */

    const handleAddStory = () => {
        pickFromLibrary((asset) => {
            addStory(asset);
        });
    };

    const addStory = async (asset) => {
        try {
            const mime = asset.mimeType ?? `image/${ext}`;
            const ext = mime.split('.').pop();

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
            setStories(prev => [...prev, data.data.historiaUrl]);
        } catch (error) {
            console.error('ror loading posts:', error);
        } finally {
            setLoadingHitorias(false);
        }
    };

    const deleteStoryAt = async (idx) => {
        const target = stories[idx];
        if (!target) return;
        const remaining = stories.filter(s => s.id !== target.id);
        setStories(remaining);

        if (stories.length <= 1) closeViewer();
        else { const nextIdx = Math.min(idx, stories.length - 2); setViewerIndex(nextIdx); restartProgress(); }
    };

    const editStoryAt = async (idx) => {
        const target = stories[idx];
        if (!target) return;
        pickFromLibrary(async (uri) => {
            const upd = stories.map(s => s.id === target.id ? { ...s, uri } : s);
            setStories(upd);

            restartProgress();
        });
    };

    const openStoriesViewer = () => { if (stories.length > 0) { setViewerIndex(0); setViewerOpen(true); } };
    const closeViewer = () => { setViewerOpen(false); stopProgress(); progress.setValue(0); };
    const startProgress = () => {
        progress.setValue(0);
        Animated.timing(progress, { toValue: 1, duration: STORY_DURATION_MS, useNativeDriver: false })
            .start(({ finished }) => { if (finished) goNextStory(); });
        timerRef.current && clearTimeout(timerRef.current);
        timerRef.current = setTimeout(goNextStory, STORY_DURATION_MS + 100);
    };
    const stopProgress = () => { progress.stopAnimation(); timerRef.current && clearTimeout(timerRef.current); };
    const restartProgress = () => { stopProgress(); startProgress(); };
    const goNextStory = () => { stopProgress(); if (viewerIndex + 1 < stories.length) { setViewerIndex(i => i + 1); startProgress(); } else closeViewer(); };
    const goPrevStory = () => { stopProgress(); if (viewerIndex > 0) { setViewerIndex(i => i - 1); startProgress(); } else closeViewer(); };
    useEffect(() => { if (viewerOpen) startProgress(); }, [viewerOpen, viewerIndex, stories.length]);

    if (visitedUserId == 0 || userId == 0) {
        return <LoadingScreen />
    }

    async function solicitarAmistad() {
        try {
            if (userId == 0) { return }

            const infoSolicitud = {
                solicitudId: visitedUserId,
                idUsuario: userId
            }

            const data = await makeRequest(`/amistades/solicitud`, { method: 'post' }, infoSolicitud);

            if (data.data && Number.isInteger(data.data)) {
                Alert.alert("KUSKATAN", `Se ha enviado la solicitud de amistad `);
                setRequestStatus('ENVIADA');
                setSolicitudId(data.data);
            } else {
                Alert.alert("KUSKATAN", "No fue posible procesar la solicitud");
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function cambiarEstadoSolicitud(estado) {
        try {
            const data = await makeRequest(`/amistades/aceptar-rechazar/${solicitudId}/${estado}`);

            if (data.data) {
                setRequestStatus('AMIGOS');
            } else {
                setRequestStatus('NINGUNA');
                Alert.alert("KUSKATAN", "No fue posible procesar la solicitud");
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function cancelarSolicitud() {
        try {
            const data = await makeRequest(`/amistades/cancelar/${solicitudId}`);

            if (data.data) {
                setRequestStatus('NINGUNA');
                Alert.alert("KUSKATAN", `Has cancelado la solicitud de amistad`);
            } else {
                Alert.alert("KUSKATAN", "No fue posible procesar la solicitud");
            }

        } catch (e) {
            console.log(e);
        }
    }

    const eliminarAmistad = () => {
        Alert.alert(
            "Eliminar amigo",
            `¿Seguro que quieres eliminar a ${profile}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const info = {
                                idUsuario: userId,
                                solicitudId: visitedUserId,
                            };

                            const data = await makeRequest(
                                `/amistades/eliminar`,
                                { method: "post" },
                                info
                            );

                            if (data.data) {
                                setRequestStatus('NINGUNA');
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    },
                },
            ]
        );
    };

    const silenciarAmistad = async () => {

        try {
            const info = {
                idUsuario: userId,
                solicitudId: visitedUserId,
                silenciarAmistad: !estadoAmistad
            };

            const data = await makeRequest(
                `/amistades/silenciar`,
                { method: "post" },
                info
            );

            if (data.data) {
                setEstadoAmistad(!estadoAmistad);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleGoToFriends = () => {
        navigation.navigate('Friends', {
            screen: 'friends',
            params: { userProfileId: visitedUserId },
        });
    };

    const showImgVideosTab = (type, index) => {
        setTypeList(type);
        setPhotoIndex(index);
        setPhotoViewerOpen(true);
    };

    const handleOpenComentarios = (postId) => {
        setSelectedPostId(postId);
        setComentariosVisible(true);
    };

    const openShare = (item) => {
        setSharePost(item);
        setComposerOpen(true);
    }

    const renderHeader = () => (
        <>
            <View style={[styles.coverWrap, { backgroundColor: CARD }]}>
                {coverUri ? (
                    <Pressable onPress={() => setCoverSheetOpen(true)} style={styles.cover}>
                        <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
                    </Pressable>
                ) : (
                    <TouchableOpacity style={[styles.cover, styles.coverEmpty]} onPress={() => setCoverSheetOpen(true)}>
                        <Ionicons name="camera" size={26} color={MUTED} />
                        <Text style={[styles.coverHint, { color: MUTED }]}>Agregar portada</Text>
                    </TouchableOpacity>
                )}
                {coverUri && (
                    <TouchableOpacity style={styles.camCoverBtn} onPress={() => pickFromLibrary(updateCover)}>
                        <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                )}

                <View style={styles.avatarAnchor}>
                    {stories.length > 0 ? (
                        <LinearGradient
                            colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.storyRing}
                        >
                            <Pressable onPress={() => setAvatarSheetOpen(true)} style={styles.avatarWrap}>
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarEmpty]}>
                                        <Ionicons name="camera" size={18} color={MUTED} />
                                    </View>
                                )}

                                {userId == visitedUserId && (
                                    <TouchableOpacity style={styles.camAvatarBtn} onPress={() => pickFromLibrary(updateAvatar)}>
                                        <Ionicons name="camera" size={14} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </Pressable>
                        </LinearGradient>
                    ) : (
                        <Pressable onPress={() => setAvatarSheetOpen(true)} style={[styles.avatarWrap, { borderColor: BG }]}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarEmpty]}>
                                    <Ionicons name="camera" size={18} color={MUTED} />
                                </View>
                            )}

                            {userId == visitedUserId && (
                                <TouchableOpacity style={styles.camAvatarBtn} onPress={() => pickFromLibrary(updateAvatar)}>
                                    <Ionicons name="camera" size={14} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Info */}
            <View style={[styles.info, { paddingTop: AVATAR_SIZE / 2 + 8 }]}>
                <Text style={[styles.name, { color: text }]}>{profile || 'Usuario'}</Text>
                <TouchableOpacity onPress={handleGoToFriends}>
                    <Text style={[styles.subtitle, { color: MUTED }]}>{countFriends} amigos</Text>
                </TouchableOpacity>
            </View>

            {/* Botones de acciones */}
            <View style={styles.actionsRow}>
                {userId != visitedUserId && visitedUserId > 0 ? (
                    <>
                        {requestStatus === FRIEND_STATUS.NONE && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#3b82f6', flex: 1 }]}
                                onPress={solicitarAmistad}
                            >
                                <Ionicons name="person-add" size={18} color="#000" />
                                <Text style={styles.actionTextPrimary}>Agregar</Text>
                            </TouchableOpacity>
                        )}

                        {requestStatus === FRIEND_STATUS.ENVIADA && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#facc15', flex: 1 }]}
                                onPress={cancelarSolicitud}
                            >
                                <Ionicons name="hourglass-outline" size={18} color="#000" />
                                <Text style={styles.actionTextPrimary}>Cancelar solicitud</Text>
                            </TouchableOpacity>
                        )}

                        {requestStatus === FRIEND_STATUS.RESPONDER && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#3b82f6', flex: 1 }]}
                                onPress={() => setRespondSheetOpen(true)}
                            >
                                <Ionicons name="person-add" size={18} color="#000" />
                                <Text style={styles.actionTextPrimary}>Responder</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: CHIP, flex: 1 }]}
                            onPress={() =>
                                navigation.navigate('Chats', {
                                    screen: 'Chat',
                                    params: { receptorId: visitedUserId },
                                })
                            }
                        >
                            <Ionicons name="chatbubble-outline" size={18} color={text} />
                            <Text style={[styles.actionTextSecondary, { color: text }]}>
                                Mensaje
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref={optionsBtnRef}
                            style={[styles.iconBtn, { backgroundColor: CHIP }]}
                            onPress={() => {
                            if (optionsBtnRef.current) {
                                optionsBtnRef.current.measureInWindow((x, y, width, height) => {
                                    setMenuPos(y + height + 35 );
                                    setShowOptions(!showOptions);
                                });
                            } else {
                                setShowOptions(!showOptions);
                            }
                        }}
                        >
                            <Ionicons name="ellipsis-horizontal" size={20} color={text} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                            onPress={handleAddStory}
                        >
                            <Ionicons name="add" size={18} color="#000" />
                            <Text style={styles.actionTextPrimary}>Agregar a historia</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: CHIP }]}
                            onPress={() =>
                                navigation.navigate("EditProfile", {
                                    profile,    // objeto de perfil que ya carga ProfileScreen
                                    avatarUri,  // estado con la foto actual
                                    coverUri,   // estado con la portada actual
                                    onAvatarUpdated: (newUrl) => setAvatarUri(newUrl),
                                    onCoverUpdated: (newUrl) => setCoverUri(newUrl),
                                })
                            }
                        >
                            <MaterialIcons name="edit" size={18} color={text} />
                            <Text style={[styles.actionTextSecondary, { color: text }]}>Editar perfil</Text>
                        </TouchableOpacity>

                    </>
                )}
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: BORDER }]}>
                <Text
                    onPress={() => setActiveTab('all')}
                    style={[
                        styles.tab,
                        activeTab === 'all'
                            ? [styles.tabActive, { color: '#60a5fa', borderBottomColor: '#60a5fa' }]
                            : { color: MUTED },
                    ]}
                >
                    Publicaciones
                </Text>
                <Text
                    onPress={() => setActiveTab('photos')}
                    style={[
                        styles.tab,
                        activeTab === 'photos'
                            ? [styles.tabActive, { color: '#60a5fa', borderBottomColor: '#60a5fa' }]
                            : { color: MUTED },
                    ]}
                >
                    Fotos
                </Text>
                <Text
                    onPress={() => setActiveTab('reels')}
                    style={[
                        styles.tab,
                        activeTab === 'reels'
                            ? [styles.tabActive, { color: '#60a5fa', borderBottomColor: '#60a5fa' }]
                            : { color: MUTED },
                    ]}
                >
                    Reels
                </Text>
            </View>
        </>
    );

    /* ================== UI ================== */
    return (
        <View style={[styles.container, { backgroundColor: BG }]}>
            <ComentariosModal
                visible={comentariosVisible}
                onClose={() => setComentariosVisible(false)}
                publicacionId={selectedPostId}
                user={user}
            />

            <View>
                {activeTab === 'photos' ? (
                    <FlatList
                        key="photos-3cols"
                        data={currentData}
                        keyExtractor={(_, i) => 'ph-' + i}
                        showsVerticalScrollIndicator={false}
                        numColumns={3}
                        columnWrapperStyle={{ gap: 6, paddingHorizontal: 12 }}
                        contentContainerStyle={{ gap: 6, paddingVertical: 12 }}
                        ListHeaderComponent={renderHeader}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => { showImgVideosTab('photos', index); }}
                                style={{ flex: 1 }}
                            >
                                <Image
                                    source={{ uri: item.uri }}
                                    style={{ width: '100%', aspectRatio: 1, borderRadius: 6 }}
                                />
                            </TouchableOpacity>
                        )}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={photoRefreshing}
                                onRefresh={handleRefresh}
                                colors={['#60a5fa']}
                                tintColor="#60a5fa"
                            />
                        }
                        ListFooterComponent={renderFooter}
                    />
                ) : activeTab === 'reels' ? (
                    <FlatList
                        key="reals-3cols"
                        data={currentData}
                        keyExtractor={(_, i) => 'ph-' + i}
                        showsVerticalScrollIndicator={false}
                        numColumns={3}
                        columnWrapperStyle={{ gap: 6, paddingHorizontal: 12 }}
                        contentContainerStyle={{ gap: 6, paddingVertical: 12 }}
                        ListHeaderComponent={renderHeader}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => { showImgVideosTab('reels', index); }}
                                style={styles.reelItem}
                                activeOpacity={0.9}
                            >
                                <Video
                                    source={{ uri: item.uri }}
                                    style={styles.reelVideo}
                                    resizeMode="cover"
                                    isLooping
                                    shouldPlay={false}
                                    isMuted
                                    useNativeControls={false}
                                />
                                <View style={styles.reelOverlay}>
                                    <Ionicons name="play-circle" size={42} color="#fff" />
                                    <Text style={styles.reelLabel}>Ver reel</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={reelRefreshing}
                                onRefresh={handleRefresh}
                                colors={['#60a5fa']}
                                tintColor="#60a5fa"
                            />
                        }
                        ListFooterComponent={renderFooter}
                    />
                ) : (

                    <FlatList
                        data={currentData}
                        ref={profileScrollRef}
                        keyExtractor={(p) => `post-${p.id}`}
                        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40, gap: 10 }}
                        ListHeaderComponent={renderHeader}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => <FeedItem post={item} user={user} inProfile={true} openShare={openShare}
                                            handleOpenComentarios={handleOpenComentarios} setPosts={setPosts} posts={posts}
                                            avatarUri={avatarUri} setMediaPost={MediaPostSetter}/>}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={allRefreshing}
                                onRefresh={handleRefresh}
                                colors={['#60a5fa']}
                                tintColor="#60a5fa"
                            />
                        }
                        ListFooterComponent={renderFooter}
                    />
                )}
            </View>

            {showOptions && (
                <View style={[styles.optionsMenu, {
                    top: menuPos
                }]}>
                    <TouchableOpacity style={styles.optionItem} onPress={silenciarAmistad}>
                        {estadoAmistad ? (
                            <>
                                <Ionicons name="notifications-outline" size={18} color="#000" />
                                <Text style={styles.optionText}>Seguir</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="notifications-off-outline" size={18} color="#000" />
                                <Text style={styles.optionText}>Silenciar</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem} onPress={eliminarAmistad}>
                        <Ionicons name="person-remove-outline" size={18} color="#e74c3c" />
                        <Text style={[styles.optionText, { color: "#e74c3c" }]}>
                            Eliminar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* -------- Bottom Sheet: Avatar -------- */}
            <Modal transparent visible={avatarSheetOpen} animationType="fade" onRequestClose={() => setAvatarSheetOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setAvatarSheetOpen(false)} />
                <View style={[styles.sheet, { backgroundColor: SHEET }]}>
                    {stories.length > 0 && (
                        <SheetItem icon={<Ionicons name="play-circle-outline" size={22} />}
                            label="Ver historia"
                            onPress={() => { setAvatarSheetOpen(false); openStoriesViewer(); }} />
                    )}

                    {isOwnProfile && (
                        <>
                            <SheetItem icon={
                                <Ionicons name="add-circle-outline" size={22} />}
                                label="Agregar a historia"
                                onPress={() => { setAvatarSheetOpen(false); handleAddStory(); }} />
                            <SheetItem icon={
                                <Ionicons name="camera-outline" size={22} />}
                                label="Tomar foto"
                                onPress={() => { setAvatarSheetOpen(false); takePhoto(updateAvatar); }} />
                            <SheetItem icon={
                                <Ionicons name="folder-outline" size={22} />}
                                label="Subir foto"
                                onPress={() => { setAvatarSheetOpen(false); pickFromLibrary(updateAvatar); }} />
                        </>
                    )}
                    <SheetItem icon={<Ionicons name="person-circle-outline" size={22} />}
                        label="Ver foto del perfil"
                        onPress={() => {
                            setAvatarSheetOpen(false); if (avatarUri) {
                                setViewerIndex(-1); setViewerOpen(true);
                            }
                        }} disabled={!avatarUri} />
                </View>
            </Modal>

            {/* -------- Bottom Sheet: Portada -------- */}
            <Modal transparent visible={coverSheetOpen} animationType="fade" onRequestClose={() => setCoverSheetOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setCoverSheetOpen(false)} />
                <View style={[styles.sheet, { backgroundColor: SHEET }]}>
                    <SheetItem icon={<Ionicons name="image-outline" size={22} />} label="Ver foto de portada" onPress={() => { setCoverSheetOpen(false); if (coverUri) { setViewerIndex(-2); setViewerOpen(true); } }} disabled={!coverUri} />

                    {isOwnProfile && (
                        <>
                            <SheetItem icon={
                                <Ionicons name="camera-outline" size={22} />}
                                label="Tomar foto"
                                onPress={() => { setCoverSheetOpen(false); takePhoto(updateCover); }} />
                            <SheetItem icon={
                                <Ionicons name="folder-outline" size={22} />}
                                label="Subir foto"
                                onPress={() => { setCoverSheetOpen(false); pickFromLibrary(updateCover); }} />
                        </>
                    )}
                </View>
            </Modal>

            {/* -------- Visor (historias / avatar / portada) -------- */}
            <Modal transparent visible={viewerOpen} animationType="fade" onRequestClose={closeViewer}>
                <View style={styles.viewerBackdrop}>
                    {viewerIndex >= 0 && stories.length > 0 && (
                        <>
                            <Pressable style={styles.tapLeft} onPress={goPrevStory} />
                            <Pressable style={styles.tapRight} onPress={goNextStory} />
                        </>
                    )}
                    <Image
                        source={{
                            uri: viewerIndex === -1 ? avatarUri : stories[viewerIndex]
                        }}
                        style={styles.viewerImage}
                        resizeMode="contain"
                    />
                    <View style={styles.viewerTopBar}>
                        {viewerIndex >= 0 && stories.length > 0 && (
                            <View style={styles.progressRow}>
                                {stories.map((_, i) => (
                                    <View key={i} style={styles.progressTrack}>
                                        <Animated.View
                                            style={[
                                                styles.progressFill,
                                                i < viewerIndex && { width: '100%' },
                                                i === viewerIndex && { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                                            ]}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}
                        <View style={styles.viewerButtons}>
                            {viewerIndex >= 0 && stories.length > 0 && isOwnProfile && (
                                <>
                                    <TouchableOpacity onPress={() => editStoryAt(viewerIndex)} style={styles.topBtn}><Ionicons name="create-outline" size={22} color="#fff" /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => Alert.alert('Eliminar historia', '¿Eliminar esta historia?', [
                                        { text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteStoryAt(viewerIndex) }
                                    ])} style={styles.topBtn}><Ionicons name="trash-outline" size={22} color="#fff" /></TouchableOpacity>
                                </>
                            )}
                            <TouchableOpacity onPress={closeViewer} style={styles.topBtn}><Ionicons name="close" size={26} color="#fff" /></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* -------- Visor de FOTOS (pestaña Fotos y collage) -------- */}
            <Modal
                transparent
                visible={photoViewerOpen}
                animationType="fade"
                onRequestClose={() => setPhotoViewerOpen(false)}
            >
                <View style={styles.viewerBackdrop}>

                    {/* Botón cerrar */}
                    <TouchableOpacity
                        onPress={() => setPhotoViewerOpen(false)}
                        style={[styles.topBtn, { position: 'absolute', right: 10, top: 40, backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    >
                        <Ionicons name="close" size={26} color="#fff" />
                    </TouchableOpacity>

                    {/* Carrusel */}

                    {typeList == "photos" ? (
                        <FlatList
                            ref={photoListRef}
                            data={currentPhotosFlat}
                            keyExtractor={(_, i) => 'vw-' + i}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={photoIndex}
                            getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
                            onLayout={() => {
                                if (photoIndex > 0) {
                                    photoListRef.current?.scrollToIndex({ index: photoIndex, animated: false });
                                }
                            }}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View style={{ width: SCREEN_W, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.viewerImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                        />
                    ) : (typeList == "reels" ? (
                        <View style={{ width: SCREEN_W, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Video source={{ uri: currentData[photoIndex].uri }} style={styles.viewerImage} resizeMode="contain" useNativeControls shouldPlay />
                        </View>

                    ) : null)}
                </View>
            </Modal>

            <Modal
                transparent
                visible={respondSheetOpen}
                animationType="fade"
                onRequestClose={() => setRespondSheetOpen(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setRespondSheetOpen(false)}
                />
                <View style={[
                    styles.sheet,
                    {
                        backgroundColor: SHEET,
                        paddingBottom: Math.max(insets.bottom, 20)
                    }
                ]}>
                    <View style={{ paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: BORDER }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: text, textAlign: 'center' }}>
                            Solicitud de amistad
                        </Text>
                        <Text style={{ fontSize: 14, color: MUTED, textAlign: 'center', marginTop: 4 }}>
                            {profile} te envió una solicitud
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.sheetItem, { backgroundColor: '#22c55e20' }]}
                        onPress={() => {
                            setRespondSheetOpen(false);
                            cambiarEstadoSolicitud(1);
                        }}
                    >
                        <View style={[styles.sheetIcon, { backgroundColor: '#22c55e' }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sheetLabel, { color: text, fontWeight: '600' }]}>
                                Aceptar solicitud
                            </Text>
                            <Text style={{ fontSize: 13, color: MUTED }}>
                                Serán amigos y podrán verse las publicaciones
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sheetItem, { backgroundColor: '#ef444420' }]}
                        onPress={() => {
                            setRespondSheetOpen(false);
                            Alert.alert(
                                'Rechazar solicitud',
                                `¿Seguro que quieres rechazar la solicitud de ${profile}?`,
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Rechazar',
                                        style: 'destructive',
                                        onPress: () => cambiarEstadoSolicitud(0)
                                    }
                                ]
                            );
                        }}
                    >
                        <View style={[styles.sheetIcon, { backgroundColor: '#ef4444' }]}>
                            <Ionicons name="close-circle" size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sheetLabel, { color: text, fontWeight: '600' }]}>
                                Rechazar solicitud
                            </Text>
                            <Text style={{ fontSize: 13, color: MUTED }}>
                                No serán amigos y no verán sus publicaciones
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sheetItem}
                        onPress={() => setRespondSheetOpen(false)}
                    >
                        <View style={styles.sheetIcon}>
                            <Ionicons name="close" size={24} color={text} />
                        </View>
                        <Text style={[styles.sheetLabel, { color: text }]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Composer modal */}
            <Modal visible={composerOpen} animationType="slide" onRequestClose={resetComposer}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: BG }}>
                    <View style={[styles.CARD, { backgroundColor: CARD, borderBottomWidth: 0, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <TouchableOpacity onPress={resetComposer}><Ionicons name="close" size={26} color={TEXT} /></TouchableOpacity>
                        <Text style={{ color: TEXT, fontWeight: '700' }}>Crear publicación</Text>
                        <TouchableOpacity onPress={submitPost}><Text style={{ color: BLUE, fontWeight: '700' }}>Publicar</Text></TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={{ uri: avatarUri }} style={styles.postAvatar} />
                            <Text style={{ color: TEXT, fontWeight: '700' }}>{`${user.nombreUsuario || 'Usuario no identificado'} ${user.apellidoUsuario || ''}`}</Text>
                        </View>

                        <TextInput
                            placeholder="¿Qué estás pensando?"
                            placeholderTextColor={MUTED}
                            value={postText}
                            onChangeText={setPostText}
                            style={{ color: TEXT, fontSize: 16, minHeight: 120, textAlignVertical: 'top' }}
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
                                        <Text style={{ color: TEXT, fontWeight: '700' }}>Recortar (máx. 30s)</Text>
                                        <Text style={{ color: MUTED }}>Inicio: {(trimStart / 1000).toFixed(1)}s • Fin: {(trimEnd / 1000).toFixed(1)}s</Text>
                                        <Slider value={trimStart} minimumValue={0} maximumValue={Math.max(0, postVideo.durationMs - 1000)} step={500} onValueChange={(v) => setTrimStart(Math.min(v, trimEnd - 1000))} />
                                        <Slider value={trimEnd} minimumValue={1000} maximumValue={postVideo.durationMs} step={500} onValueChange={(v) => setTrimEnd(Math.max(v, trimStart + 1000))} />
                                        <Text style={{ color: MUTED }}>Ventana: {((trimEnd - trimStart) / 1000).toFixed(1)}s / {(postVideo.durationMs / 1000).toFixed(1)}s</Text>
                                    </View>
                                )}
                            </View>
                        ) : null}

                        { sharePost ? (
                            <FeedItem post={sharePost} postItem={false} avatarUri={avatarUri} user={user}/>
                        )
                        :(

                            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                <ComposerBtn icon="image-outline" label="Fotos" onPress={ async () => pickMultipleImages(ImagenesSeleccionadas)} />
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

            <MediaPost mediaPost={mediaPost} setMediaOpen={setMediaOpen} mediaOpen={mediaOpen}/>
        </View>
    );
}

/* ================ Auxiliares UI ================ */
function SheetItem({ icon, label, onPress, disabled }) {
    return (
        <TouchableOpacity onPress={disabled ? undefined : onPress} style={[styles.sheetItem, disabled && { opacity: 0.5 }]}>
            <View style={styles.sheetIcon}>{icon}</View>
            <Text style={styles.sheetLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

/* ================== ESTILOS ================== */
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Portada
    coverWrap: { height: COVER_H, overflow: 'visible', position: 'relative' },
    cover: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    coverEmpty: { alignItems: 'center', justifyContent: 'center' },
    coverHint: { marginTop: 6, fontSize: 12 },
    camCoverBtn: { position: 'absolute', right: 14, bottom: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20, zIndex: 4, elevation: 4 },

    // Avatar + historia
    avatarAnchor: { position: 'absolute', left: 16, bottom: -AVATAR_SIZE / 2, zIndex: 5, elevation: 5 },
    storyRing: { padding: 3, borderRadius: (AVATAR_SIZE + 6) / 2 },
    avatarWrap: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 3, borderColor: '#fff', overflow: 'visible' },
    avatar: { width: '100%', height: '100%', borderRadius: AVATAR_SIZE / 2 },
    avatarEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' },
    camAvatarBtn: { position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.75)', padding: 8, borderRadius: 16, zIndex: 6, elevation: 6, borderWidth: 2, borderColor: '#fff' },

    // Info
    info: { paddingHorizontal: 16 },
    name: { fontSize: 22, fontWeight: '700' },
    subtitle: { marginTop: 4 },

    // Acciones
    actionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 12 },
    actionsRowPost: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e5e7eb' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, flex: 1, justifyContent: 'center' },
    actionTextPrimary: { color: '#000', fontWeight: '700' },
    actionTextSecondary: { fontWeight: '600' },
    iconBtn: { width: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },

    // Tabs
    tabs: { flexDirection: 'row', gap: 20, paddingHorizontal: 16, marginTop: 16, borderBottomWidth: 1, paddingBottom: 8 },
    tab: { fontWeight: '600' },
    tabActive: { borderBottomWidth: 2, paddingBottom: 6 },

    // Sheet
    backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingVertical: 8 },
    sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
    sheetIcon: { width: 28, alignItems: 'center', marginRight: 12 },
    sheetLabel: { fontSize: 16, color: '#ddd' },

    // Viewer (historias / avatar / portada)
    viewerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', alignItems: 'center', justifyContent: 'center' },
    viewerImage: { width: '100%', height: '100%' },
    viewerTopBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 44, paddingHorizontal: 10, paddingBottom: 10 },
    viewerButtons: { position: 'absolute', top: 44, right: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
    topBtn: { padding: 8, zIndex: 1000 },
    progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 8 },
    progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#fff' },

    // Tap zones (historias)
    tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%' },
    tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%' },

    // estilos de opciones de perfil
    optionsMenu: {
        position: "absolute",
        right: 14,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 20,
        zIndex: 100,
        minWidth: 180,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 12,
    },
    optionText: {
        fontSize: 15,
        color: "#000",
        fontWeight: "500",
    },


    //reels
    reelItem: {
        width: SCREEN_W / 2 - 20,
        aspectRatio: 9 / 16,
        margin: 4,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    reelVideo: {
        width: '100%',
        height: '100%',
    },
    reelOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    reelLabel: {
        marginTop: 4,
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    viewerVideo: {
        width: SCREEN_W,
        height: SCREEN_H * 0.6,
    },
    viewerImage: {
        width: SCREEN_W,
        height: SCREEN_H * 0.6,
    },
    topBtn: {
        padding: 8,
        borderRadius: 20,
        zIndex: 1000
    },
});