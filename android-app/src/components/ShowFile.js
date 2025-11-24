import { Linking, Image, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';

const isImageUrl = (u = '') =>
    /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(u.split('?')[0]);

const fileNameFromUrl = (u = '') =>
    decodeURIComponent(u.split('?')[0].split('/').pop() || 'archivo');

const openUrl = (url) => Linking.openURL(url);

export default function ShowFile({url, viewerImage, indexlst, indeximg}) {
    const name = fileNameFromUrl(url);

    if (isImageUrl(url)) {
        return (
            <TouchableOpacity onPress={() => viewerImage(url, indexlst, indeximg)} style={styles.attItem}>
                <Image
                    source={{ uri: url }}
                    style={styles.attImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={() => openUrl(url)} style={[styles.attItem, styles.attFile]}>
            <Text style={styles.attIcon}>📎</Text>
            <Text numberOfLines={1} style={styles.attName}>{name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    attItem: {
        width: 92,
        height: 92,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 3
    },
    attImage: {
        width: '100%',
        height: '100%',
    },
    attFile: {
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    attIcon: { fontSize: 24, marginBottom: 6 },
    attName: { fontSize: 11, maxWidth: 84, textAlign: 'center' },
});
