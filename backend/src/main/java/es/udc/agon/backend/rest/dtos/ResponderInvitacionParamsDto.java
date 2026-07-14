package es.udc.agon.backend.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class ResponderInvitacionParamsDto {

    @NotNull
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
