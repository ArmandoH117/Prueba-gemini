import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";

export default function useNotificationNavigation() {
    const navigation = useNavigation();

    useEffect(() => {
        const sub = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data || {};
            if (data.type === "chat_message" && data.chatId) {
                navigation.navigate("Chat", { chatId: data.chatId });
            }
        });
        return () => sub.remove();
    }, [navigation]);

    useEffect(() => {
        (async () => {
            const last = await Notifications.getLastNotificationResponseAsync();
            const data = last?.notification?.request?.content?.data || {};
            if (data.type === "chat_message" && data.chatId) {
                setTimeout(() => {
                    navigation.navigate("Chat", { chatId: data.chatId });
                }, 0);
            }
        })();
    }, [navigation]);
}
