package com.uso_android.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "comentarios")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comentario_id")
    private Integer comentarioId;

    @Column(name = "comentario_texto", length = 500)
    private String comentarioTexto;

    @Column(name = "comentario_imagen")
    private String comentarioImagen;

    @CreationTimestamp
    @Column(name = "comentario_creacion", updatable = false)
    private LocalDateTime comentarioCreacion;

    @Column(name = "comentario_respuestas")
    private Integer comentarioRespuestas;

    @Column(name = "comentario_reacciones", updatable = false)
    private Integer comentarioReacciones;

    @ManyToOne
    @JoinColumn(name = "publicacion_id", nullable = false)
    private Publicacion publicacion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "comentario_padre_id")
    private Comentario comentarioPadre;
}
