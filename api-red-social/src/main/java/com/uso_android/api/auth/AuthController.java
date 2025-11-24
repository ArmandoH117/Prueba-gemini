package com.uso_android.api.auth;

import com.uso_android.api.jwt.AuthResponse;
import com.uso_android.api.jwt.AuthService;
import com.uso_android.api.jwt.LoginRequest;
import com.uso_android.api.jwt.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class AuthController {

    private final AuthService authService;

//    @PostMapping("/login")
//    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
//        return ResponseEntity.ok(authService.login(request));
//    }
//
//    @PostMapping("/register")
//    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request){
//        return ResponseEntity.ok(authService.register(request));
//    }

}
