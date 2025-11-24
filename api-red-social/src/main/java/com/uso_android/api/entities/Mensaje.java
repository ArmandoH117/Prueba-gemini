package com.uso_android.api.entities;

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
@Table(name = "mensajes")
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mensaje_id")
    private Integer mensajeId;

    @Column(name = "mensaje_texto", length = 500)
    private String mensajeTexto;

    @CreationTimestamp
    @Column(name = "mensaje_envio", updatable = false)
    private LocalDateTime mensajeEnvio;

    @Column(name = "mensaje_leido")
    private boolean leido = false;

    @Column(name = "mensaje_imagenes")
    private boolean hasImages = false;

    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "mensaje_padre_id")
    private Mensaje mensajePadre;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "mensaje")
    private List<ImagenMensaje> imagenes;

}
