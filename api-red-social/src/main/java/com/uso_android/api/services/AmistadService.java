package com.uso_android.api.services;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uso_android.api.dtos.solicitud.SolicitudAmistadDto;
import com.uso_android.api.dtos.amistad.AmistadSearchDto;
import com.uso_android.api.entities.Amistad;
import com.uso_android.api.entities.SolicitudAmistad;
import com.uso_android.api.entities.Usuario;
import com.uso_android.api.entities.enums.EstadoSolicitud;
import com.uso_android.api.exceptions.exception.NotFoundException;
import com.uso_android.api.repositories.AmistadRepository;
import com.uso_android.api.repositories.SolicitudAmistadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AmistadService {
    private final AmistadRepository amistadRepository;
    private final SolicitudAmistadRepository solicitudAmistadRepository;
    private final GcsService gcsService;

    @PersistenceContext
    private EntityManager entityManager;


    private Usuario getUsuarioReference(int idProducto) {
        return entityManager.getReference(Usuario.class, idProducto);
    }

    public SolicitudAmistad obtenerReferenciaSolicitudAmistad(int id) {
        if (!this.solicitudAmistadRepository.existsById(id)) {
            throw new NotFoundException("Solicitud amistad no encontrado con el ID: " + id);
        }
        return this.solicitudAmistadRepository.getReferenceById(id);
    }

    public List<AmistadSearchDto> getAmistades(Integer user) {
        List<AmistadSearchDto> listado = this.amistadRepository.getAmistades(user);

        for (int i = 0; i < listado.size(); i++) {
            if (listado.get(i).getUsuarioImagen() != null && listado.get(i).getUsuarioImagen().length() > 0) {
                listado.get(i).setUsuarioImagen(
                        gcsService.generarUrlTemporal(listado.get(i).getUsuarioImagen())
                );
            }
        }

        return listado;
    }

    @Transactional
    public boolean aceptarRecharSolicitud(Integer solicitud, Integer estado) {
        try {
            SolicitudAmistad solicitudAmistad = this.obtenerReferenciaSolicitudAmistad(solicitud);

            if (estado == 1) {
                solicitudAmistad.setSolicitudEstado(EstadoSolicitud.ACEPTADA);

                Amistad amistad = new Amistad();
                amistad.setAmigo(solicitudAmistad.getEmisorUsuario());
                amistad.setUsuario(solicitudAmistad.getReceptorUsuario());
                amistad.setAmistadEstado(1);

                this.amistadRepository.save(amistad);
            } else {
                solicitudAmistad.setSolicitudEstado(EstadoSolicitud.RECHAZADA);
            }

            this.solicitudAmistadRepository.save(solicitudAmistad);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Integer solicitud(SolicitudAmistadDto solicitud) {
        try {
            SolicitudAmistad solicitudAmistad = new SolicitudAmistad();
            solicitudAmistad.setEmisorUsuario(this.getUsuarioReference(solicitud.getIdUsuario()));
            solicitudAmistad.setReceptorUsuario(this.getUsuarioReference(solicitud.getSolicitudId()));
            solicitudAmistad.setSolicitudEstado(EstadoSolicitud.PENDIENTE);
            solicitudAmistad.setSolicitudCreacion(LocalDateTime.now());
            return  this.solicitudAmistadRepository.save(solicitudAmistad).getSolicitudId();
        } catch (Exception ex) {
            return null;
        }
    }

    public Long countAmistades(Integer userId) {
        return this.amistadRepository.countAmistadesByUsuarioId(userId);
    }

    @Transactional
    public boolean eliminarAmistad(SolicitudAmistadDto amistadRequest) {

        try{
            Long infoAmistad = this.amistadRepository.obtenerAmistadIdByUsers(amistadRequest.getIdUsuario(), amistadRequest.getSolicitudId());
            this.amistadRepository.deleteById(infoAmistad.intValue());

            return true;
        }catch(Exception ex){
            return false;
        }
    }

    public boolean silenciarAmistad(SolicitudAmistadDto amistadRequest) {
        try{
            Amistad infoAmistad = this.amistadRepository.obtenerAmistadByUsers(amistadRequest.getIdUsuario(), amistadRequest.getSolicitudId());
           
            if(amistadRequest.getIdUsuario() == infoAmistad.getUsuario().getIdUsuario()){
                infoAmistad.setUsuarioSilenciado(amistadRequest.isSilenciarAmistad());
            }else{
                infoAmistad.setAmigoSilenciado(amistadRequest.isSilenciarAmistad());
            }

            this.amistadRepository.save(infoAmistad);

            return true;
        }catch(Exception ex){
            return false;
        }
    }
}
