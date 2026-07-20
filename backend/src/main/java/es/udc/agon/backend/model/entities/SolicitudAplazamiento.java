package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud_aplazamiento")
public class SolicitudAplazamiento {

    private Long id;
    private Encuentro encuentro;
    private Equipo equipoSolicitante;
    private LocalDateTime fechaSolicitada;
    private EstadoSolicitud estado;

    public SolicitudAplazamiento() {
    }

    public SolicitudAplazamiento(Encuentro encuentro, Equipo equipoSolicitante, LocalDateTime fechaSolicitada) {
        this.encuentro = encuentro;
        this.equipoSolicitante = equipoSolicitante;
        this.fechaSolicitada = fechaSolicitada;
        this.estado = EstadoSolicitud.PENDIENTE;
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
    @JoinColumn(name = "idEncuentro")
    public Encuentro getEncuentro() {
        return encuentro;
    }

    public void setEncuentro(Encuentro encuentro) {
        this.encuentro = encuentro;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "idEquipoSolicitante")
    public Equipo getEquipoSolicitante() {
        return equipoSolicitante;
    }

    public void setEquipoSolicitante(Equipo equipoSolicitante) {
        this.equipoSolicitante = equipoSolicitante;
    }

    @Column(name = "fechaSolicitada", nullable = false)
    public LocalDateTime getFechaSolicitada() {
        return fechaSolicitada;
    }

    public void setFechaSolicitada(LocalDateTime fechaSolicitada) {
        this.fechaSolicitada = fechaSolicitada;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    public EstadoSolicitud getEstado() {
        return estado;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }

    public void aceptarSolicitud() {
        this.estado = EstadoSolicitud.ACEPTADO;
    }

    public void cancelarSolicitud() {
        this.estado = EstadoSolicitud.RECHAZADO;
    }
}
