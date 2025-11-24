package com.uso_android.api.dtos;

import com.uso_android.api.entities.enums.TipoReaccion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReaccionRequestDto {

    private int publicacionId;

    private int usuarioId;

    private TipoReaccion tipoReaccionEnum;

}
