package com.uso_android.api.dtos.usuario;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UsuarioRequestDto {

    private Integer idUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(Include.NON_NULL)
    private String nombreUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(Include.NON_NULL)
    private String apellidoUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(Include.NON_NULL)
    private String correoUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(Include.NON_NULL)
    private String passwordUsuario;

    @Size(max = 20)
    @JsonInclude(Include.NON_NULL)
    private String telefonoUsuario;
    
    @JsonInclude(Include.NON_NULL)
    private MultipartFile usuarioImagen;

    private String usuarioImagenUrl;

    @JsonInclude(Include.NON_NULL)
    private MultipartFile usuarioImagenCover;

    private String usuarioImagenCoverUrl;

    @JsonInclude(Include.NON_NULL)
    private boolean estadoUsuario;
    
    @JsonInclude(Include.NON_NULL)
    private String tokenUsuario;
    
    public UsuarioRequestDto(Integer idUsuario, @NotNull @Size(max = 200) String nombreUsuario,
            @NotNull @Size(max = 200) String apellidoUsuario, @NotNull @Size(max = 200) String correoUsuario,
            @NotNull @Size(max = 200) String passwordUsuario, @Size(max = 20) String telefonoUsuario,
            String usuarioImagenUrl) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.apellidoUsuario = apellidoUsuario;
        this.correoUsuario = correoUsuario;
        this.passwordUsuario = passwordUsuario;
        this.telefonoUsuario = telefonoUsuario;
        this.usuarioImagenUrl = usuarioImagenUrl;
    }

}