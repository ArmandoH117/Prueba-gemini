package com.uso_android.api.controllers;

import com.uso_android.api.dtos.chat.ChatDto;
import com.uso_android.api.dtos.MensajeDto;
import com.uso_android.api.entities.Mensaje;
import com.uso_android.api.services.ChatService;
import com.uso_android.api.services.FcmService;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.MediaType;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {
    private final FcmService fcmService;
    private final ChatService chatService;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        Map<String, String> data = new HashMap<>();
        data.put("message", "funcionando");
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/listado/{user}/{page}")
    public ResponseEntity<?> getChats(
        @PathVariable Integer user,
        @PathVariable Integer page){

        Map<String, Object> json = new HashMap<>();
        json.put("data", chatService.getChatsUsuario(user, page * 10));
        json.put("message", "");

        return ResponseEntity.ok(json);
    }

    @GetMapping("/mensajes/{receptorId}/{user}")
    public ResponseEntity<?> getMessages(
        @PathVariable Integer receptorId,
        @PathVariable Integer user){

        ChatDto infoUser = chatService.getInfoChat(receptorId, user);
        Map<String, Object> json = new HashMap<>();

        if(infoUser.getChatId() > 0){
            json.put("data", chatService.getChatMessages(infoUser.getChatId().intValue(), 0));
        }else{
            json.put("data", new ArrayList<>());
        }

        json.put("infoChat", infoUser);
        json.put("message", "");

        return ResponseEntity.ok(json);
    }

    @GetMapping("/mensajes-anteriores/{chat}/{page}")
    public ResponseEntity<?> getPreviousMessages(
        @PathVariable Integer chat,
        @PathVariable Integer page){

        Map<String, Object> json = new HashMap<>();
        json.put("data", chatService.getChatMessages(chat, page * 10));
        json.put("message", "");

        return ResponseEntity.ok(json);
    }

    @PostMapping(value = "/mensaje", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendChat(@ModelAttribute MensajeDto mensajeDto) {
        try {
            Mensaje mensaje = chatService.nuevoMensaje(mensajeDto);
            fcmService.sendChatPush(mensaje);
            
            Map<String, Object> json = new HashMap<>();
            json.put("data", mensaje.getMensajeId());
            json.put("files", mensajeDto.getImagenes());
            json.put("chatId", mensaje.getChat().getChatId());
            json.put("message", "");
            
            return ResponseEntity.ok(json);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
