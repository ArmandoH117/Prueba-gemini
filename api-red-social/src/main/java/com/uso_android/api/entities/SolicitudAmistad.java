package com.uso_android.api.entities;

import com.uso_android.api.entities.enums.EstadoSolicitud;
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
@Table(name = "solicitudes_amistad")
public class SolicitudAmistad {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "solicitud_id")
    private Integer solicitudId;

    @Column(name = "solicitud_estado", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoSolicitud solicitudEstado;

    @Column(name = "solicitud_creacion", updatable = false)
    @CreationTimestamp
    private LocalDateTime solicitudCreacion;

    @ManyToOne
    @JoinColumn(name = "emisor_id", nullable = false)
    private Usuario emisorUsuario;

    @ManyToOne
    @JoinColumn(name = "recepto_id", nullable = false)
    private Usuario receptorUsuario;

}
