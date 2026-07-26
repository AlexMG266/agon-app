package es.udc.agon.backend.rest.dtos;

import java.time.LocalDate;
import java.util.List;

public class JornadaDto {

    private Long id;
    private int numeroJornada;
    private String tipoFase;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private List<EncuentroDto> encuentros;

    public JornadaDto() {
    }

    public JornadaDto(Long id, int numeroJornada, String tipoFase,
                      LocalDate fechaInicio, LocalDate fechaFin,
                      List<EncuentroDto> encuentros) {
        this.id = id;
        this.numeroJornada = numeroJornada;
        this.tipoFase = tipoFase;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.encuentros = encuentros;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getNumeroJornada() {
        return numeroJornada;
    }

    public void setNumeroJornada(int numeroJornada) {
        this.numeroJornada = numeroJornada;
    }

    public String getTipoFase() {
        return tipoFase;
    }

    public void setTipoFase(String tipoFase) {
        this.tipoFase = tipoFase;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public List<EncuentroDto> getEncuentros() {
        return encuentros;
    }

    public void setEncuentros(List<EncuentroDto> encuentros) {
        this.encuentros = encuentros;
    }
}
