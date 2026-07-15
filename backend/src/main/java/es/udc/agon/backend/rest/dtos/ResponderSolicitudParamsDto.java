package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Parámetros requeridos para aceptar o rechazar una solicitud de unión a un equipo")
public class ResponderSolicitudParamsDto {

    private Boolean aceptar;

    public ResponderSolicitudParamsDto() {
    }

    public ResponderSolicitudParamsDto(Boolean aceptar) {
        this.aceptar = aceptar;
    }

    @NotNull
    @Schema(
            description = "Establece si se acepta (true) o se rechaza (false) la solicitud (ya sea PROPUESTA o PETICION)",
            example = "true",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    public Boolean getAceptar() {
        return aceptar;
    }

    public void setAceptar(Boolean aceptar) {
        this.aceptar = aceptar;
    }
}