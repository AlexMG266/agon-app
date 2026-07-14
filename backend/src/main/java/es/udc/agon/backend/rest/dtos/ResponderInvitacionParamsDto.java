package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Parámetros requeridos para aceptar o rechazar una invitación de equipo")
public class ResponderInvitacionParamsDto {

    @NotNull
    @Schema(
            description = "Establece si se acepta (true) o se rechaza (false) la invitación recibida",
            example = "true",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Boolean aceptar;

    public ResponderInvitacionParamsDto() {
    }

    public ResponderInvitacionParamsDto(Boolean aceptar) {
        this.aceptar = aceptar;
    }

    public Boolean getAceptar() {
        return aceptar;
    }

    public void setAceptar(Boolean aceptar) {
        this.aceptar = aceptar;
    }
}