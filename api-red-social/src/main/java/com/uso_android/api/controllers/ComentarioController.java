package com.uso_android.api.controllers;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import com.uso_android.api.dtos.comentario.ComentarioRequestDto;
import com.uso_android.api.services.ComentarioService;
import org.springframework.http.MediaType;

import lombok.RequiredArgsConstructor;

@RequestMapping("comentarios")
@RequiredArgsConstructor
@RestController
public class ComentarioController {
    private final ComentarioService comentarioService;
    
    @GetMapping("/publicacion/{publicacionId}/{page}")
    public ResponseEntity<?> comentariosPublicacion(
        @PathVariable Integer publicacionId, @PathVariable Integer page) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", comentarioService.getComentariosPublicacion(publicacionId, page * 10));
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/respuestas/{comentarioId}/{page}")
    public ResponseEntity<?> respuestasComentario(
        @PathVariable Integer comentarioId, @PathVariable Integer page) {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", comentarioService.getRespuestasComentario(comentarioId, page * 20));
        
        return ResponseEntity.ok(data);
    }

    @PostMapping(value = "/agregar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> agregarComentario(ComentarioRequestDto comentario) throws IOException {

        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", comentarioService.guardarComentario(comentario));
        
        return ResponseEntity.ok(data);
    }
}
