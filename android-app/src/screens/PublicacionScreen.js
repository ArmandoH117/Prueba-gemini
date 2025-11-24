import { Modal, KeyboardAvoidingView, View, Text, 
    TouchableOpacity, Image, TextInput, Platform, ScrollView } from "react-native";
import PostImagesGrid from "../components/PostImagesGrid";
import Slider from '@react-native-community/slider';
import { Video } from 'expo-av';
import ComposerBtn from "../components/btns/ComposerBtn";
import { useEffect, useState } from "react";
import { useColorsTheme } from "../theme/colors";
import { stylesPost } from "../theme/styles";
import { Ionicons } from "@expo/vector-icons";
import { pickMultipleImages } from "../utils/selectImages";
import { makeRequest } from "../services/fetchRequest";
import normalizeAsset from "../utils/selectImages";

const noAction = ()=>{ }
const MAX_VIDEO_MS = 3_000;

export default function PublicacionScreen({ visible, onClose, postImagesParent = [], sharePost= null, user = null,
    setMediaPost = noAction, setMediaOpen = noAction, postVideoParent = null, selectedImagesParent = [],
    setUploadingPost = noAction, ImagenesSeleccionadas = noAction, setPosts = noAction }) {

    const [postText, setPostText] = useState('');
    const [postVideo, setPostVideo] = useState(null);
    const [postImages, setPostImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const colorsTheme = useColorsTheme();

    useEffect(() =>{
        setPostImages(postImagesParent);
        setPostVideo(postVideoParent);
        setSelectedImages(selectedImagesParent);
    }, [visible, postImagesParent, postVideoParent]);


    const submitPost = async () => {
        if (!postText && postImages.length == 0 && !postVideo) return;

        try {
            const formData = new FormData();
            formData.append('usuarioId', user.idUsuario);
            formData.append('publicacionContenido', postText);

            if(sharePost){
                if(sharePost.publicacionOriginalId != null && sharePost.publicacionOriginalId > 0){
                    formData.append('publicacionOriginalId', sharePost.publicacionOriginalId);
                }else{
                    formData.append('publicacionOriginalId', sharePost.id);
                }
            }

            if (selectedImages.length > 0) {
                selectedImages.forEach(file => {
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
                usuarioImagen: user.usuarioImagen,
            };

            setUploadingPost(newPost);
            const infoShare = sharePost;
            handleClose();
            setPostText('');

            const result = await makeRequest(`/publicaciones/publicacion`, {
                method: 'POST',
            }, formData);

            if(infoShare){
                newPost.publicacionOriginal = infoShare;
                newPost.publicacionOriginalId = infoShare.id;
                const next = posts.map(p => (p.id === infoShare.id ? { ...p, shares: (p.shares || 0) + 1 } : p));
                setPosts(next);
            }
            
            setUploadingPost(null);
            newPost.id = result.data;
            setPosts(prevPosts => [newPost, ...prevPosts]);

        } catch (error) {
            console.log(error);
            setUploadingPost(null);
            Alert.alert('Error', 'No se pudo crear la publicación');
        }
    };

    const handleClose = () => {
        onClose();
    };

    const pickVideoFromLibrary = async () =>{
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

    return (
        <Modal visible={visible} animationType="slide" 
            onRequestClose={handleClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colorsTheme.BG }}>
                <View style={[stylesPost.card, { backgroundColor: colorsTheme.CARD, borderBottomWidth: 0, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <TouchableOpacity onPress={handleClose}><Ionicons name="close" size={26} color={colorsTheme.TEXT} /></TouchableOpacity>
                    <Text style={{ color: colorsTheme.TEXT, fontWeight: '700' }}>Crear publicación</Text>
                    <TouchableOpacity onPress={submitPost}><Text style={{ color: colorsTheme.BLUE, fontWeight: '700' }}>Publicar</Text></TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Image source={{ uri: user.usuarioImagen || '' }} style={stylesPost.postAvatar} />
                        <Text style={{ color: colorsTheme.TEXT, fontWeight: '700' }}>{user.nombreUsuario || 'Usuario no identificado'}</Text>
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
                        <PostImagesGrid images={postImages} 
                        onPressIndex={(i) => { setMediaPost({ images: postImages, index: i }); setMediaOpen(true); }} />
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
                        <FeedItem post={sharePost} postItem={false} />
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <ComposerBtn icon="image-outline" label="Fotos" onPress={async () => pickMultipleImages(ImagenesSeleccionadas)} />
                            <ComposerBtn icon="camera-outline" label="Cámara" onPress={async () => {
                                const uri = await takePhoto();
                                if (uri) { setPostImages(prev => [...prev, uri]); setPostVideo(null); }
                            }} />
                            <ComposerBtn icon="videocam-outline" label="Video" onPress={pickVideoFromLibrary} />
                                {(postImages.length > 0 || postVideo) ? <ComposerBtn icon="close-outline" label="Quitar media" 
                                onPress={() => { setPostImages([]); setPostVideo(null); }} /> : null}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>

    );
}