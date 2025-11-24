package com.uso_android.api.repositories;

import com.uso_android.api.dtos.comentario.ComentarioDto;
import com.uso_android.api.entities.Comentario;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {

    @Query("""
           select new com.uso_android.api.dtos.comentario.ComentarioDto
            (
                c.comentarioId, c.comentarioTexto, c.comentarioImagen, c.comentarioRespuestas,
                c.comentarioReacciones, c.comentarioCreacion, 
                CONCAT(c.usuario.nombreUsuario, ' ', c.usuario.apellidoUsuario),
                c.usuario.usuarioImagen, c.usuario.idUsuario
            )
           from Comentario c where c.publicacion.publicacionId = :publicacionId
           order by c.comentarioCreacion desc limit 10 offset :page
        """)
    List<ComentarioDto> getComentariosPublicacion(Integer publicacionId, Integer page);

    @Query("""
           select new com.uso_android.api.dtos.comentario.ComentarioDto
            (
                c.comentarioId, c.comentarioTexto, c.comentarioImagen, c.comentarioRespuestas,
                c.comentarioReacciones, c.comentarioCreacion, 
                CONCAT(c.usuario.nombreUsuario, ' ', c.usuario.apellidoUsuario),
                c.usuario.usuarioImagen, c.usuario.idUsuario
            )
           from Comentario c where c.comentarioPadre.comentarioId = :comentarioId
           order by c.comentarioCreacion desc limit 20 offset :page
        """)
    List<ComentarioDto> getRespuestasComentario(Integer comentarioId, Integer page);
    
    @Transactional
    @Modifying
    @Query("""    
            UPDATE Comentario p
            SET p.comentarioRespuestas = COALESCE(p.comentarioRespuestas, 0) + 1
            WHERE p.comentarioId = :comentarioId
        """)
    void actualizarCantidadRespuestas(Integer comentarioId);
}