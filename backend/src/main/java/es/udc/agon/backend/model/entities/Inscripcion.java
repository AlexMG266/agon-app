package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "inscripcion")
public class Inscripcion {

    private Long id;
    private Torneo torneo;
    private Equipo equipo;
    private Grupo grupo;
    private int partidosJugados;
    private EstadoInscripcion estadoInscripcion;
    private int puntosLiga;
    private int setsGanados;
    private int setsPerdidos;

    public Inscripcion() {
    }

    public Inscripcion(Torneo torneo, Equipo equipo, Grupo grupo) {
        this.torneo = torneo;
        this.equipo = equipo;
        this.grupo = grupo;
        this.partidosJugados = 0;
        this.estadoInscripcion = EstadoInscripcion.ACTIVA;
        this.puntosLiga = 0;
        this.setsGanados = 0;
        this.setsPerdidos = 0;
    }

    public Inscripcion(Torneo torneo, Equipo equipo) {
        this.torneo = torneo;
        this.equipo = equipo;
        this.grupo = null;
        this.partidosJugados = 0;
        this.estadoInscripcion = EstadoInscripcion.ACTIVA;
        this.puntosLiga = 0;
        this.setsGanados = 0;
        this.setsPerdidos = 0;
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

    @ManyToOne(optional = false)
    @JoinColumn(name = "idEquipo")
    public Equipo getEquipo() {
        return equipo;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    @ManyToOne
    @JoinColumn(name = "idGrupo")
    public Grupo getGrupo() {
        return grupo;
    }

    public void setGrupo(Grupo grupo) {
        this.grupo = grupo;
    }

    @Column(name = "partidosJugados")
    public int getPartidosJugados() {
        return partidosJugados;
    }

    public void setPartidosJugados(int partidosJugados) {
        this.partidosJugados = partidosJugados;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estadoInscripcion", nullable = false)
    public EstadoInscripcion getEstadoInscripcion() {
        return estadoInscripcion;
    }

    public void setEstadoInscripcion(EstadoInscripcion estadoInscripcion) {
        this.estadoInscripcion = estadoInscripcion;
    }

    @Column(name = "puntosLiga")
    public int getPuntosLiga() {
        return puntosLiga;
    }

    public void setPuntosLiga(int puntosLiga) {
        this.puntosLiga = puntosLiga;
    }

    @Column(name = "setsGanados")
    public int getSetsGanados() {
        return setsGanados;
    }

    public void setSetsGanados(int setsGanados) {
        this.setsGanados = setsGanados;
    }

    @Column(name = "setsPerdidos")
    public int getSetsPerdidos() {
        return setsPerdidos;
    }

    public void setSetsPerdidos(int setsPerdidos) {
        this.setsPerdidos = setsPerdidos;
    }

    public void actualizarEstadisticas(int setsAFavor, int setsEnContra) {
        this.setsGanados += setsAFavor;
        this.setsPerdidos += setsEnContra;
        this.partidosJugados++;
        if (setsAFavor > setsEnContra) {
            this.puntosLiga += 2;
        } else {
            this.puntosLiga += 1;
        }
    }
}
