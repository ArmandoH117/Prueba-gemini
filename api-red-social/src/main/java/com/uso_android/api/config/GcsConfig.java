package com.uso_android.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.StorageOptions;
import org.springframework.core.io.Resource;
import org.springframework.context.annotation.Bean;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import com.google.cloud.storage.Storage;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GcsConfig {

    @Value("${gcs.credentials.path}")
    private Resource credentialsPath;

    @Bean
    public Storage storage() throws IOException {
        try (InputStream is = credentialsPath.getInputStream()) {
            return StorageOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(is))
                    .build()
                    .getService();
        }
    }
}

