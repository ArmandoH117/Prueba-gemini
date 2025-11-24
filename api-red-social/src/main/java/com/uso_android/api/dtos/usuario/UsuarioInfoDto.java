package com.uso_android.api.dtos.usuario;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsuarioInfoDto {
    
    private Integer idUsuario;
    
    private String nombreUsuario;
    
    private String apellidoUsuario;
    
    private String usuarioImagen;

    private String bioUsuario;

    private String viveEnUsuario;

    private String trabajaUsuario;

    private String educacionUsuario;

    private String origenUsuario;

    private String relacionSentimentalUsuario;

    public UsuarioInfoDto(Integer idUsuario, String nombreUsuario, String apellidoUsuario, String usuarioImagen) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.apellidoUsuario = apellidoUsuario;
        this.usuarioImagen = usuarioImagen;
    }
}
