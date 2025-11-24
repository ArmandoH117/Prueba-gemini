package com.uso_android.api.repositories;

import com.uso_android.api.dtos.chat.ChatDto;
import com.uso_android.api.dtos.usuario.UsuarioRequestDto;
import com.uso_android.api.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @Query("select (count(u) > 0) from Usuario u where u.idUsuario = :idUsuario")
    boolean existsByIdUsuario(Integer idUsuario);

    @Query("select (count(u) > 0) from Usuario u where u.correoUsuario = :correoUsuario")
    boolean existsByCorreoUsuario(String correoUsuario);

    Optional<Usuario> findByCorreoUsuario(String correoUsuario);

    @Query("""
           select new  com.uso_android.api.dtos.usuario.UsuarioRequestDto
           (u.idUsuario, u.nombreUsuario, u.apellidoUsuario, u.correoUsuario, u.passwordUsuario,
           u.telefonoUsuario, u.usuarioImagen)
           from Usuario u where u.correoUsuario = :correoUsuario
        """)
    UsuarioRequestDto getUsuarioByEmail(String correoUsuario);
    @Query("""
          select new com.uso_android.api.dtos.chat.ChatDto(
            c.idUsuario, c.nombreUsuario, c.apellidoUsuario, c.usuarioImagen
          ) from Usuario c where c.idUsuario = :receptorId
      """)
    ChatDto getUserInfoForChat(Integer receptorId);
}