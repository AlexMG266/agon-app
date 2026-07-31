package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa un set dentro del resultado de un encuentro")
public class SetDto {

    private int numeroSet;
    private int golesLocal;
    private int golesVisitante;

    public SetDto() {
    }

    public SetDto(int numeroSet, int golesLocal, int golesVisitante) {
        this.numeroSet = numeroSet;
        this.golesLocal = golesLocal;
        this.golesVisitante = golesVisitante;
    }

    @Schema(description = "Número de orden del set", example = "1")
    public int getNumeroSet() {
        return numeroSet;
    }

    public void setNumeroSet(int numeroSet) {
        this.numeroSet = numeroSet;
    }

    @Schema(description = "Puntos del equipo local en el set", example = "25")
    public int getGolesLocal() {
        return golesLocal;
    }

    public void setGolesLocal(int golesLocal) {
        this.golesLocal = golesLocal;
    }

    @Schema(description = "Puntos del equipo visitante en el set", example = "20")
    public int getGolesVisitante() {
        return golesVisitante;
    }

    public void setGolesVisitante(int golesVisitante) {
        this.golesVisitante = golesVisitante;
    }
}
