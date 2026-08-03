package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Parámetros para cambiar el estado de un torneo")
public class ActualizarEstadoTorneoParamsDto {

    @Schema(description = "Nuevo estado del torneo: INSCRIPCION_CERRADA",
            example = "INSCRIPCION_CERRADA",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private String estado;

    public ActualizarEstadoTorneoParamsDto() {
    }

    public ActualizarEstadoTorneoParamsDto(String estado) {
        this.estado = estado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
