package es.udc.agon.backend.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "invitacion")
public class Invitacion {

    private Long id;
    private User usuarioDestino;
    private User usuarioRemitente;
    private Equipo equipo;
    private EstadoInvitacion estado;
    private LocalDateTime fechaEnvio;

    public Invitacion() {
    }

    public Invitacion(User usuarioDestino, User usuarioRemitente, Equipo equipo) {
        this.usuarioDestino = usuarioDestino;
        this.usuarioRemitente = usuarioRemitente;
        this.equipo = equipo;
        this.estado = EstadoInvitacion.PENDIENTE;
        this.fechaEnvio = LocalDateTime.now();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_destino_id")
    public User getUsuarioDestino() {
        return usuarioDestino;
    }

    public void setUsuarioDestino(User usuarioDestino) {
        this.usuarioDestino = usuarioDestino;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_remitente_id")
    public User getUsuarioRemitente() {
        return usuarioRemitente;
    }

    public void setUsuarioRemitente(User usuarioRemitente) {
        this.usuarioRemitente = usuarioRemitente;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipo_id")
    public Equipo getEquipo() {
        return equipo;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    @Enumerated(EnumType.STRING)
    public EstadoInvitacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoInvitacion estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(LocalDateTime fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }

    public void aceptar() {
        this.estado = EstadoInvitacion.ACEPTADO;
    }

    public void rechazar() {
        this.estado = EstadoInvitacion.RECHAZADO;
    }
}
