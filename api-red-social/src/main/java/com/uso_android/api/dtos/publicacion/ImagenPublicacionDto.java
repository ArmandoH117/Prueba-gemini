package com.uso_android.api.dtos.publicacion;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ImagenPublicacionDto {
    private Integer imagenPublicacionId;
    private String publicacionImagenUrl;
}
