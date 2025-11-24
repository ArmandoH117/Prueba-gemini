package com.uso_android.api.services;

import com.uso_android.api.repositories.VideoPublicacionRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import com.uso_android.api.dtos.publicacion.ImagenPublicacionDto;

@Service
@RequiredArgsConstructor
public class VideoPublicacionService {
    private final GcsService gcsService;
    private final VideoPublicacionRepository videoPublicacionRepository;

    public List<ImagenPublicacionDto> getVideosPublicados(Integer user, int page) {
        List<ImagenPublicacionDto> listado = videoPublicacionRepository.getVideosPublicados(user, page);
        
        for (ImagenPublicacionDto info : listado) {
            info.setPublicacionImagenUrl(gcsService.generarUrlTemporal(info.getPublicacionImagenUrl()));
        }

        return listado;
    }


}
