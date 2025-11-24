package com.uso_android.api.dtos.comentario;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ComentarioRequestDto {

    private Integer comentarioId;

    private String comentarioTexto;

    private MultipartFile comentarioImagen;
    
    private Integer publicacionId;

    private Integer usuarioId;
}
