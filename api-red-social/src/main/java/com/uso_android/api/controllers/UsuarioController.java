package com.uso_android.api.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.uso_android.api.dtos.usuario.*;
import com.uso_android.api.exceptions.exception.DataDuplicationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.uso_android.api.services.PushTopicsService;
import com.uso_android.api.services.UsuarioService;

import org.springframework.http.MediaType;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/usuarios")
public class UsuarioController {
    private final PushTopicsService pushTopicsService;
    private final UsuarioService usuarioService;
    
    @GetMapping("/test")
    public ResponseEntity<?> test() throws Exception {
        List<String> tokens = new ArrayList<>();
        tokens.add("e43wyKABSwiIvNV92LZWF_:APA91bEkyRwd98GLmqos9aV42_OAshwYO2h1Octz12GxbpkQ3qmAduwSQPqs_3lQEmxuwy4Dm3lBJp-uuNTH7zXep3ywGJUdyntFAT53SO-wj_X4LiRdrtc");

        this.pushTopicsService.subscribeUserTokens(1, tokens);

        Map<String, Object> data = new HashMap<>();
        data.put("message", "funcionando");
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/info/{user}")
    public ResponseEntity<?> infoUser(@PathVariable Integer user){
        
        Map<String, Object> data = new HashMap<>();
        data.put("data", usuarioService.getUsuarioInfoDto(user));
        
        return ResponseEntity.ok(data);
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrar(@ModelAttribute UsuarioRequestDto usuario) throws IOException{
        Integer usuarioId = usuarioService.createUsuario(usuario);

        Map<String, Object> data = new HashMap<>();
        data.put("message", "Registro completado exitosamente");
        data.put("data", usuarioId);
        
        return ResponseEntity.ok(data);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioLogInDto usuario){

        Map<String, Object> data = new HashMap<>();

        try {
            UsuarioRequestDto userInfo = usuarioService.verifyUser(usuario);

            List<String> tokens = new ArrayList<>();
            tokens.add(usuario.getTokenUsuario());

            //this.pushTopicsService.subscribeUserTokens(userInfo.getIdUsuario(), tokens);
            data.put("data", userInfo);
            data.put("message", "");
            System.out.println(userInfo.getTokenUsuario());

        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            data.put("data", "");
            data.put("message", "Usuario o contraseña incorrectos");

        } catch (Exception e) {
            e.printStackTrace();
            data.put("message", "Error en el servidor");
        }
        return ResponseEntity.ok(data);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(UsuarioLogOut usuario) throws Exception{

        List<String> tokens = new ArrayList<>();
        tokens.add(usuario.getTokenUsuario());

        //this.pushTopicsService.unsubscribeUserTokens(usuario.getIdUsuario(), tokens);

        Map<String, String> data = new HashMap<>();
        data.put("data", "");
        
        return ResponseEntity.ok(data);
    }

    @PostMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUsuario(@ModelAttribute UsuarioRequestDto usuario) throws IOException{
        Map<String, Object> data = new HashMap<>();

        try {
            data.put("message", "Registro completado exitosamente");
            data.put("data", usuarioService.updateUsuario(usuario.getIdUsuario(), usuario));
            return ResponseEntity.ok(data);
        } catch (DataDuplicationException e){
            data.put("message", "El correo ya esta en uso");
            data.put("data", "");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(data);
        } catch (Exception e) {
            data.put("message", "Ocurrio un error en el servidor");
            data.put("data", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(data);
        }

    }

    @PostMapping(value = "/update-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUsuarioImagen(
            @RequestParam("idUsuario") Integer idUsuario,
            @RequestParam(value = "perfil", required = false) MultipartFile perfil,
            @RequestParam(value = "cover", required = false) MultipartFile cover
    ) {
        Map<String, Object> data = new HashMap<>();
        try {
            data.put("message", "");
            data.put("data", usuarioService.updateImagenes(idUsuario, perfil, cover));
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/perfil")
    public ResponseEntity<?> getPerfilUsuario(@RequestBody UsuarioPerfilRequestDto usuarioRequest){
        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", usuarioService.getUsuarioRequestDto(usuarioRequest));
        return ResponseEntity.ok(data);
    }

    @PostMapping("/eliminar-cuenta")
    public ResponseEntity<?> eliminarCuenta(@RequestBody UsuarioLogOut usuarioRequest){
        Map<String, Object> data = new HashMap<>();
        data.put("message", "");
        data.put("data", usuarioService.eliminarCuenta(usuarioRequest));
        //this.pushTopicsService.unsubscribeUserTokens(usuario.getIdUsuario(), tokens);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/recuperacion-password")
    public ResponseEntity<?> recuperarPassword(@RequestParam String correo) {
        try{
            this.usuarioService.recuperacionContasenia(correo);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }


    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestParam String correo, @RequestParam String codigo){
        Map<String, Object> data = new HashMap<>();
        try {
            String token = usuarioService.verificarCodigo(correo, codigo);
            data.put("token", token);
            data.put("message", "");
        } catch (RuntimeException e) {
            data.put("message", e.getMessage());
        }
        return ResponseEntity.ok(data);
    }

    @PostMapping("/verificar-password")
    public ResponseEntity<?> verificarPassword(@RequestParam Integer usuarioId, @RequestParam String passwoord){
        Map<String, Object> data = new HashMap<>();
        try {
            usuarioService.verificarPassword(usuarioId, passwoord);
            data.put("data", "");
            data.put("message", "");
        } catch (BadCredentialsException ex) {
            data.put("data", "");
            data.put("message", "Contraseña incorrecta");
        } catch (Exception e) {
            e.printStackTrace();
            data.put("message", "Error en el servidor");
        }
        return ResponseEntity.ok(data);
    }

    @PostMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestParam String correo,
                                             @RequestParam String token,
                                             @RequestParam String password){
        try{
            usuarioService.cambiarPassword(correo, token, password);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/cambiar-password-auth")
    public ResponseEntity<?> cambiarPassword(@RequestParam String password,
                                             @RequestParam int usuarioId){
        try{
            usuarioService.cambiarPasswordAutentificado(usuarioId, password);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/actualizar-info-perfil", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarInfoPerfil(@ModelAttribute PerfilRequestDto perfilRequestDto){
        try{
            usuarioService.actualizarInfoPerfil(perfilRequestDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/info-perfil/{idUsuario}")
    public ResponseEntity<?> registrar(@PathVariable int idUsuario) throws IOException{
        PerfilResponseDto perfilResponseDto = usuarioService.obtenerInfoPerfil(idUsuario);

        Map<String, Object> data = new HashMap<>();
        data.put("message", "Registro completado exitosamente");
        data.put("data", perfilResponseDto);

        return ResponseEntity.ok(data);
    }


}
