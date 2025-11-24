package com.uso_android.api.services;

import java.util.List;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.TopicManagementResponse;
import org.springframework.stereotype.Service;

@Service
public class PushTopicsService {

    private String topicForUser(Integer userId) {
        return "user_" + userId;
    }

    public void subscribeUserTokens(Integer userId, List<String> tokens) throws Exception {
        String topic = topicForUser(userId);
        TopicManagementResponse res = FirebaseMessaging.getInstance()
                .subscribeToTopic(tokens, topic);
        System.out.println("Subscribed: success=" + res.getSuccessCount() + " failure=" + res.getFailureCount());
    }

    public void unsubscribeUserTokens(Integer userId, List<String> tokens) throws Exception {
        String topic = topicForUser(userId);
        TopicManagementResponse res = FirebaseMessaging.getInstance()
                .unsubscribeFromTopic(tokens, topic);
        System.out.println("Unsubscribed: success=" + res.getSuccessCount() + " failure=" + res.getFailureCount());
    }
}
