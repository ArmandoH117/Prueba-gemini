// src/screens/EditProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { colors } from "../theme/colors";
import { makeRequest } from "../services/fetchRequest";
import { getData, getDataIS, storeDataIS } from "../utils/LocalStorage";

// ===== Helpers para archivos / imágenes =====
const guessExt = (uri = "", fallback = "jpg") =>
  (uri.split(".").pop() || fallback).toLowerCase();

const normalizeAsset = (asset) => {
  const ext = guessExt(asset.uri);
  const isVideo =
    asset.type === "video" || /mp4|mov|mkv|webm/i.test(ext ?? "");
  return {
    uri: asset.uri,
    name:
      asset.fileName ||
      (isVideo ? `video.${ext}` : `image.${ext || "jpg"}`),
    type: isVideo
      ? `video/${ext === "mov" ? "quicktime" : "mp4"}`
      : `image/${ext === "jpg" ? "jpeg" : ext}`,
    size: asset.fileSize ?? 0,
  };
};

async function askMedia() {
  const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (lib.status !== "granted") {
    Alert.alert(
      "Permiso requerido",
      "Activa el acceso a la galería para cambiar tu foto."
    );
    return false;
  }
  return true;
}

async function pickSingleImage() {
  const ok = await askMedia();
  if (!ok) return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });

  if (res.canceled) return null;
  return res.assets[0];
}

export default function EditProfileScreen({ navigation, route }) {
  const [userId, setUserId] = useState(null);

  const {
    avatarUri: initialAvatar,
    coverUri: initialCover,
    onAvatarUpdated,
    onCoverUpdated,
  } = route.params || {};

  const [avatarUri, setAvatarUri] = useState(initialAvatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverUri, setCoverUri] = useState(initialCover || "");
  const [coverFile, setCoverFile] = useState(null);

  // Campos de presentación / detalles
  const [bio, setBio] = useState("");
  const [livesIn, setLivesIn] = useState("");
  const [work, setWork] = useState("");
  const [education, setEducation] = useState("");
  const [hometown, setHometown] = useState("");
  const [relationship, setRelationship] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const id = userId || await getData("idUser");
        if (!id) return;

        const res = await makeRequest(`/usuarios/info-perfil/${id}`);
        const data = res.data;

        if (!isMounted) return;

        setBio(data.bioUsuario ?? "");
        setLivesIn(data.viveEnUsuario ?? "");
        setWork(data.trabajaUsuario ?? "");
        setEducation(data.educacionUsuario ?? "");
        setHometown(data.origenUsuario ?? "");
        setRelationship(data.relacionSentimentalUsuario ?? "");

        console.log("paso1");
        if (data.usuarioImagenUrl) {
          setAvatarUri(data.usuarioImagenUrl);
        }
        console.log("paso2");
        if (data.usuarioImagenCoverUrl) {
          setCoverUri(data.usuarioImagenCoverUrl);
        }

      } catch (err) {
        console.log("Error loading profile", err);
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleChangeAvatar = async () => {
    const asset = await pickSingleImage();
    if (!asset) return;
    const normalized = normalizeAsset(asset);
    setAvatarUri(normalized.uri);
    setAvatarFile(normalized);
  };


  const handleChangeCover = async () => {
    const asset = await pickSingleImage();
    if (!asset) return;
    const normalized = normalizeAsset(asset);
    setCoverUri(normalized.uri);
    setCoverFile(normalized);
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

  const handleSave = async () => {
    try {
      const id = userId || await getData("idUser");
      if (!id) return;

      setSaving(true);

      console.log("ingreso");

      const userInfo = new FormData();
      userInfo.append('idUsuario', id);
      userInfo.append('bioUsuario', bio);
      userInfo.append('viveEnUsuario', livesIn);
      userInfo.append('trabajaUsuario', work);
      userInfo.append('educacionUsuario', education);
      userInfo.append('origenUsuario', hometown);
      userInfo.append('relacionSentimentalUsuario', relationship);

      if (avatarFile) {
        const normalized = normalizeAsset(avatarFile);
        userInfo.append('usuarioImagen', normalized);
        const newUrl = normalized.uri;
        setAvatarUri(newUrl);
        if (onAvatarUpdated) {
          onAvatarUpdated(newUrl);
        }
      }

      if (coverFile) {
        const normalized = normalizeAsset(coverFile);
        userInfo.append('usuarioImagenCover', normalized);
        const newUrl = normalized.uri;
        setCoverUri(newUrl);
        if (onCoverUpdated) {
          onCoverUpdated(newUrl);
        }
      }

      const data = await makeRequest(`/usuarios/actualizar-info-perfil`, { method: 'post' }, userInfo);
      console.log("paso por guardar");

      Alert.alert("Perfil actualizado", "Tus cambios se han guardado.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);

    } catch (err) {
      console.log("save profile err", err);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };




  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header seguro para notch */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.title} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Foto de perfil */}
          <Text style={styles.sectionTitle}>Foto del perfil</Text>
          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={40} color={colors.accent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChangeAvatar}>
              <Text style={styles.editLink}>
                {uploadingAvatar ? "Guardando..." : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Foto de portada */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Foto de portada
          </Text>
          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.coverWrapper}
              onPress={handleChangeCover}
              activeOpacity={0.8}
            >
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.cover} />
              ) : (
                <View
                  style={[
                    styles.cover,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
                >
                  <Ionicons name="image" size={36} color={colors.accent} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChangeCover}>
              <Text style={styles.editLink}>
                {uploadingCover ? "Guardando..." : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Presentación */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Presentación
          </Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Descríbete…</Text>
            <TextInput
              style={styles.textArea}
              multiline
              maxLength={150}
              placeholder="Escribe algo sobre ti"
              placeholderTextColor={colors.textSecondary}
              value={bio}
              onChangeText={setBio}
            />
            <Text style={styles.counter}>{bio.length}/150</Text>
          </View>

          {/* Detalles */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Detalles
          </Text>

          <View style={styles.card}>
            {/* Vive en */}
            <View style={styles.detailRow}>
              <Ionicons
                name="home-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.detailIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Vive en</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="Ciudad donde vives"
                  placeholderTextColor={colors.textSecondary}
                  value={livesIn}
                  onChangeText={setLivesIn}
                />
              </View>
            </View>

            {/* Lugar de trabajo */}
            <View style={styles.detailRow}>
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.detailIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Lugar de trabajo</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="Empresa o lugar"
                  placeholderTextColor={colors.textSecondary}
                  value={work}
                  onChangeText={setWork}
                />
              </View>
            </View>

            {/* Formación académica */}
            <View style={styles.detailRow}>
              <Ionicons
                name="school-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.detailIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Formación académica</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="Centro de estudios"
                  placeholderTextColor={colors.textSecondary}
                  value={education}
                  onChangeText={setEducation}
                />
              </View>
            </View>

            {/* Ciudad de origen */}
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.detailIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Ciudad de origen</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="Ciudad donde naciste"
                  placeholderTextColor={colors.textSecondary}
                  value={hometown}
                  onChangeText={setHometown}
                />
              </View>
            </View>

            {/* Situación sentimental */}
            <View style={styles.detailRow}>
              <Ionicons
                name="heart-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.detailIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Situación sentimental</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="Soltero, en una relación…"
                  placeholderTextColor={colors.textSecondary}
                  value={relationship}
                  onChangeText={setRelationship}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Botón fijo, dentro del SafeArea */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: colors.background,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.title,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120, // espacio para el botón inferior
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.title,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.accent,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  coverWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    marginRight: 16,
    height: 140,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  editLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.accent,
  },
  card: {
    backgroundColor: "#F6F9FE",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.title,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.title, // texto oscuro, ya no blanco
  },
  counter: {
    textAlign: "right",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  detailIcon: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.title, // más oscuro para diferenciar del placeholder
    marginBottom: 2,
  },
  detailInput: {
    fontSize: 14,
    color: colors.title, // texto visible
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
