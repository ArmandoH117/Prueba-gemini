import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from "react";
import { getData } from "../utils/LocalStorage";
import { makeRequest } from "../services/fetchRequest";

export default function SuggestionsScreen() {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(0);
    const [requests, setRequests] = useState([]);

    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        getData('idUser', setUserId)
    }, []);

    useEffect(() => {
        loadAmigos();
    }, [userId]);

    async function loadAmigos() {
        try {
            if (userId == 0) { return }
            const data = await makeRequest(`/amistades/listado/${userId}`);
            
            setRequests(data.data);
            setSuggestions(data.sugerencias);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function cambiarEstadoSolicitud(estado, info) {
        try {
            if (userId == 0) { return }

            const data = await makeRequest(`/amistades/aceptar-rechazar/${info.solicitudId}/${estado}`);

            if (data.data) {
                setRequests(prev => prev.filter(item => item.solicitudId !== info.solicitudId));
                Alert.alert("KUSKATAN", `Has aceptado la solicitud de amistad de ${info.nombreUsuario}`);

            } else {
                Alert.alert("KUSKATAN", "No fue posible procesar la solicitud");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function solicitarAmistad(info) {
        try {
            if (userId == 0) { return }

            const infoSolicitud = {
                solicitudId: info.idUsuario,
                idUsuario: userId
            }

            const data = await makeRequest(`/amistades/solicitud`, { method: 'post' }, infoSolicitud);

            if (data.data && Number.isInteger(data.data)) {
                setSuggestions(prev => prev.filter(item => item.idUsuario !== info.idUsuario));
                Alert.alert("KUSKATAN", `Se ha enviado la solicitud de amistad a ${info.nombreUsuario}`);
            } else {
                Alert.alert("KUSKATAN", "No fue posible procesar la solicitud");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const renderRequest = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Perfil', { idUsuario: item.idUsuario })}>
            <Image source={{ uri: item.usuarioImagen }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.nombreUsuario}</Text>
                <Text style={styles.mutual}>{item.amigosComunes} amigos en común</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => cambiarEstadoSolicitud(1, item)}
                    style={[styles.iconButton, styles.confirmButton]}
                >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => cambiarEstadoSolicitud(0, item)}
                    style={[styles.iconButton, styles.deleteButton]}
                >
                    <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // const renderSuggestion = (item) => (
    //     <View style={styles.card} key={item.idUsuario}>
    //         <Image source={{ uri: item.usuarioImagen }} style={styles.avatar} />
    //         <View style={styles.info}>
    //             <Text style={styles.name}>{item.nombreUsuario}</Text>
    //             <Text style={styles.mutual}>{item.amigosComunes} amigos en común</Text>
    //         </View>
    //         <TouchableOpacity onPress={() => solicitarAmistad(item)}
    //             style={styles.addButton}
    //         >
    //             <Ionicons name="person-add-outline" size={20} color="#000" />
    //         </TouchableOpacity>
    //     </View>
    // );
    const renderSuggestion = (item) => (
        <TouchableOpacity
            style={styles.card}
            key={item.idUsuario}
            onPress={() => navigation.navigate('Perfil', { idUsuario: item.idUsuario })}

            activeOpacity={0.7}
        >
            <Image source={{ uri: item.usuarioImagen }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.nombreUsuario}</Text>
                <Text style={styles.mutual}>{item.amigosComunes} amigos en común</Text>
            </View>
            <TouchableOpacity
                onPress={(e) => {
                    e.stopPropagation();
                    solicitarAmistad(item);
                }}
                style={styles.addButton}
            >
                <Ionicons name="person-add-outline" size={20} color="#000" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const ListFooter = () => (
        <>
            {requests.length > 0 && suggestions.length > 0 && (
                <View style={styles.divider} />
            )}

            {suggestions.length > 0 && (
                <Text style={styles.sectionTitle}>Personas que quizás conozcas</Text>
            )}

            {suggestions.map(item => renderSuggestion(item))}
        </>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.solicitudId}
                renderItem={renderRequest}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        <Text style={styles.headerTitle}>Amigos</Text>

                        <TouchableOpacity
                            style={styles.friendsButton}
                            onPress={() => navigation.navigate("friends", { userProfileId: userId })}
                        >
                            <Ionicons name="people-outline" size={18} color="#000" />
                            <Text style={styles.friendsButtonText}>Ver todos</Text>
                        </TouchableOpacity>

                        {requests.length > 0 && (
                            <Text style={styles.sectionTitle}>Solicitudes</Text>
                        )}
                    </>
                }
                ListFooterComponent={<ListFooter />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No tienes solicitudes pendientes</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        paddingTop: 50,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: "700",
        color: "#000",
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    friendsButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginBottom: 24,
        backgroundColor: "#F0F0F0",
    },
    friendsButtonText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "500",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
        marginTop: 4,
    },
    divider: {
        height: 0.5,
        backgroundColor: "#E0E0E0",
        marginVertical: 24,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        marginBottom: 10,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
        backgroundColor: "#F0F0F0",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 2,
    },
    mutual: {
        fontSize: 13,
        color: "#666",
    },
    buttons: {
        flexDirection: "row",
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmButton: {
        backgroundColor: "#000",
    },
    deleteButton: {
        backgroundColor: "#F0F0F0",
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0F0F0",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        color: "#999",
        textAlign: "center",
        marginTop: 12,
        fontSize: 15,
    },
});