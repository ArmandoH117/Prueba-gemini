package com.uso_android.api.controllers;

import java.util.HashMap;
import java.util.Map;

import com.uso_android.api.services.SolicitudAmistadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uso_android.api.dtos.solicitud.SolicitudAmistadDto;
import com.uso_android.api.services.AmistadService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/amistades")
public class AmistadController {

    private final AmistadService amistadService;
    private final SolicitudAmistadService solicitudAmistadService;
    
    @GetMapping("/amigos/{user}")
    public ResponseEntity<?> getAmigos(
        @PathVariable Integer user) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", amistadService.getAmistades(user));
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/listado/{user}")
    public ResponseEntity<?> getSolicitudes(
        @PathVariable Integer user) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", solicitudAmistadService.getSolicitudes(user));
        data.put("sugerencias", solicitudAmistadService.getSugerencias(user));
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/aceptar-rechazar/{solicitud}/{estado}")
    public ResponseEntity<?> getAceptarRechazar(
        @PathVariable Integer solicitud,
        @PathVariable Integer estado) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", amistadService.aceptarRecharSolicitud(solicitud, estado));
        
        return ResponseEntity.ok(data);
    }

    @PostMapping("/solicitud")
    public ResponseEntity<?> solicitud(@RequestBody SolicitudAmistadDto solicitud) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", amistadService.solicitud(solicitud));
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/cancelar/{solicitudId}")
    public ResponseEntity<?> cancelarSolicitud(@PathVariable Integer solicitudId) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", solicitudAmistadService.cancelSolicitud(solicitudId));
        return ResponseEntity.ok(data);
    }

    @PostMapping("/eliminar")
    public ResponseEntity<?> eliminarAmsitad(@RequestBody SolicitudAmistadDto amistadRequest){
        Map<String, Object> data = new HashMap<>();

        boolean eliminado = this.amistadService.eliminarAmistad(amistadRequest);

        data.put("message", "");
        data.put("data", eliminado);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/silenciar")
    public ResponseEntity<?> silenciarAmsitad(@RequestBody SolicitudAmistadDto amistadRequest){
        Map<String, Object> data = new HashMap<>();

        boolean eliminado = this.amistadService.silenciarAmistad(amistadRequest);

        data.put("message", "");
        data.put("data", eliminado);
        return ResponseEntity.ok(data);
    }

}
