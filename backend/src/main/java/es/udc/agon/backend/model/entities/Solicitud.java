package es.udc.agon.backend.model.entities;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitud")
public class Solicitud {

    private Long id;
    private User candidato;
    private User decisor;
    private Equipo equipo;
    private EstadoSolicitud estado;
    private TipoSolicitud tipoSolicitud;
    private LocalDateTime fechaCreacion;

    public Solicitud() {
    }

    public Solicitud(User candidato, User decisor, Equipo equipo, TipoSolicitud tipoSolicitud) {
        this.candidato = candidato;
        this.decisor = decisor;
        this.equipo = equipo;
        this.tipoSolicitud = tipoSolicitud;
        this.estado = EstadoSolicitud.PENDIENTE;
        this.fechaCreacion = LocalDateTime.now();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "candidato_id")
    public User getCandidato() {
        return candidato;
    }

    public void setCandidato(User candidato) {
        this.candidato = candidato;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "decisor_id")
    public User getDecisor() {
        return decisor;
    }

    public void setDecisor(User decisor) {
        this.decisor = decisor;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id")
    public Equipo getEquipo() {
        return equipo;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    public EstadoSolicitud getEstado() {
        return estado;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_solicitud")
    public TipoSolicitud getTipoSolicitud() {
        return tipoSolicitud;
    }

    public void setTipoSolicitud(TipoSolicitud tipoSolicitud) {
        this.tipoSolicitud = tipoSolicitud;
    }

    @Column(name = "fecha_creacion")
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public void aceptar() {
        this.estado = EstadoSolicitud.ACEPTADO;
    }

    public void rechazar() {
        this.estado = EstadoSolicitud.RECHAZADO;
    }
}