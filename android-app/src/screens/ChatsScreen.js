import React, { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Image, TextInput, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useCallback } from "react";
import { makeRequest } from "../services/fetchRequest";
import { getFormatoFecha } from "../utils/formatDate";
import { getData } from "../utils/LocalStorage";

export default function ChatsScreen() {
    const navigation = useNavigation();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(0);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            await getData('idUser', setUserId)
        })();

        return () => {
            isMounted = false;
        };
    }, []);
    
    useEffect(() => {
        loadChats();
    }, [userId]);

    async function loadChats() {
        try {
            if (userId == 0) { return };
            const data = await makeRequest(`/chats/listado/${userId}/0`);
            setChats(data.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadChats();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView>
            <View style={styles.contentPage}>
                <Text style={styles.title}>Mis chats</Text>
                <FlatList
                    data={chats}
                    keyExtractor={(i) => i.chatId}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => navigation.navigate("Chat", { receptorId: item.usuarioId })}
                        >
                            <View style={styles.card}>
                                <Image source={{ uri: item.imagenUsuario }} style={styles.avatar} />

                                <View style={styles.content}>

                                    <View style={styles.topRow}>
                                        <Text
                                            style={styles.name}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.nombreUsuario}
                                        </Text>

                                        <Text style={styles.time} numberOfLines={1}>
                                            {getFormatoFecha(item.fechaUltimoMensaje)}
                                        </Text>
                                    </View>

                                    <Text
                                        style={styles.preview}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.ultimoMensaje}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 18,
        width: '100%',
        elevation: 1,
    },
    avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },

    content: {
        flex: 1,
        minWidth: 0,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        flex: 1,
        minWidth: 0,
        fontSize: 16,
        fontWeight: '700',
        color: '#1b1b1b',
        marginRight: 8,
    },

    time: {
        flexShrink: 0,
        color: '#9aa0a6',
        fontSize: 12,
    },

    preview: {
        marginTop: 6,
        color: '#5f6368',
        fontSize: 14,
    },
    searcher: {
        backgroundColor: "#fff",
        marginBottom: 20,
        padding: 5,
        borderRadius: 10
    },
    contentPage: {
        padding: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        marginBottom: 30,
        marginTop: 10
    },
    input: {
        color: "#000",
        backgroundColor: "#f5f5f5",
        borderBottomColor: "#000000",
        paddingLeft: 10,
        paddingRight: 10
    },
});

