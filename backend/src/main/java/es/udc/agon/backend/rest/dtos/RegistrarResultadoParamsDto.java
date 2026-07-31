package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Parámetros para registrar el resultado de un encuentro")
public class RegistrarResultadoParamsDto {

    private List<SetDto> sets;

    public RegistrarResultadoParamsDto() {
    }

    public RegistrarResultadoParamsDto(List<SetDto> sets) {
        this.sets = sets;
    }

    @Schema(description = "Sets disputados en el encuentro (con los puntos de cada equipo)")
    public List<SetDto> getSets() {
        return sets;
    }

    public void setSets(List<SetDto> sets) {
        this.sets = sets;
    }
}
