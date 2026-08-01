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
    private int partidosGanados;
    private int partidosEmpatados;
    private int partidosPerdidos;
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
        this.partidosGanados = 0;
        this.partidosEmpatados = 0;
        this.partidosPerdidos = 0;
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
        this.partidosGanados = 0;
        this.partidosEmpatados = 0;
        this.partidosPerdidos = 0;
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

    @Column(name = "partidosGanados")
    public int getPartidosGanados() {
        return partidosGanados;
    }

    public void setPartidosGanados(int partidosGanados) {
        this.partidosGanados = partidosGanados;
    }

    @Column(name = "partidosEmpatados")
    public int getPartidosEmpatados() {
        return partidosEmpatados;
    }

    public void setPartidosEmpatados(int partidosEmpatados) {
        this.partidosEmpatados = partidosEmpatados;
    }

    @Column(name = "partidosPerdidos")
    public int getPartidosPerdidos() {
        return partidosPerdidos;
    }

    public void setPartidosPerdidos(int partidosPerdidos) {
        this.partidosPerdidos = partidosPerdidos;
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

        // Puntos configurados en el torneo; si el torneo no los tiene definidos,
        // se usa el sistema estándar: victoria 3, empate 1, derrota 0.
        Integer pv = torneo != null ? torneo.getPuntosVictoria() : null;
        Integer pe = torneo != null ? torneo.getPuntosEmpate() : null;
        Integer pd = torneo != null ? torneo.getPuntosDerrota() : null;
        int puntosVictoria = pv != null ? pv : 3;
        int puntosEmpate = pe != null ? pe : 1;
        int puntosDerrota = pd != null ? pd : 0;

        if (setsAFavor > setsEnContra) {
            this.partidosGanados++;
            this.puntosLiga += puntosVictoria;
        } else if (setsAFavor == setsEnContra) {
            this.partidosEmpatados++;
            this.puntosLiga += puntosEmpate;
        } else {
            this.partidosPerdidos++;
            this.puntosLiga += puntosDerrota;
        }
    }
}
