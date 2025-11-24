package com.uso_android.api.repositories;

import com.uso_android.api.dtos.MensajeDto;
import com.uso_android.api.entities.Mensaje;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Integer> {

    @Query("""
            select new com.uso_android.api.dtos.MensajeDto(
                m.mensajeId, m.mensajeTexto, m.mensajeEnvio,
                m.leido, m.hasImages, p.mensajeTexto, m.usuario.idUsuario
            )
            from Mensaje m
            LEFT JOIN m.mensajePadre p
            where m.chat.chatId = :chat ORDER BY m.mensajeId desc limit 10 offset :page
        """)
    List<MensajeDto> getMessagesByChat(Integer chat, Integer page);
}
