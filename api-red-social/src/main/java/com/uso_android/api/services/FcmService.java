package com.uso_android.api.services;

import com.uso_android.api.entities.Mensaje;
import com.uso_android.api.entities.Usuario;

import org.springframework.stereotype.Service;
import com.google.firebase.messaging.*;

@Service
public class FcmService {

    public String sendChatPush(Mensaje chat) throws Exception {

        Usuario receptor;

        if (chat.getUsuario().getIdUsuario() == chat.getChat().getUsuario1().getIdUsuario()) {
            receptor = chat.getChat().getUsuario2();
        } else {
            receptor = chat.getChat().getUsuario1();
        }

        AndroidConfig android = AndroidConfig.builder()
                .setPriority(AndroidConfig.Priority.HIGH)
                .setCollapseKey("chat_" + chat.getMensajeId())
                .setNotification(AndroidNotification.builder()
                        .setChannelId("default")
                        .build())
                .build();

        Notification notif = Notification.builder()
                .setTitle(receptor.getNombreUsuario() + " " + receptor.getApellidoUsuario())
                .setBody(chat.getMensajeTexto())
                .build();

        Message msg = Message.builder()
                .setTopic("user_" + receptor.getIdUsuario())
                .setAndroidConfig(android)
                .setNotification(notif)
                .putData("type", "chat_message")
                .putData("chatId", chat.getChat().getChatId().toString())
                .putData("messageId", chat.getMensajeId().toString())
                .putData("usuarioId", chat.getUsuario().getIdUsuario().toString())
                .putData("text", chat.getMensajeTexto())
                .putData("ts", chat.getMensajeEnvio().toString())
                .build();

        return FirebaseMessaging.getInstance().send(msg);
    }
}
