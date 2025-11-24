package com.uso_android.api.dtos.usuario;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class UsuarioLogOut {
    
    private Integer idUsuario;
    
    private String tokenUsuario;
}
