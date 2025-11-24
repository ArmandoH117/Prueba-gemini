package com.uso_android.api.dtos.usuario;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PerfilRequestDto {

    private int idUsuario;

    private String bioUsuario;

    private String viveEnUsuario;

    private String trabajaUsuario;

    private String educacionUsuario;

    private String origenUsuario;

    private String relacionSentimentalUsuario;

    private MultipartFile usuarioImagen;

    private MultipartFile usuarioImagenCover;

}
