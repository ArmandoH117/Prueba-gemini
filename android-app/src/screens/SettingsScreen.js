import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeRequest } from "../services/fetchRequest";
import { removeToken } from "../utils/LocalStorage";
import { getData } from "../utils/LocalStorage";
import LoadingScreen from "../components/LoadingScreen";

export default function SettingsScreen({ navigation, setUser }) {
    const [darkMode, setDarkMode] = React.useState(false);
    const [pushEnabled, setPushEnabled] = React.useState(true);
    const [userId, setUserId] = useState(0);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            await getData("idUser", setUserId)
            await getData("tokenNotification", setToken)
        })();
    }, []);

    async function logout() {
        try {
            setLoading(true);

            const infoUser = {
                idUsuario: userId,
                tokenUsuario: token
            };

            await makeRequest('/usuarios/logout', { method: "post" }, infoUser);

            removeToken("tokenUser");
            removeToken("tokenNotification");
            removeToken("idUser");
            setUser(null);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }

    const eliminarCuenta = async () => {
        Alert.alert(
            "Eliminar",
            `¿Estas seguro que quieres eliminar tu cuenta?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);

                            const infoUser = {
                                idUsuario: userId,
                                tokenUsuario: token
                            };

                            const data = await makeRequest('/usuarios/eliminar-cuenta', { method: "post" }, infoUser);

                            if (data.data) {
                                removeToken("tokenUser");
                                removeToken("tokenNotification");
                                removeToken("idUser");
                                setUser(null);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        setLoading(false);
                    },
                },
            ]
        );
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Configuracion</Text>

            <Text style={styles.sectionTitle}>Cuenta</Text>
            <TouchableOpacity
                style={styles.option}
                onPress={() => navigation.navigate("EditProfile")}
            >
                <Ionicons name="person-outline" size={22} color="#333" />
                <Text style={styles.optionText}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={() => { navigation.navigate("ResetPassword", { isLoggedFlow: true }) }}>
                <Ionicons name="lock-closed-outline" size={22} color="#333" />
                <Text style={styles.optionText}>Cambiar contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#333" />
                <Text style={styles.optionText}>Privacidad</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Notificaciones</Text>
            <View style={styles.option}>
                <Ionicons name="notifications-outline" size={22} color="#333" />
                <Text style={styles.optionText}>Notificaciones push</Text>
                <Switch
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    thumbColor={pushEnabled ? "#007AFF" : "#ccc"}
                />
            </View>

            <Text style={styles.sectionTitle}>Apariencia</Text>
            <View style={styles.option}>
                <Ionicons name="moon-outline" size={22} color="#333" />
                <Text style={styles.optionText}>Modo oscuro</Text>
                <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    thumbColor={darkMode ? "#007AFF" : "#ccc"}
                />
            </View>

            <Text style={styles.sectionTitle}>Sesión</Text>
            <TouchableOpacity style={[styles.option, styles.dangerOption]}
                onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
                <Text style={[styles.optionText, { color: "#e74c3c" }]}>Cerrar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={eliminarCuenta}>
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                <Text style={[styles.optionText, { color: "#e74c3c" }]}>Eliminar cuenta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
        color: "#000",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginVertical: 10,
        color: "#555",
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1,
        justifyContent: "space-between",
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        marginLeft: 10,
    },
    dangerOption: {
        backgroundColor: "#fff5f5",
    },
});
