package com.uso_android.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.uso_android.api.entities.ImagenMensaje;

@Repository
public interface ImagenMensajeRepository extends JpaRepository<ImagenMensaje, Integer> {

    @Query("SELECT i.imagenMensajeRuta FROM ImagenMensaje i WHERE i.mensaje.mensajeId = :mensajeId")
    List<String> getImagesByMessage(Integer mensajeId);
    
}
