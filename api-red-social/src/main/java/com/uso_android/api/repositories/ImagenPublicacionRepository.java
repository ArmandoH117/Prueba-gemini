package com.uso_android.api.repositories;

import java.util.List;

import com.uso_android.api.dtos.publicacion.ImagenPublicacionDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.uso_android.api.entities.ImagenPublicacion;

@Repository
public interface ImagenPublicacionRepository extends JpaRepository<ImagenPublicacion, Integer> {
    
    @Query("SELECT p.publicacionImagen FROM ImagenPublicacion p WHERE p.publicacion.publicacionId = :publicacionId")
    List<String> getImagesByPublicacion(Integer publicacionId);

    @Query("""
        SELECT new com.uso_android.api.dtos.publicacion.ImagenPublicacionDto(
            p.imagenPublicacionId, p.publicacionImagen
            )
        FROM ImagenPublicacion p
        WHERE p.publicacion.usuario.idUsuario = :user
        ORDER BY p.imagenPublicacionId DESC
        LIMIT 10 OFFSET :page
    """)
    List<ImagenPublicacionDto> getImagenesPublicadas(Integer user, Integer page);

}
