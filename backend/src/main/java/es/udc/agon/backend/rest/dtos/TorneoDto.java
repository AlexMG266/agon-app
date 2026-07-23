package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa un torneo")
public class TorneoDto {

    @Schema(description = "ID único del torneo", example = "1")
    private Long id;

    @Schema(description = "Nombre del torneo", example = "Copa de Primavera")
    private String nombre;

    @Schema(description = "Número de grupos", example = "4")
    private int numGrupos;

    @Schema(description = "Equipos por grupo", example = "4")
    private int equiposPorGrupo;

    @Schema(description = "Si tiene playoff después de fase de grupos", example = "true")
    private boolean tienePlayoff;

    @Schema(description = "Estado del torneo", example = "RECLUTANDO")
    private String estado;

    @Schema(description = "ID del usuario organizador", example = "1")
    private Long organizadorId;

    @Schema(description = "Nombre del organizador", example = "admin")
    private String organizadorNombre;

    @Schema(description = "Tipo de torneo: LIGA_UNICA, GRUPOS_PLAYOFF, ELIMINATORIAS", example = "GRUPOS_PLAYOFF")
    private String tipoTorneo;

    @Schema(description = "Partidos de ida y vuelta en playoffs", example = "false")
    private boolean idaVueltaPlayoff;

    @Schema(description = "Número de equipos inscritos en el torneo", example = "8")
    private int numEquiposInscritos;

    @Schema(description = "Indica si el torneo es privado (requiere código para inscribirse)", example = "false")
    private boolean privado;

    @Schema(description = "Código único del torneo para compartir", example = "T22-K9M8")
    private String codigoTorneo;

    public TorneoDto() {
    }

    public TorneoDto(Long id, String nombre, int numGrupos, int equiposPorGrupo,
                     boolean tienePlayoff, String estado, Long organizadorId,
                     String organizadorNombre, String tipoTorneo, boolean idaVueltaPlayoff,
                     int numEquiposInscritos, boolean privado, String codigoTorneo) {
        this.id = id;
        this.nombre = nombre;
        this.numGrupos = numGrupos;
        this.equiposPorGrupo = equiposPorGrupo;
        this.tienePlayoff = tienePlayoff;
        this.estado = estado;
        this.organizadorId = organizadorId;
        this.organizadorNombre = organizadorNombre;
        this.tipoTorneo = tipoTorneo;
        this.idaVueltaPlayoff = idaVueltaPlayoff;
        this.numEquiposInscritos = numEquiposInscritos;
        this.privado = privado;
        this.codigoTorneo = codigoTorneo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getNumGrupos() {
        return numGrupos;
    }

    public void setNumGrupos(int numGrupos) {
        this.numGrupos = numGrupos;
    }

    public int getEquiposPorGrupo() {
        return equiposPorGrupo;
    }

    public void setEquiposPorGrupo(int equiposPorGrupo) {
        this.equiposPorGrupo = equiposPorGrupo;
    }

    public boolean isTienePlayoff() {
        return tienePlayoff;
    }

    public void setTienePlayoff(boolean tienePlayoff) {
        this.tienePlayoff = tienePlayoff;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getOrganizadorId() {
        return organizadorId;
    }

    public void setOrganizadorId(Long organizadorId) {
        this.organizadorId = organizadorId;
    }

    public String getOrganizadorNombre() {
        return organizadorNombre;
    }

    public void setOrganizadorNombre(String organizadorNombre) {
        this.organizadorNombre = organizadorNombre;
    }

    public String getTipoTorneo() {
        return tipoTorneo;
    }

    public void setTipoTorneo(String tipoTorneo) {
        this.tipoTorneo = tipoTorneo;
    }

    public boolean isIdaVueltaPlayoff() {
        return idaVueltaPlayoff;
    }

    public void setIdaVueltaPlayoff(boolean idaVueltaPlayoff) {
        this.idaVueltaPlayoff = idaVueltaPlayoff;
    }

    public int getNumEquiposInscritos() {
        return numEquiposInscritos;
    }

    public void setNumEquiposInscritos(int numEquiposInscritos) {
        this.numEquiposInscritos = numEquiposInscritos;
    }

    public boolean isPrivado() {
        return privado;
    }

    public void setPrivado(boolean privado) {
        this.privado = privado;
    }

    public String getCodigoTorneo() {
        return codigoTorneo;
    }

    public void setCodigoTorneo(String codigoTorneo) {
        this.codigoTorneo = codigoTorneo;
    }
}
