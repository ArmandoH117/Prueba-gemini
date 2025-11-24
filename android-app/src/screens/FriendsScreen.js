import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from "react";
import { makeRequest } from "../services/fetchRequest";
import { getData } from "../utils/LocalStorage";
import { getFormatoFecha } from "../utils/formatDate";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function FriendsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const userProfileId = route.params?.userProfileId;

    const [searchQuery, setSearchQuery] = useState("");
    const [friends, setFriends] = useState([]);
    const [userId, setUserId] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);

    const filteredFriends = friends.filter(friend =>
        friend.usuarioImagen.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        getData('idUser', setUserId)
    }, []);

    useEffect(() => {
        loadAmigos();
    }, [userProfileId, userId]);

    const setUsuarioInfo = (item) => {
        if (selectedUser && selectedUser == item) {
            setSelectedUser(null);
            return;
        }
        setSelectedUser(item);
    };


    async function loadAmigos() {
        try {
            if (userId == 0 || userProfileId == 0) { return }
            const data = await makeRequest(`/amistades/amigos/${userProfileId}`);

            setFriends(data.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleGoToChat = (receptorId) => {
        navigation.navigate('Chats', {
            screen: 'Chat',
            params: { receptorId },
        });
    };

    const eliminarAmistad = (infoAmistad) => {
        Alert.alert(
            "Eliminar amigo",
            `¿Seguro que quieres eliminar a ${infoAmistad.nombreUsuario}?`,
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
                            const info = {
                                idUsuario: userId,
                                solicitudId: infoAmistad.idUsuario,
                            };

                            const data = await makeRequest(
                                `/amistades/eliminar`,
                                { method: "post" },
                                info
                            );

                            if (data.data) {
                                setFriends((prev) =>
                                    prev.filter(
                                        (friend) =>
                                            friend.idUsuario !== infoAmistad.idUsuario
                                    )
                                );

                                if (
                                    selectedUser &&
                                    selectedUser.idUsuario === infoAmistad.idUsuario
                                ) {
                                    setSelectedUser(null);
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    },
                },
            ]
        );
    };

    const silenciarAmistad = async (infoAmistad) => {

        try {
            const info = {
                idUsuario: userId,
                solicitudId: infoAmistad.idUsuario,
                silenciarAmistad: !infoAmistad.amistadSilenciada
            };

            const data = await makeRequest(
                `/amistades/silenciar`,
                { method: "post" },
                info
            );

            if (data.data) {
                infoAmistad.amistadSilenciada = !infoAmistad.amistadSilenciada;
                setSelectedUser({ ...infoAmistad });;
            }
        } catch (error) {
            console.log(error);
        }
    };


    const renderFriend = ({ item }) => {
        const isSelected = selectedUser?.idUsuario === item.idUsuario;

        return (
            <View
                style={[
                    styles.friendCard,
                    isSelected && styles.friendCardSelected,
                ]}
            >
                <Image source={{ uri: item.usuarioImagen }} style={styles.avatar} />

                <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.nombreUsuario}</Text>
                    <Text style={styles.friendSince}>
                        Amigos desde hace {getFormatoFecha(item.solicitudCreacion)}
                    </Text>
                </View>

                <View style={styles.actions}>
                    { item.idUsuario != userId && (
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={20}
                                color="#000"
                                onPress={() => handleGoToChat(item.idUsuario)}
                            />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => setUsuarioInfo(item)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                {isSelected && (
                    <View style={styles.optionsMenu}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() =>
                                navigation.navigate('Perfil', { idUsuario: item.idUsuario })
                            }
                        >
                            <Ionicons name="person-outline" size={18} color="#000" />
                            <Text style={styles.optionText}>Ver perfil</Text>
                        </TouchableOpacity>

                        { userProfileId == userId &&(
                            <>
                                <TouchableOpacity style={styles.optionItem} onPress={() => silenciarAmistad(item)}>
                                    { selectedUser.amistadSilenciada ? (
                                        <>
                                            <Ionicons name="notifications-outline" size={18} color="#000" />
                                            <Text style={styles.optionText}>Seguir</Text> 
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="notifications-off-outline" size={18} color="#000" />
                                            <Text style={styles.optionText}>Silenciar</Text> 
                                        </>
                                    )}
                                </TouchableOpacity>
                            
                                <TouchableOpacity style={styles.optionItem} onPress={() => eliminarAmistad(item)}>
                                    <Ionicons name="person-remove-outline" size={18} color="#e74c3c" />
                                    <Text
                                        style={[styles.optionText, { color: "#e74c3c" }]}
                                    >
                                        Eliminar
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{ userProfileId == userId ? 'Mis ' : '' }Amigos</Text>
                <Text style={styles.friendCount}>{friends.length} amigos</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar amigos..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.idUsuario}
                renderItem={renderFriend}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No se encontraron amigos</Text>
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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: "700",
        color: "#000",
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    friendCount: {
        fontSize: 15,
        color: "#666",
        fontWeight: "500",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    friendCard: {
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
        position: "relative",
    },
    friendCardSelected: {
        zIndex: 10,
        elevation: 6,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
        backgroundColor: "#F0F0F0",
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 3,
    },
    friendSince: {
        fontSize: 13,
        color: "#666",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0F0F0",
    },
    optionsMenu: {
        position: "absolute",
        right: 14,
        top: 60,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 1000,
        minWidth: 180,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 12,
    },
    optionText: {
        fontSize: 15,
        color: "#000",
        fontWeight: "500",
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