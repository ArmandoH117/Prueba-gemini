import { Modal, Dimensions, TouchableOpacity, View, FlatList, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { stylesMediaPost } from "../theme/styles";
import { Video } from "expo-av";
import { useRef } from "react";

const SCREEN_W = Dimensions.get('window').width;

export default function MediaPost({ mediaPost, setMediaOpen, mediaOpen }){
    const mediaListRef = useRef(null);

    return (
        <Modal transparent visible={mediaOpen} animationType="fade" onRequestClose={() => setMediaOpen(false)}>
            <View style={stylesMediaPost.viewerBackdrop}>
                <TouchableOpacity onPress={() => setMediaOpen(false)} 
                    style={[stylesMediaPost.topBtn, { position: 'absolute', right: 10, top: 40, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>

                {mediaPost?.video ? (
                    <Video source={{ uri: mediaPost.video[0] }} style={stylesMediaPost.viewerImage} resizeMode="contain" 
                    useNativeControls shouldPlay />
                ) : mediaPost?.images ? (
                    <FlatList
                        ref={mediaListRef}
                        data={mediaPost.images}
                        keyExtractor={(uri, i) => (uri || 'img') + '-' + i}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={mediaPost.index || 0}
                        getItemLayout={(_, i) => ({
                            length: SCREEN_W,
                            offset: SCREEN_W * i,
                            index: i,
                        })}
                        onLayout={() => {
                            const idx = mediaPost.index || 0;
                            if (idx > 0) {
                                mediaListRef.current?.scrollToIndex({ index: idx, animated: false });
                            }
                        }}
                        renderItem={({ item: uri }) => (
                            <View style={{ width: SCREEN_W, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    source={{ uri }}
                                    style={stylesMediaPost.viewerImage}
                                    resizeMode="contain"
                                    onError={() => console.warn('No se pudo cargar la imagen:', uri)}
                                />
                            </View>
                        )}
                    />
                ) : mediaPost?.imageUri ? (
                    <Image source={{ uri: mediaPost.imageUri }} style={stylesMediaPost.viewerImage} resizeMode="contain" />
                ) : null}
            </View>
        </Modal>

    );
}