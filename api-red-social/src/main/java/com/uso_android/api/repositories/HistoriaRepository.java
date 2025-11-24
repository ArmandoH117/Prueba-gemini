package com.uso_android.api.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.uso_android.api.dtos.HistoriaDto;
import com.uso_android.api.entities.Historia;

public interface HistoriaRepository extends JpaRepository<Historia, Integer> {

    @Query("""
            SELECT new com.uso_android.api.dtos.HistoriaDto(
                h.usuario.idUsuario, h.usuario.nombreUsuario, h.historiaUrl
            ) 
            FROM Historia h
            where (h.usuario.idUsuario IN 
            (
                SELECT
                CASE
                    WHEN a2.usuario.idUsuario = :user THEN a2.amigo.idUsuario
                    ELSE a2.usuario.idUsuario
                END
                FROM Amistad a2
                WHERE
                ((a2.usuario.idUsuario = :user and a2.usuarioSilenciado = false) 
                OR (a2.amigo.idUsuario = :user and a2.amigoSilenciado = false))
                AND a2.amistadEstado = 1
            ) or h.usuario.idUsuario = :user)
            and h.historiaCreacion >= :ultimoDia and h.historiaId = h.usuario.historia.historiaId
            order by historiaCreacion desc limit 10 offset :page
        """)
    List<HistoriaDto> listadoHistorias(Integer user, LocalDateTime ultimoDia, Integer page);

    @Query("""
           select h.historiaUrl from Historia h 
           where h.usuario.idUsuario = :user and h.historiaCreacion >= :ultimoDia
            order by historiaCreacion 
        """)
    List<String> historiasByUser(Integer user, LocalDateTime ultimoDia);
    
}
