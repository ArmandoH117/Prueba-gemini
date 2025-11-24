package com.uso_android.api.dtos.usuario;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.uso_android.api.entities.enums.TipoSolicitud;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsuarioPerfilResponseDto {

    private Integer idUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String nombreUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String apellidoUsuario;

    @NotNull
    @Size(max = 200)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String correoUsuario;

    @Size(max = 20)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String telefonoUsuario;

    private String usuarioImagenUrl;

    private String usuarioImagenCoverUrl;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String tokenUsuario;

    private Long cantidadAmistades;

    private boolean existAmistad;

    private TipoSolicitud tipoSolicitud;

    private int solicitudId;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<String> historias;

    public UsuarioPerfilResponseDto(Integer idUsuario, String nombreUsuario,
            String apellidoUsuario, String correoUsuario,
            String telefonoUsuario, String usuarioImagenUrl, String usuarioImagenCoverUrl,
            String tokenUsuario, Long cantidadAmistades, boolean existAmistad, TipoSolicitud tipoSolicitud,
            int solicitudId) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.apellidoUsuario = apellidoUsuario;
        this.correoUsuario = correoUsuario;
        this.telefonoUsuario = telefonoUsuario;
        this.usuarioImagenUrl = usuarioImagenUrl;
        this.usuarioImagenCoverUrl = usuarioImagenCoverUrl;
        this.tokenUsuario = tokenUsuario;
        this.cantidadAmistades = cantidadAmistades;
        this.existAmistad = existAmistad;
        this.tipoSolicitud = tipoSolicitud;
        this.solicitudId = solicitudId;
    }

    

}
