package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Parámetros para actualizar el estado de una inscripción en un torneo")
public class ActualizarInscripcionParamsDto {

    @Schema(description = "Nuevo estado de la inscripción: APROBADA o RECHAZADA",
            example = "APROBADA",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private String estado;

    public ActualizarInscripcionParamsDto() {
    }

    public ActualizarInscripcionParamsDto(String estado) {
        this.estado = estado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
