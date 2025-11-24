package com.uso_android.api.services;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct; // <-- jakarta
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @PostConstruct
    public void initFirebase() {
        try {
            if (!FirebaseApp.getApps().isEmpty())
                return;

            GoogleCredentials creds;
            if (credentialsPath != null && !credentialsPath.isBlank()) {
                // 1) intenta en resources, 2) si no, como ruta absoluta
                Resource res = new ClassPathResource(credentialsPath);
                if (!res.exists())
                    res = new FileSystemResource(credentialsPath);

                if (!res.exists()) {
                    throw new IllegalStateException("No se encontró el archivo de credenciales: " + credentialsPath);
                }
                try (InputStream in = res.getInputStream()) {
                    creds = GoogleCredentials.fromStream(in);
                }
            } else {
                // alternativa: variable de entorno GOOGLE_APPLICATION_CREDENTIALS
                creds = GoogleCredentials.getApplicationDefault();
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(creds)
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("[Firebase] Inicializado OK");
        } catch (Exception e) {
            throw new IllegalStateException("Error inicializando Firebase: " + e.getMessage()
                    + " (credentialsPath=" + credentialsPath + ")", e);
        }
    }
}
