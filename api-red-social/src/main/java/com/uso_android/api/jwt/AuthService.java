package com.uso_android.api.jwt;

import com.uso_android.api.dtos.usuario.UsuarioLogInDto;
import com.uso_android.api.entities.Usuario;
import com.uso_android.api.repositories.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


    public AuthService(UsuarioRepository usuarioRepository, JwtService jwtService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public String getToken(UsuarioLogInDto user) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getCorreoUsuario(), user.getPasswordUsuario()));
            UserDetails userDetails = usuarioRepository.findByCorreoUsuario(user.getCorreoUsuario()).orElseThrow();
            return jwtService.getToken(userDetails);
        }catch (BadCredentialsException e){
            throw e;
        }
    }


    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(request.getFirstName());
        usuario.setApellidoUsuario(request.getLastName());
        usuario.setCorreoUsuario(request.getUsername());
        usuario.setPasswordUsuario(passwordEncoder.encode(request.getPassword()));
        usuario.setEstadoUsuario(true);
        usuarioRepository.save(usuario);

        return new AuthResponse(jwtService.getToken(usuario));
    }
}
