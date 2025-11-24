package com.uso_android.api.repositories;

import com.uso_android.api.dtos.amistad.AmistadSearchDto;
import com.uso_android.api.entities.Amistad;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AmistadRepository extends JpaRepository<Amistad, Integer> {

    @Query("""
            SELECT new com.uso_android.api.dtos.amistad.AmistadSearchDto(
                CASE WHEN a.usuario.idUsuario = :user THEN a.amigo.idUsuario
                        ELSE a.usuario.idUsuario END,
                CASE WHEN a.usuario.idUsuario = :user
                        THEN CONCAT(a.amigo.nombreUsuario, ' ', a.amigo.apellidoUsuario)
                        ELSE CONCAT(a.usuario.nombreUsuario, ' ', a.usuario.apellidoUsuario) END,
                CASE WHEN a.usuario.idUsuario = :user THEN a.amigo.usuarioImagen
                        ELSE a.usuario.usuarioImagen END,
                a.amistadCreacion,
                CASE WHEN a.usuario.idUsuario = :user THEN a.usuarioSilenciado
                        ELSE a.amigoSilenciado END
            )
            FROM Amistad a
            WHERE a.usuario.idUsuario = :user OR a.amigo.idUsuario = :user
            ORDER BY a.amistadCreacion DESC limit 10
            """)
    List<AmistadSearchDto> getAmistades(Integer user);


    @Query("""
        SELECT COUNT(a) > 0
        FROM Amistad a
        WHERE (a.usuario.idUsuario = :usuarioId AND a.amigo.idUsuario = :usuarioPerfilId)
           OR (a.usuario.idUsuario = :usuarioPerfilId AND a.amigo.idUsuario = :usuarioId)
    """)
    Boolean existsAmistadByIdUsuarioPerfil(Integer usuarioId, Integer usuarioPerfilId);

    @Query("""
        SELECT COUNT (a)
        FROM Amistad a
        WHERE a.usuario.idUsuario = :usuarioId OR a.amigo.idUsuario = :usuarioId
        """)
    Long countAmistadesByUsuarioId(Integer usuarioId);

    @Query("""
        SELECT a.amistadId
        FROM Amistad a
        WHERE (a.usuario.idUsuario = :idUsuario and a.amigo.idUsuario = :amigoId)
        or (a.usuario.idUsuario = :amigoId and a.amigo.idUsuario = :idUsuario)
    """)
    Long obtenerAmistadIdByUsers(Integer idUsuario, Integer amigoId);

    @Query("""
        SELECT a
        FROM Amistad a
        WHERE (a.usuario.idUsuario = :idUsuario and a.amigo.idUsuario = :amigoId)
        or (a.usuario.idUsuario = :amigoId and a.amigo.idUsuario = :idUsuario)
    """)
    Amistad obtenerAmistadByUsers(Integer idUsuario, Integer amigoId);

}