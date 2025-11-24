package com.uso_android.api.jwt;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AuthResponse {
    private String token;
    private String userName;
    private String userId;

    public AuthResponse(String token) {
        this.token = token;
    }
}
