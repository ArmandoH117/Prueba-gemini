// src/screens/auth/RegisterScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";
import AuthHeader from "../../components/AuthHeader";
import { makeRequest } from "../../services/fetchRequest";
import { pickImageAndGalery } from "../../utils/selectImages";

export default function RegisterScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [telefono, setTelefono] = useState("");
    const [imagen, setImagen] = useState(null);
    const [selectedImagen, setSelectedImagen] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    function imagenSeleccionada(asset) {
        setSelectedImagen(asset.uri);

        const mime = asset.mimeType ?? 'image/jpeg';
        const ext = mime.split('/')[1] ?? 'jpg';

        const file = {
            uri: asset.uri,
            name: asset.fileName ?? `photo_${Date.now()}.${ext}`,
            type: mime,
        };

        setImagen(file);
    }

    const strength = evaluatePasswordStrength(password);

    function evaluatePasswordStrength(password) {
        if (!password || password.length === 0) {
            return { label: "", color: "transparent" };
        }

        let score = 0;

        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) {
            return { label: "Débil", color: "#E53935" };
        } else if (score === 3 || score === 4) {
            return { label: "Media", color: "#FB8C00" };
        } else {
            return { label: "Alta", color: "#43A047" };
        }
    }

    const handleRegister = async () => {
        if (!nombre || !apellido || !correo || !password || !telefono) {
            Alert.alert("KUSKATAN", "Por favor completa todos los campos");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Contraseña débil", "Debe tener al menos 6 caracteres");
            return;
        }

        try {
            setLoading(true);

            const userInfo = new FormData();
            userInfo.append('nombreUsuario', nombre);
            userInfo.append('apellidoUsuario', apellido);
            userInfo.append('correoUsuario', correo);
            userInfo.append('passwordUsuario', password);
            userInfo.append('telefonoUsuario', telefono);

            if (imagen) {
                userInfo.append('usuarioImagen', imagen);
            }

            const data = await makeRequest(`/usuarios/register`, { method: 'post' }, userInfo);
            Alert.alert("KUSKATAN", data.message);

            if (data.data > 0) {
                navigation.navigate("Login");
            }

        } catch (error) {
            console.log(error);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingTop: insets.top + 10,
                    paddingBottom: insets.bottom + 140, // 👈 espacio extra para que no tape el botón
                    paddingHorizontal: 20,
                }}
                showsVerticalScrollIndicator={false}
            >
                <AuthHeader title="KUSKATAN" subtitle="Crea tu cuenta en KUSKATAN" />

                <Input
                    label="Nombre"
                    value={nombre}
                    onChangeText={setNombre}
                    leftIcon="person-outline"
                />

                <Input
                    label="Apellido"
                    value={apellido}
                    onChangeText={setApellido}
                    leftIcon="person-outline"
                />

                <Input
                    label="Correo"
                    value={correo}
                    onChangeText={setCorreo}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    leftIcon="mail-outline"
                />

                <Input
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    leftIcon="lock-closed-outline"
                    rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
                    onRightIconPress={() => setShowPass(!showPass)}
                />

                {password.length > 0 && (
                    <Text style={[styles.passwordStrength, { color: strength.color }]}>
                        Seguridad: {strength.label}
                    </Text>
                )}

                <Input
                    label="Teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                />

                <TouchableOpacity style={styles.imagePicker} onPress={() => pickImageAndGalery(imagenSeleccionada)}>
                    {selectedImagen ? (
                        <Image source={{ uri: selectedImagen }} style={styles.preview} />
                    ) : (
                        <Text style={styles.imageText}>Seleccionar foto de perfil</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Botón fijo abajo */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
                <PrimaryButton
                    title={loading ? "Creando..." : "Registrarme"}
                    onPress={handleRegister}
                    disabled={loading}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    imagePicker: {
        marginTop: 12,
        width: "100%",
        height: 120,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    imageText: {
        color: colors.info,
    },
    preview: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        backgroundColor: "transparent",
    },
});