package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jornada")
public class Jornada {

    private Long id;
    private Torneo torneo;
    private int numeroJornada;
    private TipoFase tipoFase;
    private TipoJornada formatoJornada;
    private EstadoJornada estado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private List<Encuentro> encuentros = new ArrayList<>();

    public Jornada() {
    }

    public Jornada(Torneo torneo, int numeroJornada, TipoFase tipoFase, TipoJornada formatoJornada,
                   LocalDate fechaInicio, LocalDate fechaFin) {
        this.torneo = torneo;
        this.numeroJornada = numeroJornada;
        this.tipoFase = tipoFase;
        this.formatoJornada = formatoJornada;
        this.estado = EstadoJornada.ACTIVA;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
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
    @JoinColumn(name = "idTorneo")
    public Torneo getTorneo() {
        return torneo;
    }

    public void setTorneo(Torneo torneo) {
        this.torneo = torneo;
    }

    @Column(name = "numeroJornada", nullable = false)
    public int getNumeroJornada() {
        return numeroJornada;
    }

    public void setNumeroJornada(int numeroJornada) {
        this.numeroJornada = numeroJornada;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "tipoFase", nullable = false)
    public TipoFase getTipoFase() {
        return tipoFase;
    }

    public void setTipoFase(TipoFase tipoFase) {
        this.tipoFase = tipoFase;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "formatoJornada", nullable = false)
    public TipoJornada getFormatoJornada() {
        return formatoJornada;
    }

    public void setFormatoJornada(TipoJornada formatoJornada) {
        this.formatoJornada = formatoJornada;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    public EstadoJornada getEstado() {
        return estado;
    }

    public void setEstado(EstadoJornada estado) {
        this.estado = estado;
    }

    @Column(name = "fechaInicio")
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    @Column(name = "fechaFin")
    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    @OneToMany(mappedBy = "jornada", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Encuentro> getEncuentros() {
        return encuentros;
    }

    public void setEncuentros(List<Encuentro> encuentros) {
        this.encuentros = encuentros;
    }
}
