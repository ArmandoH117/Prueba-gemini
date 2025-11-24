package com.uso_android.api.dtos.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Setter
@Getter
public class ChatRequest {
    public String fcmToken;
    public String chatId;
    public String messageId;
    public String senderName;
    public String text;
}
