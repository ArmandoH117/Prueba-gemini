package com.uso_android.api.entities;


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
@Table(name = "imagenes_mensajes")
public class ImagenMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "imagen_mensaje_id")
    private Integer imagenMensajeId;

    @Column(name = "imagen_mensaje_ruta")
    private String imagenMensajeRuta;

    @ManyToOne
    @JoinColumn(name = "mensaje_id", nullable = false)
    private Mensaje mensaje;

}
