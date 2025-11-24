package com.uso_android.api.dtos.groq;

import java.util.List;

public class TranslateDto {
    public static record TranslateReq(String text, String sourceLang, String targetLang) { }

    public static record TranslateRes(String translation) { }

    public static record GroqMessage(String role, String content) { }

    public static record GroqReq(String model, List<GroqMessage> messages, Double temperature) { }

    public static record GroqChoice(GroqMessage message) { }

    public static record GroqRes(List<GroqChoice> choices) { }
}
