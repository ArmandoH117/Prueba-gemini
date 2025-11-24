package com.uso_android.api.services;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GcsService {

    @Value("${gcs.bucket.name}")
    private String bucketName;

    private final Storage storage;

    public GcsService(Storage storage) {
        this.storage = storage;
    }

    public String upload(MultipartFile file, String folder) throws IOException {
        String objectName = "app-android/" + folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return objectName;
    }

    public String generarUrlTemporal(String objectName) {
        return this.temporaryUrl(objectName, 1);
    }
  
    public String generarUrlTemporal(String objectName, Integer horas) {
        return this.temporaryUrl(objectName, horas);
    }

    private String temporaryUrl(String objectName, Integer horas){
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, objectName).build();

        URL url = storage.signUrl(
                blobInfo,
                horas, TimeUnit.HOURS,
                Storage.SignUrlOption.withV4Signature());

        return url.toString();
    }
}
