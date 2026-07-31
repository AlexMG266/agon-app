package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Parámetros para configurar la estructura del torneo tras cerrar inscripciones")
public class ConfigurarEstructuraParamsDto {

    @Schema(description = "Tipo de torneo: LIGA_UNICA, GRUPOS_PLAYOFF, ELIMINATORIAS", example = "GRUPOS_PLAYOFF")
    private String tipoTorneo;

    @Schema(description = "Número de grupos", example = "4")
    private int numGrupos;

    @Schema(description = "Equipos por grupo", example = "4")
    private int equiposPorGrupo;

    @Schema(description = "Si tiene playoff después de fase de grupos", example = "true")
    private boolean tienePlayoff;

    @Schema(description = "Partidos de ida y vuelta en playoffs", example = "false")
    private boolean idaVueltaPlayoff;

    @Schema(description = "Estrategia de distribución para playoffs: RAPIDO, JORNADAS", example = "RAPIDO")
    private String estrategiaPlayoff;

    @Schema(description = "Días de separación entre rondas de playoff (solo JORNADAS)", example = "7")
    private Integer diasEntrePlayoff;

    @Schema(description = "Fecha de fin del torneo (yyyy-MM-dd). Si no se proporciona, se calculará automáticamente", example = "2026-05-15", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String fechaFin;

    public ConfigurarEstructuraParamsDto() {
    }

    public String getTipoTorneo() {
        return tipoTorneo;
    }

    public void setTipoTorneo(String tipoTorneo) {
        this.tipoTorneo = tipoTorneo;
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

    public boolean isIdaVueltaPlayoff() {
        return idaVueltaPlayoff;
    }

    public void setIdaVueltaPlayoff(boolean idaVueltaPlayoff) {
        this.idaVueltaPlayoff = idaVueltaPlayoff;
    }

    public String getEstrategiaPlayoff() {
        return estrategiaPlayoff;
    }

    public void setEstrategiaPlayoff(String estrategiaPlayoff) {
        this.estrategiaPlayoff = estrategiaPlayoff;
    }

    public Integer getDiasEntrePlayoff() {
        return diasEntrePlayoff;
    }

    public void setDiasEntrePlayoff(Integer diasEntrePlayoff) {
        this.diasEntrePlayoff = diasEntrePlayoff;
    }

    public String getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(String fechaFin) {
        this.fechaFin = fechaFin;
    }
}
