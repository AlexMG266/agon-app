package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Parámetros para crear una solicitud de unión a un equipo")
public class CrearSolicitudParamsDto {

    @Schema(description = "ID del jugador invitado (propuesta del capitán)", example = "87")
    private Long jugadorId;

    @Schema(description = "Código de invitación único del equipo (petición mediante código)", example = "a7K9pX2L")
    private String codigoEquipo;

    public CrearSolicitudParamsDto() {
    }

    public Long getJugadorId() {
        return jugadorId;
    }

    public void setJugadorId(Long jugadorId) {
        this.jugadorId = jugadorId;
    }

    public String getCodigoEquipo() {
        return codigoEquipo;
    }

    public void setCodigoEquipo(String codigoEquipo) {
        this.codigoEquipo = codigoEquipo;
    }
}
