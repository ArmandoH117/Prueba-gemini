package com.uso_android.api.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "usuarios")
@SQLDelete(sql = "UPDATE usuarios SET usuario_deleted = NOW() WHERE usuario_id = ?")
@Where(clause = "usuario_deleted IS NULL")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id", nullable = false)
    private Integer idUsuario;

    @Size(max = 200)
    @NotNull
    @Column(name = "usuario_nombre", nullable = false, length = 200)
    private String nombreUsuario;

    @Size(max = 200)
    @NotNull
    @Column(name = "usuario_apellido", nullable = false, length = 200)
    private String apellidoUsuario;

    @Size(max = 200)
    @NotNull
    @Column(name = "usuario_correo", nullable = false, length = 200)
    private String correoUsuario;

    @NotNull
    @Column(name = "usuario_estado", nullable = false)
    private boolean estadoUsuario;

    @CreationTimestamp
    @Column(name = "usuario_creacion", updatable = false)
    private Instant creacionUsuario;

    @UpdateTimestamp
    @Column(name = "usuario_modificacion")
    private Instant modificacionUsuario;

    @Size(max = 200)
    @NotNull
    @Column(name = "usuario_password", nullable = false, length = 200)
    private String passwordUsuario;

    @Size(max = 20)
    @Column(name = "usuario_telefono", length = 20)
    private String telefonoUsuario;

    @Size(max = 100)
    @Column(name = "usuario_token", length = 100)
    private String tokenUsuario;

    @Column(name = "usuario_codigo_verificacion", length = 10)
    private String codigoVerificacion;

    @Column(name = "usuario_codigo_expira")
    private LocalDateTime codigoExpira;

    @Column(name = "usuario_imagen", length = 200)
    private String usuarioImagen;

    @Column(name = "usuario_imagen_cover", length = 200)
    private String usuarioImagenCover;

    @Column(name = "usuario_deleted")
    private LocalDateTime usuarioDeleted;

    @Column(name = "usuario_bio", length = 255)
    private String bioUsuario;

    @Column(name = "usuario_vive_en", length = 150)
    private String viveEnUsuario;

    @Column(name = "usuario_trabajo", length = 150)
    private String trabajaUsuario;

    @Column(name = "usuario_educacion", length = 150)
    private String educacionUsuario;

    @Column(name = "usuario_origen", length = 150)
    private String origenUsuario;

    @Column(name = "usuario_relacion", length = 100)
    private String relacionSentimentalUsuario;

    @OneToOne
    @JoinColumn(name = "historia_id")
    private Historia historia;

    @Override
    public String getPassword() {
        return this.passwordUsuario;
    }

    @Override
    public String getUsername() {
        return this.correoUsuario;
    }

    @OneToMany(mappedBy = "usuario")
    private List<Amistad> usuarios;

    @OneToMany(mappedBy = "amigo")
    private List<Amistad> amigos;

    @OneToMany(mappedBy = "emisorUsuario")
    private List<SolicitudAmistad> solicitudesEnviadas;

    @OneToMany(mappedBy = "receptorUsuario")
    private List<SolicitudAmistad> solicitudesRecibidas;

    @OneToMany(mappedBy = "usuario")
    private List<Mensaje> listaMensajes;

    @OneToMany(mappedBy = "usuario")
    private List<Historia> listaHistorias;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

}