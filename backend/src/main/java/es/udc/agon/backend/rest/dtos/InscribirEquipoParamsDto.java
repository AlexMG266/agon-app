package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Parámetros para inscribir un equipo en un torneo")
public class InscribirEquipoParamsDto {

    @Schema(description = "ID del equipo a inscribir", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long equipoId;

    @Schema(description = "Código del torneo (obligatorio si el torneo es privado)", example = "T22-K9M8")
    private String codigoTorneo;

    public InscribirEquipoParamsDto() {
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }

    public String getCodigoTorneo() {
        return codigoTorneo;
    }

    public void setCodigoTorneo(String codigoTorneo) {
        this.codigoTorneo = codigoTorneo;
    }
}
