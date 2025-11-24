package com.uso_android.api.mappers;

import com.uso_android.api.dtos.usuario.*;
import com.uso_android.api.entities.Usuario;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface UsuarioMapper {

    @Mapping(target = "passwordUsuario", ignore = true)
    @Mapping(target = "usuarioImagen", ignore = true)
    @Mapping(target = "usuarioImagenCover", ignore = true)
    Usuario toEntity(UsuarioRequestDto usuarioRequestDto);

    @Mapping(target = "usuarioImagen", ignore = true)
    @Mapping(target = "usuarioImagenCover", ignore = true)
    UsuarioRequestDto toRequest(Usuario usuario);

    UsuarioInfoDto toInfo(Usuario usuario);
    UsuarioPerfilResponseDto toPerfilResponseDto(Usuario usuario);
    PerfilResponseDto toPerfilResponse(Usuario usuario);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "usuarioImagen", ignore = true)
    @Mapping(target = "usuarioImagenCover", ignore = true)
    Usuario partialUpdate(UsuarioRequestDto usuarioRequestDto, @MappingTarget Usuario usuario);

    @Mapping(target = "usuarioImagen", ignore = true)
    @Mapping(target = "usuarioImagenCover", ignore = true)
    Usuario partialUpdate(PerfilRequestDto perfilRequestDto, @MappingTarget Usuario usuario);

    UsuarioLogInDto toList(Usuario usuario);
}