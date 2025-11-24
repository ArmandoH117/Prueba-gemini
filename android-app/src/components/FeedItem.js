import { View, TouchableOpacity, Image, Text, TextInput } from "react-native";
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import PostImagesGrid from "./PostImagesGrid";
import { Video } from "expo-av";
import ActionButton from "./ActionButton";
import { makeRequest } from "../services/fetchRequest";
import { useState, useRef } from "react";
import { getFormatoFecha } from "../utils/formatDate";
import { stylesPost } from "../theme/styles";
import ReactionButton from '../hooks/ReactionButton';
import { getData } from '../utils/LocalStorage';

function noAction() { };

export default function FeedItem({ post, postItem = true, uploading = false, shared = false, setMediaPost = noAction, inProfile = false,
    handleOpenComentarios = noAction, setPosts = noAction, posts = null, openShare = noAction, avatarUri = null, user = null }) {
    const { dark } = useTheme();
    const [commentText, setCommentText] = useState('');
    const videoRef = useRef(null);
    const navigation = useNavigation();

    const CARD = dark ? '#18181b' : '#ffffff';
    const TEXT = dark ? '#fff' : '#0f172a';
    const MUTED = dark ? '#a1a1aa' : '#6b7280';
    const BORDER = dark ? '#242426' : '#e5e7eb';
    const CHIP = dark ? '#222227' : '#f2f2f2';

    function totalReactions(post) {
        const r = post?.reactions || {};
        return Object.values(r).reduce((sum, n) => sum + (Number(n) || 0), 0);
    }

    const onPlaybackStatusUpdate = (status) => {
        if (status.didJustFinish) {
            try {
                videoRef.current?.pauseAsync();
                setTimeout(async () => {
                    await videoRef.current?.setPositionAsync(0);
                }, 200);
            } catch (error) {
                console.warn('Error al reiniciar video:', error);
            }
        }
    };

    const goToProfile = (idUsuario) => {
        if (idUsuario == user.idUsuario && inProfile) return;
        try { navigation.navigate('Perfil', { idUsuario }); } catch { }
    };

    const addComment = async (postId, text) => {
        if (!text?.trim()) return;

        try {
            const info = new FormData();
            info.append('comentarioTexto', text);
            info.append('publicacionId', postId);
            info.append('usuarioId', user.idUsuario);

            await makeRequest(`/comentarios/agregar`, { method: 'post' }, info);

        } catch (error) {
            console.log(error);
        } finally {
        }

        if (post != null) {
            const next = posts.map(p => (p.id === postId ? { ...p, numberComments: (p.numberComments || 0) + 1 } : p));
            setPosts(next);
        }
        setCommentText("");
    };

    const toggleReaction = async (postId, type) => {

        const next = posts.map(p => {
            if (p.id !== postId) return p;
            const prev = p.myReaction;
            const r = { ...(p.reactions || { like: 0, love: 0 }) };
            let numberReactions = p.numberReactions || 0;

            if (prev) r[prev] = Math.max(0, r[prev] - 1);

            if (type === null || type === undefined) {
                numberReactions = Math.max(0, numberReactions - 1);
                return { ...p, reactions: r, myReaction: null, numberReactions };
            }

            if (prev !== type) {
                r[type] = (r[type] || 0) + 1;
                if (prev === null || prev === undefined) {
                    numberReactions = numberReactions + 1;
                }
                return { ...p, reactions: r, myReaction: type, numberReactions };
            }

            numberReactions = Math.max(0, numberReactions - 1);
            return { ...p, reactions: r, myReaction: null, numberReactions };
        });

        setPosts(next);

        try {
            const infoSolicitud = {
                publicacionId: postId,
                usuarioId: await getData('idUser', null),
                tipoReaccionEnum: type
            };

            const data = await makeRequest(`/reacciones/toggle`, { method: 'post' }, infoSolicitud);
        } catch (e) {
            console.log('Error al toggle reaction:', e);
            setPosts(posts);
        }
    };

    return (
        <View style={[shared ? stylesPost.cardNoMargin : stylesPost.card, { backgroundColor: CARD, borderColor: BORDER }]}>
            {uploading && (
                <Text style={stylesPost.publicandoText}>Publicando contenido...</Text>
            )}

            <View style={stylesPost.postHeader}>
                <TouchableOpacity onPress={() => goToProfile(post.usuarioId)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image source={{ uri: post.usuarioImagen }} style={stylesPost.postAvatar}/>
                    <View>
                        <Text style={{ color: TEXT, fontWeight: '700' }}>{post.authorName}</Text>
                        <Text style={{ color: MUTED, fontSize: 12 }}>{getFormatoFecha(post.createdAt)}</Text>
                    </View>
                </TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={18} color={MUTED} />
            </View>

            {post.text ? <Text style={{ color: TEXT, marginBottom: 8 }}>{post.text}</Text> : null}

            {/* Collage de imágenes */}
            {post.images?.length > 0 && (
                <PostImagesGrid
                    images={post.images}
                    onPressIndex={(i) => { setMediaPost({ images: post.images, index: i }); }}
                />
            )}

            {post.video && post.video.length > 0 ? (
                <TouchableOpacity
                    onPress={() => {
                        setMediaPost({ video: post.video, index: 0 });
                    }}
                    activeOpacity={0.9}
                >
                    <Video
                        ref={videoRef}
                        source={{ uri: post.video[0] }}
                        style={[stylesPost.postImage, { backgroundColor: '#000' }]}
                        resizeMode="contain"
                        useNativeControls
                        onLoad={() => videoRef.current?.setPositionAsync(post.video.startMs ?? 0)}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    />
                </TouchableOpacity>
            ) : null}

            {post.publicacionOriginal && (
                <FeedItem post={post.publicacionOriginal} postItem={false} shared={true} user={user} inProfile={inProfile}
                    setMediaPost={setMediaPost}/>
            )}

            {postItem && (
                <>
                    <View style={stylesPost.countsRow}>
                        <Text style={{ color: MUTED, fontSize: 12 }}>
                            {post.numberReactions || 0} reacciones • {post.numberComments || 0} comentarios • {post.shares || 0} compartidos
                        </Text>
                    </View>
                    <View style={stylesPost.actionsRow}>
                        <ReactionButton
                            currentReaction={post.myReaction}
                            onReactionSelect={(reactionType) => toggleReaction(post.id, reactionType)}
                            textColor={TEXT}
                            muted={MUTED}
                        />
                        <ActionButton label="Comentar" icon="chatbubble-ellipses-outline" onPress={() => handleOpenComentarios(post.id)} textColor={TEXT} muted={MUTED} />

                        {user.idUsuario != post.usuarioId && (
                            <ActionButton label="Compartir" icon="arrow-redo-outline" onPress={() => openShare(post)} textColor={TEXT} muted={MUTED} />
                        )}
                    </View>

                    <View style={[stylesPost.commentRow, { borderTopColor: BORDER }]}>
                        <Image source={{ uri: avatarUri }} style={stylesPost.commentAvatar} />
                        <TextInput
                            placeholder="Escribe un comentario..."
                            placeholderTextColor={MUTED}
                            style={[stylesPost.commentInput, { color: TEXT, backgroundColor: CHIP }]}
                            value={commentText}
                            onChangeText={setCommentText}
                            onSubmitEditing={() => { addComment(post.id, commentText); }}
                        />
                    </View>
                </>
            )}

            {post.comments?.length > 0 && (
                <View style={{ marginTop: 8, gap: 6 }}>
                    {post.comments.map(c => (
                        <View key={c.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                            <Image source={{ uri: avatarUri }} style={stylesPost.commentAvatarSmall} />
                            <View style={{ backgroundColor: CHIP, borderRadius: 12, padding: 8, maxWidth: '85%' }}>
                                <Text style={{ color: TEXT, fontWeight: '700' }}>{c.authorName}</Text>
                                <Text style={{ color: TEXT }}>{c.text}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

