package es.udc.agon.backend.rest.dtos;

import java.util.List;

public class EquipoDto {
    private Long id;
    private String nombreEquipo;
    private String estado;
    private Long creadorId;
    private List<Long> miembrosIds;

    public EquipoDto() {
    }

    public EquipoDto(Long id, String nombreEquipo, String estado, Long creadorId, List<Long> miembrosIds) {
        this.id = id;
        this.nombreEquipo = nombreEquipo;
        this.estado = estado;
        this.creadorId = creadorId;
        this.miembrosIds = miembrosIds;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getCreadorId() {
        return creadorId;
    }

    public void setCreadorId(Long creadorId) {
        this.creadorId = creadorId;
    }

    public List<Long> getMiembrosIds() {
        return miembrosIds;
    }

    public void setMiembrosIds(List<Long> miembrosIds) {
        this.miembrosIds = miembrosIds;
    }
}
