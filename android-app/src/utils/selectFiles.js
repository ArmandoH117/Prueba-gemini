
import * as DocumentPicker from 'expo-document-picker';

export async function selectFiles(setArchivos) {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
    });
    if (result.canceled) return;

    const picked = result.assets.map(f => ({
        uri: f.uri,
        name: f.name,
        type: f.mimeType || guessMimeFromName(f.name),
        size: f.size ?? 0,
    }));

    setArchivos(prev => [...prev, ...picked]);
}

const guessMimeFromName = (name = '') => {
    if (/\.(png)$/i.test(name)) return 'image/png';
    if (/\.(jpe?g)$/i.test(name)) return 'image/jpeg';
    if (/\.(gif)$/i.test(name)) return 'image/gif';
    if (/\.(webp)$/i.test(name)) return 'image/webp';
    if (/\.(pdf)$/i.test(name)) return 'application/pdf';
    if (/\.(zip)$/i.test(name)) return 'application/zip';
    if (/\.(mp4)$/i.test(name)) return 'video/mp4';
    return 'application/octet-stream';
};