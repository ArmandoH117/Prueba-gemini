package com.uso_android.api.entities;

import com.uso_android.api.entities.enums.EstadoPublicacion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "publicaciones")
public class Publicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "publicacion_id")
    private Integer publicacionId;

    @Column(name = "publicacion_contenido",  length = 500)
    private String publicacionContenido;

    @CreationTimestamp
    @Column(name = "publicacion_creacion", updatable = false)
    private LocalDateTime publicacionCreacion;

    @Column(name = "publicacion_comentarios")
    private Integer publicacionComentarios;

    @Column(name = "publicacion_reacciones")
    private Integer publicacionReacciones;

    @Column(name = "publicacion_estado", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoPublicacion publicacionEstado;

    @Column(name = "publicacion_imagenes")
    private boolean hasImages = false;

    @Column(name = "publicacion_videos")
    private Boolean hasVideos = false;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "publicacion")
    private List<Comentario> comentarios;

    @OneToMany(mappedBy = "publicacion")
    private List<Reaccion> reacciones;

    @OneToMany(mappedBy = "publicacion")
    private List<ImagenPublicacion> imagenes;

    @OneToMany(mappedBy = "publicacion")
    private List<VideoPublicacion> videos;

    @ManyToOne
    @JoinColumn(name = "publicacion_original_id")
    private Publicacion publicacionOriginal;
}
