package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Parámetros requeridos para la creación de un nuevo equipo en el sistema")
public class CrearEquipoParamsDto {

    @NotBlank
    @Size(min = 1, max = 60)
    @Schema(
            description = "Nombre exclusivo que tendrá el equipo",
            example = "Os Riazor Boys",
            requiredMode = Schema.RequiredMode.REQUIRED,
            minLength = 1,
            maxLength = 60
    )
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