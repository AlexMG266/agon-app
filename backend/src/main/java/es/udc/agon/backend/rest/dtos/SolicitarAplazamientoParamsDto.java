package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "Parámetros para solicitar el aplazamiento de un encuentro")
public class SolicitarAplazamientoParamsDto {

    private LocalDateTime fecha;
    private String motivo;

    public SolicitarAplazamientoParamsDto() {
    }

    public SolicitarAplazamientoParamsDto(LocalDateTime fecha, String motivo) {
        this.fecha = fecha;
        this.motivo = motivo;
    }

    @NotNull
    @Schema(
            description = "Nueva fecha propuesta para el encuentro",
            example = "2026-08-12T19:00:00",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    @Schema(description = "Motivo del aplazamiento (opcional)")
    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
