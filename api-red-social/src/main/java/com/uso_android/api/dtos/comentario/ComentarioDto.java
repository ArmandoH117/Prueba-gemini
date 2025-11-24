package com.uso_android.api.dtos.comentario;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ComentarioDto {
    
    private Integer comentarioId;

    private String comentarioTexto;

    private String comentarioImagen;

    private Integer comentarioRespuestas;

    private Integer comentarioReacciones;

    private LocalDateTime comentarioCreacion;

    private String usuario;

    private String usuarioImagen;

    private Integer usuarioId;
}
