package com.uso_android.api.jwt;


import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class LoginRequest {

    private String email;

    private String password;

}
