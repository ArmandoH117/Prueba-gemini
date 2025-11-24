package com.uso_android.api.dtos.amistad;


import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class AmistadSearchDto {
    
    private Integer idUsuario;
    
    private String nombreUsuario;
    
    private String usuarioImagen;
    
    private LocalDate solicitudCreacion;

    private boolean amistadSilenciada;
}
