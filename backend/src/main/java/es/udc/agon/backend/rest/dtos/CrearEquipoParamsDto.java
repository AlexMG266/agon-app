package es.udc.agon.backend.rest.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CrearEquipoParamsDto {

    @NotBlank
    @Size(min = 1, max = 60)
    private String nombreEquipo;

    public CrearEquipoParamsDto() {
    }

    public CrearEquipoParamsDto(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }
}
