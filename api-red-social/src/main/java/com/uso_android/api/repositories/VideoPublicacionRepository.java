package com.uso_android.api.repositories;

import com.uso_android.api.entities.VideoPublicacion;
import com.uso_android.api.dtos.publicacion.ImagenPublicacionDto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VideoPublicacionRepository extends JpaRepository<VideoPublicacion, Integer> {

    @Query("SELECT p.videoPublicacion FROM VideoPublicacion p WHERE p.publicacion.publicacionId = :publicacionId")
    List<String> getVideosByPublicacion(Integer publicacionId);

    @Query("""
        SELECT new com.uso_android.api.dtos.publicacion.ImagenPublicacionDto(
            p.videoPublicacionId, p.videoPublicacion
            )
        FROM VideoPublicacion p
        WHERE p.publicacion.usuario.idUsuario = :user
        ORDER BY p.videoPublicacionId DESC
        LIMIT 10 OFFSET :page
    """)
    List<ImagenPublicacionDto> getVideosPublicados(Integer user, int page);

}