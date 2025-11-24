package com.uso_android.api.services;

import java.util.ArrayList;
import java.util.List;

import com.uso_android.api.entities.VideoPublicacion;
import com.uso_android.api.entities.enums.EstadoPublicacion;
import com.uso_android.api.repositories.VideoPublicacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.uso_android.api.dtos.publicacion.PublicacionDto;
import com.uso_android.api.entities.ImagenPublicacion;
import com.uso_android.api.entities.Publicacion;
import com.uso_android.api.exceptions.exception.NotFoundException;
import com.uso_android.api.repositories.ImagenPublicacionRepository;
import com.uso_android.api.repositories.publicaciones.PublicacionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublicacionService {

    private final PublicacionRepository publicacionRepository;
    private final ImagenPublicacionRepository imagenPublicacionRepository;
    private final VideoPublicacionRepository videoPublicacionRepository;
    private final GcsService gcsService;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public Publicacion getPublicacionReference(Integer id){
        if(!this.publicacionRepository.existsById(id)){
            throw new NotFoundException("Publicacion no encontrado con el ID: " + id);
        }
        return this.publicacionRepository.getReferenceById(id);
    }

    @Transactional
    public void actualizarCantidadComentarios(Integer publicacionId) {
        this.publicacionRepository.actualizarCantidadComentarios(publicacionId);
    }

    @Transactional
    public void incrementarCantidadReacciones(Integer publicacionId) {
        this.publicacionRepository.incrementarCantidadReacciones(publicacionId);
    }

    @Transactional
    public void descrementarCantidadReacciones(Integer publicacionId) {
        this.publicacionRepository.descrementarCantidadReacciones(publicacionId);
    }

    public List<PublicacionDto> getListado(Integer user, Integer page) {
        return this.getPublicaciones(this.publicacionRepository.getListado(user, page));
    }

    public List<PublicacionDto> getListado(Integer user) {
        return this.getPublicaciones(this.publicacionRepository.getListadoPersonales(user));
    }

    public List<PublicacionDto> getListado() {
        return this.getPublicaciones(this.publicacionRepository.getListadoPersonales());
    }

    public List<PublicacionDto> getListadoByUser(Integer user, Integer page) {
        return this.getPublicaciones(this.publicacionRepository.getListadoByUser(user, page));
    }
    
    public List<PublicacionDto> getListadoByUserProfile(Integer user, int page) {
        return this.getPublicaciones(this.publicacionRepository.getListadoByUserProfile(user, page));
    }

    private List<PublicacionDto> getPublicaciones(List<PublicacionDto> listado){
        for (PublicacionDto info : listado) {
            this.imagenesPublicacion(info);
            
            if(info.getPublicacionOriginalId() != null && info.getPublicacionOriginalId() > 0){
                PublicacionDto publicacionOriginal = publicacionRepository.getPublicacionDtoById(info.getPublicacionOriginalId());
                imagenesPublicacion(publicacionOriginal);
                info.setPublicacionOriginal(publicacionOriginal);
            }
        }

        return listado;
    }

    private void imagenesPublicacion(PublicacionDto info){
        if (info.isHasImages()) {
            List<String> rutasTemporales = imagenPublicacionRepository.getImagesByPublicacion(info.getPublicacionId());

            for (int i = 0; i < rutasTemporales.size(); i++) {
                String urlTemporal = gcsService.generarUrlTemporal(rutasTemporales.get(i));
                rutasTemporales.set(i, urlTemporal);
            }

            info.setImagenes(rutasTemporales);
        }

        if (Boolean.TRUE.equals(info.getHasVideos())) {
            List<String> rutasTemporales = videoPublicacionRepository.getVideosByPublicacion(info.getPublicacionId());

            for (int i = 0; i < rutasTemporales.size(); i++) {
                String urlTemporal = gcsService.generarUrlTemporal(rutasTemporales.get(i));
                rutasTemporales.set(i, urlTemporal);
            }

            info.setVideos(rutasTemporales);
        }
        
        if (info.getUsuarioImagen() != null && info.getUsuarioImagen().length() > 0) {
            info.setUsuarioImagen(
                gcsService.generarUrlTemporal(info.getUsuarioImagen())
            );
        }

    }

    @Transactional
    public PublicacionDto nuevaPublicacion(PublicacionDto publicacionDto) {
        
        Publicacion publicacion = new Publicacion();
        publicacion.setUsuario(this.usuarioService.getUsuarioReference(publicacionDto.getUsuarioId()));
        publicacion.setPublicacionContenido(publicacionDto.getPublicacionContenido());
        publicacion.setPublicacionEstado(EstadoPublicacion.ACTIVA);

        if(publicacionDto.getPublicacionOriginalId() != null && publicacionDto.getPublicacionOriginalId() > 0){
            publicacion.setPublicacionOriginal(
                this.getPublicacionReference(publicacionDto.getPublicacionOriginalId())
            );
        }

        publicacion = this.publicacionRepository.save(publicacion);
        List<String> archivosImagenes = new ArrayList<>();

        if (publicacionDto.getFilesImagenes() != null && publicacionDto.getFilesImagenes().size() > 0) {
            publicacion.setHasImages(true);

            for (MultipartFile file : publicacionDto.getFilesImagenes()) {
                try {
                    ImagenPublicacion imagen = new ImagenPublicacion();
                    imagen.setPublicacion(publicacion);
                    imagen.setPublicacionImagen(gcsService.upload(file, "usuario/" + publicacionDto.getUsuario() + "/publicaciones"));
                    archivosImagenes.add(gcsService.generarUrlTemporal(imagen.getPublicacionImagen()));

                    this.imagenPublicacionRepository.save(imagen);
                } catch (Exception e) {
                }
            }
        }

        List<String> archivosVideos = new ArrayList<>();

        if (publicacionDto.getFilesVideos() != null && publicacionDto.getFilesVideos().size() > 0) {
            publicacion.setHasVideos(true);

            for (MultipartFile file : publicacionDto.getFilesVideos()) {
                try {
                    VideoPublicacion video = new VideoPublicacion();
                    video.setPublicacion(publicacion);
                    video.setVideoPublicacion(gcsService.upload(file, "usuario/" + publicacionDto.getUsuario() + "/publicaciones"));
                    archivosVideos.add(gcsService.generarUrlTemporal(video.getVideoPublicacion()));

                    this.videoPublicacionRepository.save(video);
                } catch (Exception e) {
                }
            }
        }

        publicacionDto.setPublicacionId(publicacion.getPublicacionId());
        publicacionDto.setImagenes(archivosImagenes);
        publicacionDto.setVideos(archivosVideos);
        this.publicacionRepository.save(publicacion);
        return publicacionDto;
    }

}
