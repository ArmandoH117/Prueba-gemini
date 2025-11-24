package com.uso_android.api.dtos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MensajeDto {
    
    @JsonInclude(Include.NON_NULL)
    private Integer mensajeId;

    @JsonInclude(Include.NON_NULL)
    private Integer chatId;

    private Integer usuarioId;

    @JsonInclude(Include.NON_NULL)
    private Integer mensajePadreId;

    private String mensajeTexto;

    private LocalDateTime mensajeEnvio;

    private boolean leido = false;

    private boolean hasImages = false;

    @JsonInclude(Include.NON_NULL)
    private String mensajePadre;

    @JsonInclude(Include.NON_NULL)
    private List<String> imagenes;

    @JsonInclude(Include.NON_NULL)
    private List<MultipartFile> files;
    
    private Integer receptorId;

    public MensajeDto(Integer mensajeId, String mensajeTexto, LocalDateTime mensajeEnvio, boolean leido,
            boolean hasImages, String mensajePadre, Integer usuarioId) {
        this.mensajeId = mensajeId;
        this.mensajeTexto = mensajeTexto;
        this.mensajeEnvio = mensajeEnvio;
        this.leido = leido;
        this.hasImages = hasImages;
        this.mensajePadre = mensajePadre;
        this.usuarioId = usuarioId;
    }
}
