package com.uso_android.api.jwt;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RegisterRequest {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String country;
}
