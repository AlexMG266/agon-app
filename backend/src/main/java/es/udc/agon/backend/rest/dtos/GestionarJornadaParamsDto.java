package es.udc.agon.backend.rest.dtos;

import jakarta.validation.constraints.NotBlank;

public class GestionarJornadaParamsDto {

    @NotBlank
    private String estado;

    public GestionarJornadaParamsDto() {
    }

    public GestionarJornadaParamsDto(String estado) {
        this.estado = estado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
