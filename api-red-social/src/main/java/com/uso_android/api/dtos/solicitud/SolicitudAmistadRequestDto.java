package com.uso_android.api.dtos.solicitud;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class SolicitudAmistadRequestDto {

    private Integer solicitudId;
    
    private Integer idUsuario;
    
    private String nombreUsuario;
    
    private String usuarioImagen;

    private Long amigosComunes;

    public SolicitudAmistadRequestDto(Integer idUsuario, String nombreUsuario, String usuarioImagen,
            Long amigosComunes) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.usuarioImagen = usuarioImagen;
        this.amigosComunes = amigosComunes;
    }
}
