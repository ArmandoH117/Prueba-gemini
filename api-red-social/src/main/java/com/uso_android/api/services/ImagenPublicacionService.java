package com.uso_android.api.services;

import com.uso_android.api.dtos.publicacion.ImagenPublicacionDto;
import com.uso_android.api.repositories.ImagenPublicacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImagenPublicacionService {

    private final ImagenPublicacionRepository imagenPublicacionRepository;
    private final GcsService gcsService;

    public List<ImagenPublicacionDto> getImagenesPublicadas(Integer idUsuario, Integer page) {
        return this.generarUrlTemporal(this.imagenPublicacionRepository.getImagenesPublicadas(idUsuario, page));
    }

    private List<ImagenPublicacionDto> generarUrlTemporal(List<ImagenPublicacionDto> listado) {
        for (ImagenPublicacionDto info : listado) {
            info.setPublicacionImagenUrl(gcsService.generarUrlTemporal(info.getPublicacionImagenUrl()));
        }
        return listado;
    }
}
