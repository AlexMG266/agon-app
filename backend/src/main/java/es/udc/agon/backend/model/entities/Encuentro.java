package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "encuentro")
public class Encuentro {

    private Long id;
    private Jornada jornada;
    private Equipo local;
    private Equipo visitante;
    private EstadoEncuentro estadoEncuentro;
    private LocalDateTime fechaRealizacion;
    private List<SetEntity> sets = new ArrayList<>();
    private List<SolicitudAplazamiento> solicitudesAplazamiento = new ArrayList<>();

    public Encuentro() {
    }

    public Encuentro(Jornada jornada, Equipo local, Equipo visitante, LocalDateTime fechaRealizacion) {
        this.jornada = jornada;
        this.local = local;
        this.visitante = visitante;
        this.fechaRealizacion = fechaRealizacion;
        this.estadoEncuentro = EstadoEncuentro.PENDIENTE;
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
    @JoinColumn(name = "idJornada")
    public Jornada getJornada() {
        return jornada;
    }

    public void setJornada(Jornada jornada) {
        this.jornada = jornada;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "idEquipoLocal")
    public Equipo getLocal() {
        return local;
    }

    public void setLocal(Equipo local) {
        this.local = local;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "idEquipoVisitante")
    public Equipo getVisitante() {
        return visitante;
    }

    public void setVisitante(Equipo visitante) {
        this.visitante = visitante;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estadoEncuentro", nullable = false)
    public EstadoEncuentro getEstadoEncuentro() {
        return estadoEncuentro;
    }

    public void setEstadoEncuentro(EstadoEncuentro estadoEncuentro) {
        this.estadoEncuentro = estadoEncuentro;
    }

    @Column(name = "fechaRealizacion")
    public LocalDateTime getFechaRealizacion() {
        return fechaRealizacion;
    }

    public void setFechaRealizacion(LocalDateTime fechaRealizacion) {
        this.fechaRealizacion = fechaRealizacion;
    }

    @OneToMany(mappedBy = "encuentro", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<SetEntity> getSets() {
        return sets;
    }

    public void setSets(List<SetEntity> sets) {
        this.sets = sets;
    }

    @OneToMany(mappedBy = "encuentro", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<SolicitudAplazamiento> getSolicitudesAplazamiento() {
        return solicitudesAplazamiento;
    }

    public void setSolicitudesAplazamiento(List<SolicitudAplazamiento> solicitudesAplazamiento) {
        this.solicitudesAplazamiento = solicitudesAplazamiento;
    }

    @Transient
    public Equipo getGanador() {
        if (estadoEncuentro != EstadoEncuentro.JUGADO || sets.isEmpty()) {
            return null;
        }
        int setsLocal = 0;
        int setsVisitante = 0;
        for (SetEntity set : sets) {
            if (set.getGolesLocal() > set.getGolesVisitante()) {
                setsLocal++;
            } else {
                setsVisitante++;
            }
        }
        if (setsLocal > setsVisitante) {
            return local;
        } else if (setsVisitante > setsLocal) {
            return visitante;
        }
        return null;
    }
}
