import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { activeChatIdRef } from './notificationsState';

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const d = notification?.request?.content?.data || {};
        const isChatMsg = d.type === 'chat_message';
        const isSameChat = isChatMsg && d.chatId == activeChatIdRef.current;

        const base = {
            shouldShowAlert: !isSameChat,
            shouldPlaySound: !isSameChat,
            shouldSetBadge: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
        };

        if (Platform.OS === 'ios') {
            return { ...base, shouldShowBanner: !isSameChat, shouldShowList: !isSameChat };
        }
        return base;
    },
});
