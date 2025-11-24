package com.uso_android.api.controllers;

import java.util.HashMap;
import java.util.Map;

import com.uso_android.api.services.ImagenPublicacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uso_android.api.dtos.publicacion.PublicacionDto;
import com.uso_android.api.services.PublicacionService;
import com.uso_android.api.services.VideoPublicacionService;

import org.springframework.http.MediaType;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/publicaciones")
public class PublicacionController {
    
    private final PublicacionService publicacionService;
    private final ImagenPublicacionService imagenPublicacionService;
    private final VideoPublicacionService videoPublicacionService;

    @GetMapping("/listado/{user}/{page}")
    public ResponseEntity<?> listado(
        @PathVariable Integer user,
        @PathVariable Integer page) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        //data.put("data", publicacionService.getListado(user, page * 10));
        data.put("data", publicacionService.getListadoByUser(user, page * 10));

        return ResponseEntity.ok(data);
    }

    @GetMapping("/publicaciones-usuario/{user}/{page}")
    public ResponseEntity<?> listadoByUser(
        @PathVariable Integer user,
        @PathVariable Integer page) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", publicacionService.getListadoByUserProfile(user, page * 10));
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/publicaciones-usuario/{user}/fotos/{page}")
    public ResponseEntity<?> listadoByUserImg(
            @PathVariable Integer user,
            @PathVariable Integer page) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", imagenPublicacionService.getImagenesPublicadas(user, page * 10));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/publicaciones-usuario/{user}/reels/{page}")
    public ResponseEntity<?> listadoByUserReals(
            @PathVariable Integer user,
            @PathVariable Integer page) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", videoPublicacionService.getVideosPublicados(user, page * 10));
        return ResponseEntity.ok(data);
    }

    @PostMapping(value = "/publicacion", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> agregarPublicacion(PublicacionDto publicacionDto) {
        try {
            publicacionService.nuevaPublicacion(publicacionDto);
            
            Map<String, Object> json = new HashMap<>();
            json.put("data", publicacionDto.getPublicacionId());
            json.put("files", publicacionDto.getImagenes());
            json.put("message", "");
            
            return ResponseEntity.ok(json);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
