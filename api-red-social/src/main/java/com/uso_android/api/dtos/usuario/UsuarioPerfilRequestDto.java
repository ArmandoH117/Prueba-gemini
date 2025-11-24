package com.uso_android.api.dtos.usuario;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsuarioPerfilRequestDto {

    private int usuarioId;

    private int usuarioPerfilId;

}
