import React, { useState } from "react";
import {
    View, Text, StyleSheet, TextInput, Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import AuthHeader from "../../components/AuthHeader";
import PrimaryButton from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";
import { makeRequest } from "../../services/fetchRequest";

export default function VerifyCodeScreen({ navigation, route }) {
    const [code, setCode] = useState("");
    const email = route?.params?.email;

    const handleChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
        setCode(cleaned);
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            Alert.alert("KUSKATAN", "Ingresa el código de 6 dígitos.");
            return;
        }

        const formData = new FormData();
        formData.append("correo", email);
        formData.append("codigo", code);

        console.log("Verifying code for email:", email, "with code:", code);

        const data = await makeRequest(`/usuarios/verificar-codigo`, { method: 'post' }, formData);
        console.log("Reset password response:", data);
        if (data.message?.length > 0) {
            Alert.alert('Error', data.message);
        } else {
            Alert.alert(
                "Código verificado",
                "El código es correcto.",
                [
                    {
                        text: "Continuar",
                        onPress: () =>
                            navigation.navigate("ResetPassword", {
                                email: email,    
                                token: data.token
                            }),
                    },
                ]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.container}>
                <AuthHeader
                    title="KUSKATAN"
                    subtitle="Verificación de seguridad"
                />

                <Text style={styles.title}>Ingresa el código</Text>
                <Text style={styles.subtitle}>
                    Hemos enviado un código de 6 dígitos al correo asociado a tu cuenta.
                    Escríbelo para continuar con la recuperación.
                </Text>

                <TextInput
                    style={styles.codeInput}
                    value={code}
                    onChangeText={handleChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                />

                <PrimaryButton
                    title="Verificar código"
                    onPress={handleVerify}
                    style={{ marginTop: 20 }}
                />

                <Text style={styles.helper}>
                    Por favor, no comparta su código con nadie.
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
    codeInput: {
        alignSelf: "center",
        width: 160,
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E4E6EB",
        backgroundColor: "#fff",
        fontSize: 24,
        letterSpacing: 12,
    },
    helper: {
        marginTop: 16,
        fontSize: 12,
        color: colors.textSecondary || colors.info,
    },
});
