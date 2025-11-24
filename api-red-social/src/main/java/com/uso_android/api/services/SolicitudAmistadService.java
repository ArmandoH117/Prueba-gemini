package com.uso_android.api.services;

import com.uso_android.api.dtos.solicitud.SolicitudAmistadRequestDto;
import com.uso_android.api.entities.SolicitudAmistad;
import com.uso_android.api.entities.enums.EstadoSolicitud;
import com.uso_android.api.repositories.SolicitudAmistadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SolicitudAmistadService {

    private final SolicitudAmistadRepository solicitudAmistadRepository;
    private final GcsService gcsService;

    public List<SolicitudAmistadRequestDto> getSolicitudes(Integer user) {
        return this.procesarDatos(this.solicitudAmistadRepository.getSolicitudes(user, EstadoSolicitud.PENDIENTE));
    }

    public List<SolicitudAmistadRequestDto> getSugerencias(Integer user) {
        return this.procesarDatos(this.solicitudAmistadRepository.getSugerencias(user));
    }

    private List<SolicitudAmistadRequestDto> procesarDatos(List<SolicitudAmistadRequestDto> listado) {
        for (int i = 0; i < listado.size(); i++) {
            if (listado.get(i).getUsuarioImagen() != null && listado.get(i).getUsuarioImagen().length() > 0) {
                listado.get(i).setUsuarioImagen(
                        gcsService.generarUrlTemporal(listado.get(i).getUsuarioImagen())
                );
            }
        }
        return listado;
    }


    @Transactional(readOnly = true)
    public Optional<SolicitudAmistad> getSolicitudAmistad(Integer usuarioId, Integer usuarioPerfilId){
        return this.solicitudAmistadRepository.getSolicitudAmistad(usuarioId, usuarioPerfilId);
    }

    @Transactional
    public boolean cancelSolicitud(Integer idSolicitud){
        try{
            this.solicitudAmistadRepository.deleteById(idSolicitud);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
