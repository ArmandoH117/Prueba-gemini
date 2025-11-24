package com.uso_android.api.entities;

import com.uso_android.api.entities.enums.TipoReaccion;
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
@Table(name = "reacciones")
public class Reaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaccion_id")
    private Integer reaccionId;

    @Column(name = "tipo_reaccion", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoReaccion tipoReaccion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "publicacion_id", nullable = false)
    private Publicacion publicacion;

}
