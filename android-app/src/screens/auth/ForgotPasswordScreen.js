// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import AuthHeader from "../../components/AuthHeader";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";
import { makeRequest } from "../../services/fetchRequest";

export default function ForgotPasswordScreen({ navigation }) {
    const [correo, setCorreo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!correo.trim()) {
            Alert.alert("KUSKATAN", "Ingresa el correo asociado a tu cuenta.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("correo", correo);

            const data = await makeRequest(`/usuarios/recuperacion-password`, { method: 'post' }, formData);
            Alert.alert(
                "Correo enviado",
                "Te hemos enviado un enlace para restablecer tu contraseña. Para efectos de la demo, también puedes continuar con el flujo de código.",
                [
                    {
                        text: "Continuar con código",
                        onPress: () =>
                            navigation.navigate("VerifyCode", { email: correo.trim() }),
                    },
                    { text: "Cerrar", style: "cancel" },
                ]
            );
            

        } catch (error) {
            console.log("Error reset password:", error);
            let msg = "Ocurrió un error al enviar el correo.";
            if (error.code === "auth/user-not-found") {
                msg = "No existe ninguna cuenta con ese correo.";
            } else if (error.code === "auth/invalid-email") {
                msg = "El formato del correo no es válido.";
            }
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <AuthHeader
                    title="KUSKATAN"
                    subtitle="Recupera el acceso a tu cuenta"
                />

                <Text style={styles.title}>Encuentra tu cuenta</Text>
                <Text style={styles.subtitle}>
                    Ingresa tu dirección de correo electrónico asociada a KUSKATAN para
                    enviarte un enlace de recuperación.
                </Text>

                <Input
                    label="Correo electrónico"
                    value={correo}
                    onChangeText={setCorreo}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    leftIcon="mail-outline"
                    placeholder="ejemplo@correo.com"
                />

                <PrimaryButton
                    title={loading ? "Enviando..." : "Enviar enlace"}
                    onPress={handleReset}
                    disabled={loading}
                    style={{ marginTop: 12 }}
                />

                <Text style={styles.infoText}>
                    Por seguridad, el cambio de contraseña se realiza desde el enlace que
                    recibirás en tu correo.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.title,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.info,
        marginBottom: 20,
    },
    infoText: {
        marginTop: 16,
        fontSize: 12,
        color: colors.textSecondary || colors.info,
    },
});
