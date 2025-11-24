import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";
import AuthHeader from "../../components/AuthHeader";
import { makeRequest } from "../../services/fetchRequest";
import { registerForPushNotificationsAsync } from "../../services/notifications";
import { storeData } from "../../utils/LocalStorage";

export default function LoginScreen({ navigation, setUser }) {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [devicePushToken, setDevicePushToken] = useState(null);

    useEffect(() => {
        (async () => {
            const { deviceToken } = await registerForPushNotificationsAsync();

            setDevicePushToken(deviceToken);
        })();
    }, []);

    const handleLogin = async () => {
        if (!correo || !password) {
            Alert.alert("KUSKATAN", "Ingresa tu correo y contraseña");
            return;
        }

        try {
            setLoading(true);

            const userInfo = {
                correoUsuario: correo,
                passwordUsuario: password,
                tokenUsuario: devicePushToken
            }

            const data = await makeRequest(`/usuarios/login`, { method: 'post' }, userInfo);

            if (data.message.length > 0) {
                Alert.alert("Error", data.message);
            } else {
                storeData("tokenUser", data.data.tokenUsuario);
                storeData("user_profile", data.data.nombreUsuario);
                storeData("user_image", data.data.usuarioImagenUrl || "");
                storeData("tokenNotification", devicePushToken);
                storeData("idUser", data.data.idUsuario.toString());
                setUser(data.data.idUsuario);
            }
        } catch (error) {
            console.log('Error en login:', error);
            if (error?.status === 500) {
                Alert.alert("Error", error.data.message);
            } else if (error?.status === 401) {
                Alert.alert("Error", error.data.message);
            } else {
                Alert.alert("Error", "Ocurrió un problema de conexión o del servidor");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AuthHeader title="KUSKATAN" subtitle="Inicia sesión para continuar" />

            <Input
                label="Correo"
                value={correo}
                onChangeText={setCorreo}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon="mail-outline"
                placeholder="ejemplo@gmail.com"
            />

            <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                leftIcon="lock-closed-outline"
                rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPass(prev => !prev)}
                placeholder="Ingresa tu contraseña"
            />

            <PrimaryButton
                title={loading ? "Ingresando..." : "Iniciar sesión"}
                onPress={handleLogin}
                style={{ marginTop: 8 }}
                disabled={loading}
            />

            { }
            <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={{ marginTop: 14 }}
            >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            { }
            <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                style={{ marginTop: 20 }}
            >
                <Text style={styles.link}>
                    ¿No tienes cuenta?{" "}
                    <Text style={{ color: colors.accent }}>Crear una</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingTop: 70,
    },
    link: {
        color: colors.title,
        textAlign: "center",
    },
    forgotText: {
        textAlign: "center",
        color: colors.info,
        textDecorationLine: "underline",
    },
});
