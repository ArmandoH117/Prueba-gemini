package com.uso_android.api.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

@Service
public class JwtService {
    private static final String SECRET = "$IMEP82OG81hlw2gus6VpZOJfxENVYhQC7nvvxK39LOTTbJi8RJt6";

    public String getToken(UserDetails userDetails) {
        return getToken(new HashMap<>(), userDetails);
    }

    private String getToken(HashMap<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 365))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getCorreoFromToken(String token) {
        return getClaimsFromToken(token, Claims::getSubject );
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = this.getCorreoFromToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private Claims getAllClaims(String token) {
        return Jwts.parser().setSigningKey(getKey()).parseClaimsJws(token).getBody();
    }

    public <T> T getClaimsFromToken(String token, Function<Claims, T> claimsTFunction) {
        final Claims claims = getAllClaims(token);
        return claimsTFunction.apply(claims);
    }

    private Date getExpirationDateFromToken(String token) {
        return getClaimsFromToken(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }
}
