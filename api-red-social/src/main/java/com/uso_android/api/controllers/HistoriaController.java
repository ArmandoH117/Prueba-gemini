package com.uso_android.api.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uso_android.api.dtos.HistoriaDto;
import com.uso_android.api.services.HistoriaService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("historias")
@RestController
public class HistoriaController {
    
    private final HistoriaService historiaService;
    
    @GetMapping("/listado/{user}/{page}")
    public ResponseEntity<?> listadoHistorias(
        @PathVariable Integer user,
        @PathVariable Integer page) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", historiaService.listadoHistorias(user, page));
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/usuario/{user}")
    public ResponseEntity<?> historiasUsuario(
        @PathVariable Integer user) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", historiaService.historiasUsuario(user));
        
        return ResponseEntity.ok(data);
    }

    @PostMapping(value = "/agregar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> agregarHistoria(HistoriaDto historiaDto) {

        Map<String, Object> data = new HashMap<>();
        boolean response = historiaService.guardarHistoria(historiaDto);

        if(response){
            data.put("data", historiaDto);
            data.put("message", "");
        }else{
            data.put("message", "Ocurrio un problema al agregar la historia");
        }
        
        return ResponseEntity.ok(data);
    }
}
