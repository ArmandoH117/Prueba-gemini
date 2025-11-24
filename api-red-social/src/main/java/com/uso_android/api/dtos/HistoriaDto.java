package com.uso_android.api.dtos;

import java.time.LocalDateTime;

import javax.print.DocFlavor.STRING;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HistoriaDto {
    
    private Integer idUsuario;
    private String nombreUsuario;
    private String historiaUrl;
    private String historiaContenido;
    private LocalDateTime historiaCreacion;
    
    @JsonInclude(Include.NON_NULL)
    private MultipartFile archivoHistoria;

    public HistoriaDto(Integer idUsuario, String nombreUsuario, String historiaUrl) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.historiaUrl = historiaUrl;
    }
}
