package com.uso_android.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "amistades")
public class Amistad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amistad_id")
    private Integer amistadId;

    @Column(name = "amistad_estado", nullable = false)
    private int amistadEstado;

    @CreationTimestamp
    @Column(name = "amistad_creacion",updatable = false)
    private LocalDate amistadCreacion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "usuario_silenciado")
    private boolean usuarioSilenciado = false;

    @ManyToOne
    @JoinColumn(name = "amigo_id", nullable = false)
    private Usuario amigo;

    @Column(name = "amigo_silenciado")
    private boolean amigoSilenciado = false;
    

}
