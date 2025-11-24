package com.uso_android.api.services;

import com.uso_android.api.dtos.ReaccionRequestDto;
import com.uso_android.api.entities.Reaccion;
import com.uso_android.api.repositories.ReaccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReaccionService {

    private final ReaccionRepository reaccionRepository;
    private final UsuarioService usuarioService;
    private final PublicacionService publicacionService;

    @Transactional
    public void toggleReaccion(ReaccionRequestDto reaccionRequest) {
        Optional<Reaccion> reaccion = reaccionRepository.findByUsuario_IdUsuarioAndPublicacion_PublicacionId(
                reaccionRequest.getUsuarioId(), reaccionRequest.getPublicacionId()
        );
        if (reaccion.isPresent()){
            if(reaccionRequest.getTipoReaccionEnum() != null){
                Reaccion reaccionExistente = reaccion.get();
                reaccionExistente.setTipoReaccion(reaccionRequest.getTipoReaccionEnum());
                reaccionRepository.save(reaccionExistente);
            } else {
                this.publicacionService.descrementarCantidadReacciones(reaccionRequest.getPublicacionId());
                reaccionRepository.delete(reaccion.get());
            }
        }else {
            Reaccion nuevaReaccion = new Reaccion();
            nuevaReaccion.setUsuario(usuarioService.getUsuarioReference(reaccionRequest.getUsuarioId()));
            nuevaReaccion.setPublicacion(publicacionService.getPublicacionReference(reaccionRequest.getPublicacionId()));
            nuevaReaccion.setTipoReaccion(reaccionRequest.getTipoReaccionEnum());
            reaccionRepository.save(nuevaReaccion);
            this.publicacionService.incrementarCantidadReacciones(reaccionRequest.getPublicacionId());
        }
    }

}
