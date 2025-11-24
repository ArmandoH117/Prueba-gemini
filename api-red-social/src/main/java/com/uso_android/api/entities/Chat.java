package com.uso_android.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Integer chatId;

    @ManyToOne
    @JoinColumn(name = "usuario1_id", nullable = false)
    private Usuario usuario1;

    @ManyToOne
    @JoinColumn(name = "usuario2_id", nullable = false)
    private Usuario usuario2;

    @UpdateTimestamp
    @Column(name = "chat_ultima_actividad")
    private LocalDateTime ultimaActividad;

    @OneToMany(mappedBy = "chat")
    private List<Mensaje> mensajes;

    @OneToOne
    @JoinColumn(name = "mensaje_id")
    private Mensaje mensaje;

}
