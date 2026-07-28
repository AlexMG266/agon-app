package es.udc.agon.backend.rest.dtos;

import java.time.LocalDateTime;

public class AplazamientoDto {

    private LocalDateTime fechaSolicitada;
    private String motivo;

    public AplazamientoDto() {
    }

    public AplazamientoDto(LocalDateTime fechaSolicitada, String motivo) {
        this.fechaSolicitada = fechaSolicitada;
        this.motivo = motivo;
    }

    public LocalDateTime getFechaSolicitada() {
        return fechaSolicitada;
    }

    public void setFechaSolicitada(LocalDateTime fechaSolicitada) {
        this.fechaSolicitada = fechaSolicitada;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
