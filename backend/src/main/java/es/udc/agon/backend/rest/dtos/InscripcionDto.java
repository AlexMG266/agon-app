package es.udc.agon.backend.rest.dtos;

import java.util.List;

public class InscripcionDto {

    private Long equipoId;
    private String nombreEquipo;
    private Long creadorId;
    private List<UserDto> miembros;
    private Long grupoId;
    private String grupoNombre;

    private int partidosJugados;
    private int partidosGanados;
    private int partidosEmpatados;
    private int partidosPerdidos;
    private int setsGanados;
    private int setsPerdidos;
    private int diferenciaSets;
    private int puntosLiga;

    public InscripcionDto() {
    }

    public InscripcionDto(Long equipoId, String nombreEquipo, Long creadorId, List<UserDto> miembros,
                          Long grupoId, String grupoNombre) {
        this.equipoId = equipoId;
        this.nombreEquipo = nombreEquipo;
        this.creadorId = creadorId;
        this.miembros = miembros;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
    }

    public InscripcionDto(Long equipoId, String nombreEquipo, Long creadorId, List<UserDto> miembros,
                          Long grupoId, String grupoNombre,
                          int partidosJugados, int partidosGanados, int partidosEmpatados, int partidosPerdidos,
                          int setsGanados, int setsPerdidos, int diferenciaSets, int puntosLiga) {
        this.equipoId = equipoId;
        this.nombreEquipo = nombreEquipo;
        this.creadorId = creadorId;
        this.miembros = miembros;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
        this.partidosJugados = partidosJugados;
        this.partidosGanados = partidosGanados;
        this.partidosEmpatados = partidosEmpatados;
        this.partidosPerdidos = partidosPerdidos;
        this.setsGanados = setsGanados;
        this.setsPerdidos = setsPerdidos;
        this.diferenciaSets = diferenciaSets;
        this.puntosLiga = puntosLiga;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }

    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    public Long getCreadorId() {
        return creadorId;
    }

    public void setCreadorId(Long creadorId) {
        this.creadorId = creadorId;
    }

    public List<UserDto> getMiembros() {
        return miembros;
    }

    public void setMiembros(List<UserDto> miembros) {
        this.miembros = miembros;
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }

    public String getGrupoNombre() {
        return grupoNombre;
    }

    public void setGrupoNombre(String grupoNombre) {
        this.grupoNombre = grupoNombre;
    }

    public int getPartidosJugados() {
        return partidosJugados;
    }

    public void setPartidosJugados(int partidosJugados) {
        this.partidosJugados = partidosJugados;
    }

    public int getPartidosGanados() {
        return partidosGanados;
    }

    public void setPartidosGanados(int partidosGanados) {
        this.partidosGanados = partidosGanados;
    }

    public int getPartidosEmpatados() {
        return partidosEmpatados;
    }

    public void setPartidosEmpatados(int partidosEmpatados) {
        this.partidosEmpatados = partidosEmpatados;
    }

    public int getPartidosPerdidos() {
        return partidosPerdidos;
    }

    public void setPartidosPerdidos(int partidosPerdidos) {
        this.partidosPerdidos = partidosPerdidos;
    }

    public int getSetsGanados() {
        return setsGanados;
    }

    public void setSetsGanados(int setsGanados) {
        this.setsGanados = setsGanados;
    }

    public int getSetsPerdidos() {
        return setsPerdidos;
    }

    public void setSetsPerdidos(int setsPerdidos) {
        this.setsPerdidos = setsPerdidos;
    }

    public int getDiferenciaSets() {
        return diferenciaSets;
    }

    public void setDiferenciaSets(int diferenciaSets) {
        this.diferenciaSets = diferenciaSets;
    }

    public int getPuntosLiga() {
        return puntosLiga;
    }

    public void setPuntosLiga(int puntosLiga) {
        this.puntosLiga = puntosLiga;
    }
}
