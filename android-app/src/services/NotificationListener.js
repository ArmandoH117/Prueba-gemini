// src/NotificationListener.jsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useActiveChat } from '../contexts/ActiveChatContext';
import { getFormatoFecha } from '../utils/formatDate';

function parse(content) {
    const d = content?.data || {};
    if (d.type !== 'chat_message') return null;
    return {
        chatId: d.chatId,
        messageId: d.messageId,
        senderName: d.senderName,
        text: d.text,
        ts: Number(d.ts) || Date.now(),
    };
}

export default function NotificationListener() {
    const navigation = useNavigation();
    const { activeChatId, appendToActive } = useActiveChat();

    useEffect(() => {
        const sub = Notifications.addNotificationReceivedListener(async (n) => {
            const m = parse(n.request?.content);
            if (!m) return;
            
            if (m.chatId == activeChatId) {
                try { await Notifications.dismissNotificationAsync(n.request.identifier); } catch {}
                appendToActive({ id: m.messageId, mensajeTexto: m.text, senderName: m.senderName, mensajeEnvio: m.ts });
            }
        });
        return () => sub.remove();
    }, [activeChatId, appendToActive]);

    useEffect(() => {
        const subTap = Notifications.addNotificationResponseReceivedListener((resp) => {
            const m = parse(resp.notification?.request?.content);
            if (m?.chatId) navigation.navigate('Chat', { chatId: m.chatId });
        });
        return () => subTap.remove();
    }, [navigation]);

    useEffect(() => {
        (async () => {
            const last = await Notifications.getLastNotificationResponseAsync();
            const m = parse(last?.notification?.request?.content);
            if (m?.chatId) setTimeout(() => navigation.navigate('Chat', { chatId: m.chatId }), 0);
        })();
    }, [navigation]);

    return null;
}
