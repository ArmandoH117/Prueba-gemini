package com.uso_android.api.dtos.solicitud;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class SolicitudAmistadDto {
    
    private Integer solicitudId;
    
    private Integer idUsuario;

    private boolean silenciarAmistad;
}
