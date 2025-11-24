package com.uso_android.api.dtos.usuario;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsuarioLogInDto{

    @NotNull
    private String correoUsuario;

    @NotNull
    private String passwordUsuario;

    private String tokenUsuario;

}