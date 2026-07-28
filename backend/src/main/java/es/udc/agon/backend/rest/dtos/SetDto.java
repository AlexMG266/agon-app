package es.udc.agon.backend.rest.dtos;

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

    public int getNumeroSet() {
        return numeroSet;
    }

    public void setNumeroSet(int numeroSet) {
        this.numeroSet = numeroSet;
    }

    public int getGolesLocal() {
        return golesLocal;
    }

    public void setGolesLocal(int golesLocal) {
        this.golesLocal = golesLocal;
    }

    public int getGolesVisitante() {
        return golesVisitante;
    }

    public void setGolesVisitante(int golesVisitante) {
        this.golesVisitante = golesVisitante;
    }
}
