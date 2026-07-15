package es.udc.agon.backend.rest.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa la información pública y simplificada de un equipo")
public class EquipoDto {

    @Schema(description = "ID único del equipo", example = "1")
    private Long id;

    @Schema(description = "Nombre exclusivo que identifica al equipo", example = "Los Leones de Hércules", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombreEquipo;

    @Schema(description = "Estado actual del equipo en el sistema", example = "ACTIVO", allowableValues = {"ACTIVO", "DISUELTO"})
    private String estado;

    @Schema(description = "ID del usuario que creó y administra el equipo", example = "42")
    private Long creadorId;

    @Schema(description = "Lista con los IDs de los miembros que integran el equipo (máximo 2)", example = "[42, 87]")
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