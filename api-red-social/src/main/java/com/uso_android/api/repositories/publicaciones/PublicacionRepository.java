package com.uso_android.api.repositories.publicaciones;

import com.uso_android.api.dtos.publicacion.PublicacionDto;
import com.uso_android.api.entities.Publicacion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface PublicacionRepository extends JpaRepository<Publicacion, Integer> {

    @Query("""
            SELECT new com.uso_android.api.dtos.publicacion.PublicacionDto(
            p.publicacionId, p.publicacionContenido, p.publicacionCreacion,
             CONCAT(p.usuario.nombreUsuario, ' ', p.usuario.apellidoUsuario),
             p.usuario.usuarioImagen, p.hasImages, p.publicacionComentarios, p.publicacionReacciones) 
            FROM Publicacion p
            JOIN Amistad a ON a.amigo = p.usuario
            where a.amigo.idUsuario = p.usuario.idUsuario
            and a.usuario.idUsuario = :user order by 
            p.publicacionCreacion desc limit 10 offset :page
        """)
    List<PublicacionDto> getListado(Integer user, Integer page);

    @Query("""
            SELECT new com.uso_android.api.dtos.publicacion.PublicacionDto(
            p.publicacionId, p.publicacionContenido, p.publicacionCreacion,
             CONCAT(p.usuario.nombreUsuario, ' ', p.usuario.apellidoUsuario),
             p.usuario.usuarioImagen, p.hasImages, p.publicacionComentarios, p.publicacionReacciones) 
            FROM Publicacion p
            where p.usuario.idUsuario = :user
            order by p.publicacionCreacion desc 
        """)
    List<PublicacionDto> getListadoPersonales(Integer user);


    @Query("""
            SELECT new com.uso_android.api.dtos.publicacion.PublicacionDto(
            p.publicacionId, p.publicacionContenido, p.publicacionCreacion,
             CONCAT(p.usuario.nombreUsuario, ' ', p.usuario.apellidoUsuario),
             p.usuario.usuarioImagen, p.hasImages, p.publicacionComentarios, p.publicacionReacciones) 
            FROM Publicacion p
            order by p.publicacionCreacion desc 
        """)
    List<PublicacionDto> getListadoPersonales();

    @Query("""
            SELECT new com.uso_android.api.dtos.publicacion.PublicacionDto(
                p.publicacionId, p.publicacionContenido,
                p.publicacionCreacion, p.hasImages, p.hasVideos,
                p.publicacionComentarios, p.publicacionReacciones, 
                CONCAT(p.usuario.nombreUsuario, " ", p.usuario.apellidoUsuario), 
                p.usuario.usuarioImagen, p.usuario.idUsuario, o.publicacionId, r.tipoReaccion
            ) 
            FROM Publicacion p
            left join p.publicacionOriginal o
            left join Reaccion r on r.publicacion.publicacionId = p.publicacionId and r.usuario.idUsuario = :user
            where p.usuario.idUsuario = :user 
            or p.usuario.idUsuario IN 
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
            )
            order by 
            p.publicacionCreacion desc limit 10 offset :page
        """)
    List<PublicacionDto> getListadoByUser(Integer user, Integer page);

    @Transactional
    @Modifying
    @Query("""    
            UPDATE Publicacion p
            SET p.publicacionComentarios = COALESCE(p.publicacionComentarios, 0) + 1
            WHERE p.publicacionId = :publicacionId
        """)
    void actualizarCantidadComentarios(Integer publicacionId);

    @Transactional
    @Modifying
    @Query("""    
            UPDATE Publicacion p
            SET p.publicacionReacciones = COALESCE(p.publicacionReacciones, 0) + 1
            WHERE p.publicacionId = :publicacionId
        """)
    void incrementarCantidadReacciones(Integer publicacionId);

    @Transactional
    @Modifying
    @Query("""    
            UPDATE Publicacion p
            SET p.publicacionReacciones = COALESCE(p.publicacionReacciones, 0) - 1
            WHERE p.publicacionId = :publicacionId
        """)
    void descrementarCantidadReacciones(Integer publicacionId);

    @Query("""
            SELECT new com.uso_android.api.dtos.publicacion.PublicacionDto(
                p.publicacionId, p.publicacionContenido,
                p.publicacionCreacion, p.hasImages, p.hasVideos,
                p.publicacionComentarios, p.publicacionReacciones, 
                CONCAT(p.usuario.nombreUsuario, " ", p.usuario.apellidoUsuario), 
                p.usuario.usuarioImagen, p.usuario.idUsuario, o.publicacionId, r.tipoReaccion
            ) 
            FROM Publicacion p
            left join p.publicacionOriginal o
            left join Reaccion r on r.publicacion.publicacionId = p.publicacionId and r.usuario.idUsuario = :user
            where p.usuario.idUsuario = :user 
            order by p.publicacionCreacion desc limit 10 offset :page
        """)
    List<PublicacionDto> getListadoByUserProfile(Integer user, int page);

    @Query("""
        SELECT new com.uso_android.api.dtos.publicacion.PublicacionDto(
            p.publicacionId, p.publicacionContenido,
            p.publicacionCreacion, p.hasImages, p.hasVideos,
            p.publicacionComentarios, p.publicacionReacciones, 
            CONCAT(p.usuario.nombreUsuario, " ", p.usuario.apellidoUsuario), 
            p.usuario.usuarioImagen, p.usuario.idUsuario
        ) 
        FROM Publicacion p
        where p.publicacionId = :publicacionOriginalId
    """)
    PublicacionDto getPublicacionDtoById(Integer publicacionOriginalId);
}