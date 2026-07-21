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
}
