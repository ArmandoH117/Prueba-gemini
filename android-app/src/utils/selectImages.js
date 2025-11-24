import * as ImagePicker from 'expo-image-picker';

const guessExt = (uri = '', fallback = 'jpg') =>
    (uri.split('.').pop() || fallback).toLowerCase();

export function normalizeAsset(asset){
    const ext = guessExt(asset.uri);
    const isVideo = asset.type === 'video' || /mp4|mov|mkv|webm/i.test(ext);
    return {
        uri: asset.uri,
        name: (asset.fileName || (isVideo ? `video.${ext}` : `image.${ext}`)),
        type: isVideo ? `video/${ext === 'mov' ? 'quicktime' : 'mp4'}` : `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        size: asset.fileSize ?? 0,
    };
};

export async function pickFromGallery(setArchivos) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.85,
        allowsEditing: false,
    });

    if (result.canceled) return;

    const assets = (result.assets || []).map(normalizeAsset);
    setArchivos(prev => [...prev, ...assets]);
}

export async function takePhoto(setArchivos) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
    });

    if (result.canceled) return;

    const assets = (result.assets || []).map(normalizeAsset);
    setArchivos(prev => [...prev, ...assets]);
}

export async function recordVideo(setArchivos) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 60,
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (result.canceled) return;

    const assets = (result.assets || []).map(normalizeAsset);
    setArchivos(prev => [...prev, ...assets]);
}

export async function pickImageAndGalery(setSelected, aspect = true){
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
        Alert.alert("Permiso requerido", "Se necesita acceso a la galería");
        return;
    }

    const configImg = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
    };

    if(aspect){
        configImg.aspect = [1, 1];
    }

    const result = await ImagePicker.launchImageLibraryAsync(configImg);

    if (!result.canceled) {
        setSelected(result.assets[0]);
    }
};

export default async function askPerms(){
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cam.status !== 'granted' && lib.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Activa los permisos de cámara/galería.');
        return false;
    }
    return true;
};

export async function pickMultipleImages(setData){
    if (!(await askPerms())) return;
    
    const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.95,
        allowsMultipleSelection: true,
        selectionLimit: 10,
    });

    if (res.canceled) return;

    if (res.assets?.length) {
        setData(res.assets);
    }

};
