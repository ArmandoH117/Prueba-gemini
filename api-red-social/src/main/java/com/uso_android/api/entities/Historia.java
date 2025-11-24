package com.uso_android.api.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "historias")
public class Historia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "historia_id")
    private Integer historiaId;

    @Column(name = "historia_contenido",  length = 500)
    private String historiaContenido;

    @Column(name = "historia_url")
    private String historiaUrl;
    
    @CreationTimestamp
    @Column(name = "historia_creacion", updatable = false)
    private LocalDateTime historiaCreacion;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
