import React, { useState } from "react";
import {
    View, Text, StyleSheet, Alert, KeyboardAvoidingView,
    Platform,
} from "react-native";
import AuthHeader from "../../components/AuthHeader";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";
import { makeRequest } from "../../services/fetchRequest";
import { getData, storeData } from '../../utils/LocalStorage';

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

export default function ResetPasswordScreen({ navigation, route }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const email = route?.params?.email;
    const token = route?.params?.token;
    const isLoggedFlow = route?.params?.isLoggedFlow === true;

    const strength = evaluatePasswordStrength(password);

    const handleVerifyCurrentPassword = async () => {
        try {
            if (!currentPassword) {
                Alert.alert("KUSKATAN", "Ingresa tu contraseña actual.");
                return;
            }

            setVerifying(true);

            const formData = new FormData();
            formData.append("passwoord", currentPassword);
            formData.append("usuarioId", await getData('idUser', null));

            const data = await makeRequest(`/usuarios/verificar-password`, { method: "post" }, formData);
            if (data.message.length > 0) {
                Alert.alert("Error", data.message);
            } else {
            setIsVerified(true);
            Alert.alert("Verificado", "Contraseña correcta. Ahora ingresa tu nueva contraseña.");
            }

        } catch (error) {
            console.log("Error verifying password:", err);
            if (error?.status === 500) {
                Alert.alert("Error", error.data.message);
            } else if (error?.status === 401) {
                Alert.alert("Error", error.data.message);
            } else {
                Alert.alert("Error", "Ocurrió un problema de conexión o del servidor");
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleReset = async () => {
        try {
            if (!password || !confirm) {
                Alert.alert("KUSKATAN", "Completa ambos campos de contraseña.");
                return;
            }

            if (password.length < 6) {
                Alert.alert("Contraseña débil", "Debe tener al menos 6 caracteres.");
                return;
            }

            if (password !== confirm) {
                Alert.alert("KUSKATAN", "Las contraseñas no coinciden.");
                return;
            }

            let data;

            if (isLoggedFlow) {
                const formData = new FormData();
                formData.append("currentPassword", currentPassword);
                formData.append("password", password);
                formData.append("usuarioId", await getData('idUser', null));

                data = await makeRequest(
                    `/usuarios/cambiar-password-auth`,
                    { method: "post" },
                    formData
                );

                setCurrentPassword("");
                setPassword("");
                setConfirm("");
                setIsVerified(false);

                Alert.alert(
                    "Contraseña actualizada",
                    "Tu contraseña ha sido cambiada correctamente.",
                    [
                        {
                            text: "Ir a ajustes",
                            onPress: () => navigation.navigate("Settings"),
                        }
                    ]
                );

            } else {
                const formData = new FormData();
                formData.append("correo", email);
                formData.append("token", token);
                formData.append("password", password);

                data = await makeRequest(
                    `/usuarios/cambiar-password`,
                    { method: "post" },
                    formData
                );

                Alert.alert(
                    "Contraseña actualizada",
                    "Tu contraseña ha sido cambiada correctamente.",
                    [
                        {
                            text: "Ir a iniciar sesión",
                            onPress: () => navigation.navigate("Login"),
                        },
                    ]
                );
            }

        } catch (err) {
            console.log("Error resetting password:", err);
            Alert.alert("Error", "No se pudo cambiar la contraseña.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <AuthHeader title="KUSKATAN" subtitle="Nueva contraseña" />

                <Text style={styles.title}>Restablece tu contraseña</Text>
                <Text style={styles.subtitle}>
                    {isLoggedFlow 
                        ? (isVerified 
                            ? "Ahora crea tu nueva contraseña." 
                            : "Primero verifica tu identidad con tu contraseña actual.")
                        : "Crea una nueva contraseña para tu cuenta."
                    }
                </Text>

                {isLoggedFlow && !isVerified ? (
                    <>
                        <Input
                            label="Contraseña actual"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showCurrent}
                            leftIcon="lock-closed-outline"
                            rightIcon={showCurrent ? "eye-off-outline" : "eye-outline"}
                            onRightIconPress={() => setShowCurrent(!showCurrent)}
                        />

                        <PrimaryButton
                            title={verifying ? "Verificando..." : "Verificar contraseña"}
                            onPress={handleVerifyCurrentPassword}
                            style={{ marginTop: 16 }}
                            disabled={verifying}
                        />
                    </>
                ) : (
                    <>
                        <Input
                            label="Nueva contraseña"
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
                            label="Confirmar contraseña"
                            value={confirm}
                            onChangeText={setConfirm}
                            secureTextEntry={!showConfirm}
                            leftIcon="lock-closed-outline"
                            rightIcon={showConfirm ? "eye-off-outline" : "eye-outline"}
                            onRightIconPress={() => setShowConfirm(!showConfirm)}
                        />

                        <PrimaryButton
                            title="Guardar nueva contraseña"
                            onPress={handleReset}
                            style={{ marginTop: 16 }}
                        />
                    </>
                )}

                <Text style={styles.helper}>
                    Por su seguridad, utilice una contraseña única y no la comparta con nadie.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    helper: {
        marginTop: 16,
        fontSize: 12,
        color: colors.textSecondary || colors.info,
    },
    passwordStrength: {
        marginTop: -6,
        marginBottom: 8,
        fontSize: 12,
    },
});
