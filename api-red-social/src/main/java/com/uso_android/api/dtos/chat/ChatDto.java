package com.uso_android.api.dtos.chat;

import java.sql.Timestamp;

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
public class ChatDto {
    @JsonInclude(Include.NON_NULL)
    private Long chatId;

    @JsonInclude(Include.NON_NULL)
    private Long usuarioId;

    @JsonInclude(Include.NON_NULL)
    private Integer usuarioId1;

    @JsonInclude(Include.NON_NULL)
    private String nombreUsuario;
    
    @JsonInclude(Include.NON_NULL)
    private String apellidoUsuario;

    @JsonInclude(Include.NON_NULL)
    private String imagenUsuario;

    @JsonInclude(Include.NON_NULL)
    private String ultimoMensaje;

    @JsonInclude(Include.NON_NULL)
    private java.sql.Timestamp fechaUltimoMensaje;
    
    @JsonInclude(Include.NON_NULL)
    private String nombreUsuario1;

    @JsonInclude(Include.NON_NULL)
    private String imagenUsuario1;
    
    @JsonInclude(Include.NON_NULL)
    private String apellidoUsuario1;

    public ChatDto(Long chatId, Long usuarioId, String nombreUsuario, String imagenUsuario, String ultimoMensaje,
            Timestamp fechaUltimoMensaje) {
        this.chatId = chatId;
        this.usuarioId = usuarioId;
        this.nombreUsuario = nombreUsuario;
        this.imagenUsuario = imagenUsuario;
        this.ultimoMensaje = ultimoMensaje;
        this.fechaUltimoMensaje = fechaUltimoMensaje;
    }

    public ChatDto(Integer usuarioId1, String nombreUsuario, String apellidoUsuario, String imagenUsuario,
            String nombreUsuario1, String imagenUsuario1, String apellidoUsuario1, Integer chatId) {
        this.usuarioId1 = usuarioId1;
        this.nombreUsuario = nombreUsuario;
        this.apellidoUsuario = apellidoUsuario;
        this.imagenUsuario = imagenUsuario;
        this.nombreUsuario1 = nombreUsuario1;
        this.imagenUsuario1 = imagenUsuario1;
        this.apellidoUsuario1 = apellidoUsuario1;
        this.chatId = chatId.longValue();
    }

    public ChatDto(Integer usuarioId1, String nombreUsuario, String apellidoUsuario, String imagenUsuario) {
        this.usuarioId1 = usuarioId1;
        this.nombreUsuario = nombreUsuario;
        this.apellidoUsuario = apellidoUsuario;
        this.imagenUsuario = imagenUsuario;
    }

}
