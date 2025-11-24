package com.uso_android.api.services;

import com.uso_android.api.dtos.chat.ChatDto;
import com.uso_android.api.dtos.usuario.*;
import com.uso_android.api.entities.SolicitudAmistad;
import com.uso_android.api.entities.Usuario;
import com.uso_android.api.entities.enums.EstadoSolicitud;
import com.uso_android.api.entities.enums.TipoSolicitud;
import com.uso_android.api.exceptions.exception.DataDuplicationException;
import com.uso_android.api.exceptions.exception.NotFoundException;
import com.uso_android.api.jwt.AuthService;
import com.uso_android.api.mappers.UsuarioMapper;
import com.uso_android.api.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.context.Context;
import com.uso_android.api.repositories.HistoriaRepository;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final GcsService gcsService;
    private final AuthService authService;
    private final AmistadService amistadService;
    private final SolicitudAmistadService solicitudAmistadService;
    private final EmailService emailService;
    private final HistoriaRepository historiaRepository;
    private final AuthenticationManager authenticationManager;

    @Transactional(readOnly = true)
    public Usuario getUsuarioEntity(Integer id) {
        return this.usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con el ID: " + id));
    }

    @Transactional(readOnly = true)
    public Usuario getUsuarioReference(Integer id) {
        if (!this.usuarioRepository.existsById(id)) {
            throw new NotFoundException("Usuario no encontrado con el ID: " + id);
        }
        return this.usuarioRepository.getReferenceById(id);
    }

    @Transactional(readOnly = true)
    public UsuarioPerfilResponseDto getUsuarioRequestDto(UsuarioPerfilRequestDto usuarioRequest) {
        Usuario usuario = this.getUsuarioEntity(usuarioRequest.getUsuarioPerfilId());
        UsuarioPerfilResponseDto usuarioResponse = this.usuarioMapper.toPerfilResponseDto(usuario);

        if (usuario.getUsuarioImagen() != null && usuario.getUsuarioImagen().length() > 0) {
            usuarioResponse.setUsuarioImagenUrl(this.gcsService.generarUrlTemporal(usuario.getUsuarioImagen()));
        }
        if (usuario.getUsuarioImagenCover() != null && usuario.getUsuarioImagenCover().length() > 0) {
            usuarioResponse.setUsuarioImagenCoverUrl(this.gcsService.generarUrlTemporal(usuario.getUsuarioImagenCover()));
        }

        Optional<SolicitudAmistad> solicitudOpt = this.solicitudAmistadService.getSolicitudAmistad(usuarioRequest.getUsuarioId(), usuarioRequest.getUsuarioPerfilId());

        if (solicitudOpt.isPresent()) {
            SolicitudAmistad solicitud = solicitudOpt.get();
            usuarioResponse.setSolicitudId(solicitud.getSolicitudId());
            if (solicitud.getSolicitudEstado() == EstadoSolicitud.PENDIENTE) {
                if (solicitud.getEmisorUsuario().getIdUsuario().equals(usuarioRequest.getUsuarioId())) {
                    usuarioResponse.setTipoSolicitud(TipoSolicitud.ENVIADA);
                } else {
                    usuarioResponse.setTipoSolicitud(TipoSolicitud.RESPONDER);
                }
            } else if (solicitud.getSolicitudEstado() == EstadoSolicitud.ACEPTADA) {
                usuarioResponse.setExistAmistad(true);
                usuarioResponse.setTipoSolicitud(TipoSolicitud.AMiGOS);
            }
        }
        usuarioResponse.setCantidadAmistades(this.amistadService.countAmistades(usuarioRequest.getUsuarioPerfilId()));
        LocalDateTime ultimoDia = LocalDateTime.now().minusDays(1);
        List<String> historias = this.historiaRepository.historiasByUser(usuarioRequest.getUsuarioPerfilId(), ultimoDia);

        for (int i = 0; i < historias.size(); i++) {
            String urlTemporal = gcsService.generarUrlTemporal(historias.get(i));
            historias.set(i, urlTemporal);
        }

        usuarioResponse.setHistorias(historias);

        return usuarioResponse;
    }

    @Transactional(readOnly = true)
    public UsuarioInfoDto getUsuarioInfoDto(Integer id) {
        Usuario usuario = this.getUsuarioEntity(id);
        UsuarioInfoDto usuarioInfoDto = this.usuarioMapper.toInfo(usuario);

        if (usuarioInfoDto.getUsuarioImagen() != null && usuarioInfoDto.getUsuarioImagen().length() > 0) {
            usuarioInfoDto.setUsuarioImagen(
                    gcsService.generarUrlTemporal(usuarioInfoDto.getUsuarioImagen(), 5)
            );
        }

        return usuarioInfoDto;
    }

    @Transactional
    public Integer createUsuario(UsuarioRequestDto usuarioRequestDto) throws IOException {
        Usuario usuario = this.usuarioMapper.toEntity(usuarioRequestDto);
        usuario.setPasswordUsuario(this.passwordEncoder.encode(usuarioRequestDto.getPasswordUsuario()));
        this.usuarioRepository.save(usuario);

        if (usuarioRequestDto.getUsuarioImagen() != null) {
            usuario.setUsuarioImagen(
                    gcsService.upload(usuarioRequestDto.getUsuarioImagen(), "usuarios/" + usuario.getIdUsuario() + "/perfil")
            );
        }

        this.usuarioRepository.save(usuario);

        return usuario.getIdUsuario();
    }

    @Transactional
    public UsuarioRequestDto updateUsuario(Integer idUsuario, UsuarioRequestDto usuarioRequestDto) throws IOException {
        Usuario usuario = this.getUsuarioEntity(idUsuario);
        if (!usuario.getCorreoUsuario().equals(usuarioRequestDto.getCorreoUsuario()) && usuarioRepository.existsByCorreoUsuario(usuarioRequestDto.getCorreoUsuario())) {
            throw new DataDuplicationException("El correo ya esta en uso");
        }

        this.usuarioMapper.partialUpdate(usuarioRequestDto, usuario);
        if (usuarioRequestDto.getPasswordUsuario() != null && usuarioRequestDto.getPasswordUsuario().isBlank() == false) {
            usuario.setPasswordUsuario(this.passwordEncoder.encode(usuarioRequestDto.getPasswordUsuario()));
        }

        if (usuarioRequestDto.getUsuarioImagen() != null) {
            usuario.setUsuarioImagen(
                    gcsService.upload(usuarioRequestDto.getUsuarioImagen(), "usuarios/" + usuario.getIdUsuario() + "/perfil")
            );
        }
        this.usuarioRepository.save(usuario);
        usuarioRequestDto = this.usuarioMapper.toRequest(usuario);
        usuarioRequestDto.setPasswordUsuario(null);
        usuarioRequestDto.setUsuarioImagenUrl(usuario.getUsuarioImagen());
        return usuarioRequestDto;
    }

    @Transactional
    public UsuarioRequestDto updateImagenes(Integer idVenta, MultipartFile perfil, MultipartFile cover) {
        Usuario usuario = this.getUsuarioEntity(idVenta);
        UsuarioRequestDto usuarioRequestDto = this.usuarioMapper.toRequest(usuario);
        try {
            if (perfil != null) {
                usuario.setUsuarioImagen(
                        gcsService.upload(perfil, "usuarios/" + usuario.getIdUsuario() + "/perfil")
                );
                usuarioRequestDto.setUsuarioImagenUrl(this.gcsService.generarUrlTemporal(usuario.getUsuarioImagen()));
            }

            if (cover != null) {
                usuario.setUsuarioImagenCover(
                        gcsService.upload(cover, "usuarios/" + usuario.getIdUsuario() + "/cover")
                );
                usuarioRequestDto.setUsuarioImagenCoverUrl(this.gcsService.generarUrlTemporal(usuario.getUsuarioImagenCover()));
            }
            this.usuarioRepository.save(usuario);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        usuarioRequestDto.setPasswordUsuario(null);
        return usuarioRequestDto;
    }

    public UsuarioRequestDto verifyUser(UsuarioLogInDto usuario) {
        UsuarioRequestDto userInfo = this.usuarioRepository.getUsuarioByEmail(usuario.getCorreoUsuario());

        if (userInfo == null) {
            throw new UsernameNotFoundException("usuario no encontrado");
        }
        if (userInfo.getUsuarioImagenUrl() != null && userInfo.getUsuarioImagenUrl().length() > 0) {
            userInfo.setUsuarioImagenUrl(this.gcsService.generarUrlTemporal(userInfo.getUsuarioImagenUrl()));
        }

        userInfo.setTokenUsuario(authService.getToken(usuario));
        userInfo.setPasswordUsuario(null);

        return userInfo;
    }

    public ChatDto getUserInfoForChat(Integer receptorId) {
        return this.usuarioRepository.getUserInfoForChat(receptorId);
    }

    @Transactional
    public boolean eliminarCuenta(UsuarioLogOut usuarioRequest) {
        try {
            usuarioRepository.deleteById(usuarioRequest.getIdUsuario());

            return true;
        }catch(Exception e){
            return false;
        }
    }

    @Transactional
    public boolean actualizarHistoria(Usuario usuario) {
        try{
            usuarioRepository.save(usuario);

            return true;
        } catch (Exception e) {
            return false;
        }
    }


    @Transactional
    public void recuperacionContasenia(String correoUsuario) {
        Optional<Usuario> oUsuario = this.usuarioRepository.findByCorreoUsuario(correoUsuario);
        if(oUsuario.isPresent()){
            try{
                String code = this.generateCode();
                Usuario usuario = oUsuario.get();
                Context context = new Context();
                usuario.setCodigoVerificacion(code);
                usuario.setCodigoExpira(LocalDateTime.now().plusMinutes(3));
                context.setVariable("usuario", usuario);
                context.setVariable("codigo", code);
                emailService.enviarCorreo(usuario.getCorreoUsuario(), "Recuperacion de contraseña", "/codigo-recuperacion", context);
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new RuntimeException(e);
            }
        }
    }

    private String generateCode(){
        SecureRandom random = new SecureRandom();
        int numero = random.nextInt(1_000_000);
        return String.format("%06d", numero);
    }


    @Transactional
    public String verificarCodigo(String correo, String codigo){
        Optional<Usuario> oUsuario = this.usuarioRepository.findByCorreoUsuario(correo);
        if(oUsuario.isPresent()){
            Usuario usuario = oUsuario.get();
            if(usuario.getCodigoVerificacion() == null || !usuario.getCodigoVerificacion().equals(codigo)){
                throw new RuntimeException("Código de verificación inválido");
            }
            if(usuario.getCodigoExpira() == null || usuario.getCodigoExpira().isBefore(LocalDateTime.now())){
                throw new RuntimeException("El código de verificación ha expirado");
            }
            usuario.setCodigoExpira(null);
            usuario.setCodigoVerificacion(null);
            usuario.setTokenUsuario(UUID.randomUUID().toString());
            return usuario.getTokenUsuario();
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }

    @Transactional
    public void cambiarPassword(String correo, String token, String password){
        Optional<Usuario> oUsuario = this.usuarioRepository.findByCorreoUsuario(correo);
        if(oUsuario.isPresent()){
            Usuario usuario = oUsuario.get();
            if(!usuario.getTokenUsuario().equals(token)){
                throw new RuntimeException("Lo sentimos ha ocurrido un error, intente de mas tarde");
            }
            usuario.setPasswordUsuario(this.passwordEncoder.encode(password));
            usuario.setTokenUsuario(null);
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }

    @Transactional
    public void cambiarPasswordAutentificado(int usuarioId, String password){
        Optional<Usuario> oUsuario = this.usuarioRepository.findById(usuarioId);
        if(oUsuario.isPresent()){
            Usuario usuario = oUsuario.get();
            usuario.setPasswordUsuario(this.passwordEncoder.encode(password));
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }

    @Transactional
    public void actualizarInfoPerfil(PerfilRequestDto perfilRequestDto) throws IOException {
        Usuario usuario = this.getUsuarioEntity(perfilRequestDto.getIdUsuario());
        if (perfilRequestDto.getUsuarioImagen() != null) {
            usuario.setUsuarioImagen(
                    gcsService.upload(perfilRequestDto.getUsuarioImagen(), "usuarios/" + usuario.getIdUsuario() + "/perfil")
            );
        }

        if (perfilRequestDto.getUsuarioImagenCover() != null) {
            usuario.setUsuarioImagenCover(
                    gcsService.upload(perfilRequestDto.getUsuarioImagenCover(), "usuarios/" + usuario.getIdUsuario() + "/cover")
            );
        }

        this.usuarioMapper.partialUpdate(perfilRequestDto, usuario);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public PerfilResponseDto obtenerInfoPerfil(int idUsuario) {
        Usuario usuario = this.getUsuarioEntity(idUsuario);
        PerfilResponseDto perfilResponseDto = this.usuarioMapper.toPerfilResponse(usuario);

        if (usuario.getUsuarioImagen() != null && usuario.getUsuarioImagen().length() > 0) {
            perfilResponseDto.setUsuarioImagenUrl(this.gcsService.generarUrlTemporal(usuario.getUsuarioImagen()));
        }
        if (usuario.getUsuarioImagenCover() != null && usuario.getUsuarioImagenCover().length() > 0) {
            perfilResponseDto.setUsuarioImagenCoverUrl(this.gcsService.generarUrlTemporal(usuario.getUsuarioImagenCover()));
        }

        return perfilResponseDto;
    }

    public void verificarPassword(int usuarioId, String passwordIngresada) {
        Usuario user = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if(!passwordEncoder.matches(passwordIngresada, user.getPasswordUsuario())){
            throw new BadCredentialsException("Contraseña incorrecta");
        }

    }

}
