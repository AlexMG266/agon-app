package es.udc.agon.backend.rest.dtos;

public class InscripcionDto {

    private Long equipoId;
    private String nombreEquipo;
    private Long creadorId;

    public InscripcionDto() {
    }

    public InscripcionDto(Long equipoId, String nombreEquipo, Long creadorId) {
        this.equipoId = equipoId;
        this.nombreEquipo = nombreEquipo;
        this.creadorId = creadorId;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }

    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    public Long getCreadorId() {
        return creadorId;
    }

    public void setCreadorId(Long creadorId) {
        this.creadorId = creadorId;
    }
}
