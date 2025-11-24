package com.uso_android.api.repositories;

import com.uso_android.api.dtos.solicitud.SolicitudAmistadRequestDto;
import com.uso_android.api.entities.SolicitudAmistad;
import com.uso_android.api.entities.enums.EstadoSolicitud;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SolicitudAmistadRepository extends JpaRepository<SolicitudAmistad, Integer> {

    @Query("""
            select new com.uso_android.api.dtos.solicitud.SolicitudAmistadRequestDto
                (s.solicitudId, s.emisorUsuario.idUsuario,
                CONCAT(s.emisorUsuario.nombreUsuario, ' ', s.emisorUsuario.apellidoUsuario),
                s.emisorUsuario.usuarioImagen,
                (
                    SELECT COUNT(a1.amistadId)
                    FROM Amistad a1
                    WHERE
                    (a1.usuario.idUsuario = em.idUsuario OR a1.amigo.idUsuario = em.idUsuario)
                    AND a1.amistadEstado = 1
                    AND (
                        CASE
                        WHEN a1.usuario.idUsuario = em.idUsuario THEN a1.amigo.idUsuario
                        ELSE a1.usuario.idUsuario
                        END
                    ) IN (
                        SELECT
                        CASE
                            WHEN a2.usuario.idUsuario = :user THEN a2.amigo.idUsuario
                            ELSE a2.usuario.idUsuario
                        END
                        FROM Amistad a2
                        WHERE
                        (a2.usuario.idUsuario = :user OR a2.amigo.idUsuario = :user)
                        AND a2.amistadEstado = 1
                    )
                ))
            from SolicitudAmistad s
            join s.emisorUsuario em
            where s.receptorUsuario.idUsuario = :user
            and s.solicitudEstado = :estadoPendiente
            order by s.solicitudId desc limit 20""")
    List<SolicitudAmistadRequestDto> getSolicitudes(Integer user, EstadoSolicitud estadoPendiente);

    @Query(value = """
                    SELECT
              u.usuario_id                                   AS id,
              CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) AS nombre,
              u.usuario_imagen                               AS imagen,
              (
                SELECT COUNT(*)
                FROM amistades a1
                WHERE a1.amistad_estado = 1
                  AND (a1.usuario_id = u.usuario_id OR a1.amigo_id = u.usuario_id)
                  AND (
                    CASE
                      WHEN a1.usuario_id = u.usuario_id THEN a1.amigo_id
                      ELSE a1.usuario_id
                    END
                  ) IN (
                    SELECT
                      CASE
                        WHEN a2.usuario_id = :user THEN a2.amigo_id
                        ELSE a2.usuario_id
                      END
                    FROM amistades a2
                    WHERE (a2.usuario_id = :user OR a2.amigo_id = :user)
                      AND a2.amistad_estado = 1
                  )
              ) AS mutuos
            FROM usuarios u
            WHERE u.usuario_id <> :user
              AND u.usuario_id NOT IN (
                SELECT
                  CASE
                    WHEN af.usuario_id = :user THEN af.amigo_id
                    ELSE af.usuario_id
                  END
                FROM amistades af
                WHERE (af.usuario_id = :user OR af.amigo_id = :user)
                  AND af.amistad_estado = 1
              ) 
                  AND u.usuario_id NOT IN
               (select if(emisor_id = :user, recepto_id, emisor_id) as idUsuario from solicitudes_amistad
               where recepto_id = :user or emisor_id = :user)
            ORDER BY mutuos DESC
            LIMIT 10;""", nativeQuery = true)
    List<SolicitudAmistadRequestDto> getSugerencias(Integer user);


    @Query("""
        SELECT s
        FROM SolicitudAmistad s
        WHERE (s.emisorUsuario.idUsuario = :usuarioId AND s.receptorUsuario.idUsuario = :usuarioPerfilId)
           OR (s.emisorUsuario.idUsuario = :usuarioPerfilId AND s.receptorUsuario.idUsuario = :usuarioId)
    """)
    Optional<SolicitudAmistad> getSolicitudAmistad(Integer usuarioId, Integer usuarioPerfilId);

}