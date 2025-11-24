package com.uso_android.api.services;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uso_android.api.dtos.comentario.ComentarioDto;
import com.uso_android.api.dtos.comentario.ComentarioRequestDto;
import com.uso_android.api.entities.Comentario;
import com.uso_android.api.exceptions.exception.NotFoundException;
import com.uso_android.api.repositories.ComentarioRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ComentarioService {
    private final ComentarioRepository comentarioRepository;
    private final PublicacionService publicacionService;
    private final GcsService gcsService;
    private final UsuarioService usuarioService;
    
    @Transactional(readOnly = true)
    public Comentario getComentarioReference(Integer id){
        if(!this.comentarioRepository.existsById(id)){
            throw new NotFoundException("Comentario no encontrado con el ID: " + id);
        }
        return this.comentarioRepository.getReferenceById(id);
    }

    public List<ComentarioDto> getComentariosPublicacion(Integer publicacionId, Integer page){
        return this.obtenerImagenes(comentarioRepository.getComentariosPublicacion(publicacionId, page));
    }

    public List<ComentarioDto> getRespuestasComentario(Integer comentarioId, Integer page){
        return this.obtenerImagenes(comentarioRepository.getRespuestasComentario(comentarioId, page));
    }

    private List<ComentarioDto> obtenerImagenes(List<ComentarioDto> listado){
        for (int i = 0; i < listado.size(); i++) {
            if(listado.get(i).getComentarioImagen() != null && listado.get(i).getComentarioImagen().length() > 0){
                listado.get(i).setComentarioImagen(
                    gcsService.generarUrlTemporal(listado.get(i).getComentarioImagen())
                );
            }

            if(listado.get(i).getUsuarioImagen() != null && listado.get(i).getUsuarioImagen().length() > 0){
                listado.get(i).setUsuarioImagen(
                    gcsService.generarUrlTemporal(listado.get(i).getUsuarioImagen())
                );
            }
        }

        return listado;
    }

    @Transactional
    public ComentarioDto guardarComentario(ComentarioRequestDto comentarioRequest) throws IOException {
        Comentario comentario = new Comentario();

        comentario.setComentarioTexto(comentarioRequest.getComentarioTexto());
        comentario.setUsuario(usuarioService.getUsuarioReference(comentarioRequest.getUsuarioId()));

        if(comentarioRequest.getComentarioId() != null && comentarioRequest.getComentarioId() > 0){
            comentario.setComentarioPadre(this.getComentarioReference(comentarioRequest.getComentarioId()));
            comentarioRepository.actualizarCantidadRespuestas(comentarioRequest.getComentarioId());
        }else{
            comentario.setPublicacion(publicacionService.getPublicacionReference(comentarioRequest.getPublicacionId()));
        }
        this.publicacionService.actualizarCantidadComentarios(comentarioRequest.getPublicacionId());

        if(comentarioRequest.getComentarioImagen() != null){
            comentario.setComentarioImagen(
                gcsService.upload(comentarioRequest.getComentarioImagen(), "comentarios/" + comentarioRequest.getPublicacionId())
            );
        }

        this.comentarioRepository.save(comentario);

        return new ComentarioDto(comentario.getComentarioId(),
            comentario.getComentarioTexto(),
            comentarioRequest.getComentarioImagen() != null ? gcsService.generarUrlTemporal(comentario.getComentarioImagen()) : "",
            0,0, 
            comentario.getComentarioCreacion(),
            comentario.getUsuario().getNombreUsuario() + " " + comentario.getUsuario().getApellidoUsuario(),
            comentario.getUsuario().getUsuarioImagen() != null ? gcsService.generarUrlTemporal(comentario.getUsuario().getUsuarioImagen()) : "",
            comentarioRequest.getUsuarioId()
        );
    }
}
