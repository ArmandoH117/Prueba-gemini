package com.uso_android.api.dtos.usuario;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PerfilResponseDto {

    private int idUsuario;

    private String bioUsuario;

    private String viveEnUsuario;

    private String trabajaUsuario;

    private String educacionUsuario;

    private String origenUsuario;

    private String relacionSentimentalUsuario;

    private String usuarioImagenUrl;

    private String usuarioImagenCoverUrl;
}
