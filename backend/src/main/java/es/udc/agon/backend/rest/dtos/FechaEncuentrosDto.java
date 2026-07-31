package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "DTO que agrupa los encuentros de un usuario por fecha")
public class FechaEncuentrosDto {

    private LocalDate fecha;
    private List<EncuentroDto> encuentros;

    public FechaEncuentrosDto() {
    }

    public FechaEncuentrosDto(LocalDate fecha, List<EncuentroDto> encuentros) {
        this.fecha = fecha;
        this.encuentros = encuentros;
    }

    @Schema(description = "Fecha de los encuentros", example = "2026-08-05")
    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    @Schema(description = "Encuentros programados en esa fecha")
    public List<EncuentroDto> getEncuentros() {
        return encuentros;
    }

    public void setEncuentros(List<EncuentroDto> encuentros) {
        this.encuentros = encuentros;
    }
}
