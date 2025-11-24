package com.uso_android.api.dtos.publicacion;

import java.time.LocalDateTime;
import java.util.List;

import com.uso_android.api.entities.enums.TipoReaccion;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PublicacionDto {
    private Integer publicacionId;
    
    private String publicacionContenido;
    
    private LocalDateTime publicacionCreacion;
    
    @JsonInclude(Include.NON_NULL)
    private List<String> imagenes;

    @JsonInclude(Include.NON_NULL)
    private List<String> videos;
    
    private String usuario;

    @JsonInclude(Include.NON_NULL)
    private String usuarioImagen;

    @JsonInclude(Include.NON_NULL)
    private boolean hasImages = false;

    @JsonInclude(Include.NON_NULL)
    private Boolean hasVideos = false;

    private Integer publicacionComentarios;

    private Integer publicacionReacciones;

    @JsonInclude(Include.NON_NULL)
    private List<MultipartFile> filesImagenes;

    @JsonInclude(Include.NON_NULL)
    private List<MultipartFile> filesVideos;

    @JsonInclude(Include.NON_NULL)
    private Integer usuarioId;
    
    @JsonInclude(Include.NON_NULL)
    private Integer publicacionOriginalId;
    
    @JsonInclude(Include.NON_NULL)
    private PublicacionDto publicacionOriginal;

    private TipoReaccion tipoReaccionUsuario;

    public PublicacionDto(Integer publicacionId, String publicacionContenido, LocalDateTime publicacionCreacion,
            String usuario, String usuarioImagen, boolean hasImages, Integer publicacionComentarios, Integer publicacionReacciones) {
        this.publicacionId = publicacionId;
        this.publicacionContenido = publicacionContenido;
        this.publicacionCreacion = publicacionCreacion;
        this.usuario = usuario;
        this.usuarioImagen = usuarioImagen;
        this.hasImages = hasImages;
        this.publicacionComentarios = publicacionComentarios;
        this.publicacionReacciones = publicacionReacciones;
    }

    public PublicacionDto(Integer publicacionId, String publicacionContenido, LocalDateTime publicacionCreacion,
            boolean hasImages, Boolean hasVideos, Integer publicacionComentarios, Integer publicacionReacciones, 
            String usuario, String usuarioImagen, Integer usuarioId, Integer publicacionOriginalId, TipoReaccion tipoReaccionUsuario) {
        this.publicacionId = publicacionId;
        this.publicacionContenido = publicacionContenido;
        this.publicacionCreacion = publicacionCreacion;
        this.hasImages = hasImages;
        this.publicacionComentarios = publicacionComentarios;
        this.publicacionReacciones = publicacionReacciones;
        this.usuario = usuario;
        this.hasVideos = hasVideos;
        this.usuarioImagen = usuarioImagen;
        this.usuarioId = usuarioId;
        this.publicacionOriginalId = publicacionOriginalId;
        this.tipoReaccionUsuario = tipoReaccionUsuario;
    }

    public PublicacionDto(Integer publicacionId, String publicacionContenido, LocalDateTime publicacionCreacion,
            boolean hasImages, Boolean hasVideos, Integer publicacionComentarios, Integer publicacionReacciones, 
            String usuario, String usuarioImagen) {
        this.publicacionId = publicacionId;
        this.publicacionContenido = publicacionContenido;
        this.publicacionCreacion = publicacionCreacion;
        this.hasImages = hasImages;
        this.publicacionComentarios = publicacionComentarios;
        this.publicacionReacciones = publicacionReacciones;
        this.usuario = usuario;
        this.hasVideos = hasVideos;
        this.usuarioImagen = usuarioImagen;
    }

    public PublicacionDto(Integer publicacionId, String publicacionContenido, LocalDateTime publicacionCreacion,
            boolean hasImages, Boolean hasVideos, Integer publicacionComentarios, Integer publicacionReacciones, 
            String usuario, String usuarioImagen, Integer usuarioId) {
        this.publicacionId = publicacionId;
        this.publicacionContenido = publicacionContenido;
        this.publicacionCreacion = publicacionCreacion;
        this.hasImages = hasImages;
        this.publicacionComentarios = publicacionComentarios;
        this.publicacionReacciones = publicacionReacciones;
        this.usuario = usuario;
        this.hasVideos = hasVideos;
        this.usuarioImagen = usuarioImagen;
        this.usuarioId = usuarioId;
    }

}
