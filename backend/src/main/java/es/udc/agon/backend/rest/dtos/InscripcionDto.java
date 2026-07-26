package es.udc.agon.backend.rest.dtos;

import java.util.List;

public class InscripcionDto {

    private Long equipoId;
    private String nombreEquipo;
    private Long creadorId;
    private List<UserDto> miembros;
    private Long grupoId;
    private String grupoNombre;

    public InscripcionDto() {
    }

    public InscripcionDto(Long equipoId, String nombreEquipo, Long creadorId, List<UserDto> miembros,
                          Long grupoId, String grupoNombre) {
        this.equipoId = equipoId;
        this.nombreEquipo = nombreEquipo;
        this.creadorId = creadorId;
        this.miembros = miembros;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
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

    public List<UserDto> getMiembros() {
        return miembros;
    }

    public void setMiembros(List<UserDto> miembros) {
        this.miembros = miembros;
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }

    public String getGrupoNombre() {
        return grupoNombre;
    }

    public void setGrupoNombre(String grupoNombre) {
        this.grupoNombre = grupoNombre;
    }
}
