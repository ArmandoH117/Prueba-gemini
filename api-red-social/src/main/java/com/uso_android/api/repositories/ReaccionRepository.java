package com.uso_android.api.repositories;

import com.uso_android.api.entities.Reaccion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ReaccionRepository extends JpaRepository<Reaccion, Integer> {

  @Query("""
        SELECT r 
        FROM Reaccion r 
        WHERE r.usuario.idUsuario = ?1 
            AND r.publicacion.publicacionId = ?2
    """)
  Optional<Reaccion> findByUsuario_IdUsuarioAndPublicacion_PublicacionId(Integer idUsuario, Integer publicacionId);

}