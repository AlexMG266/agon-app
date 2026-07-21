package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa un torneo")
public class TorneoDto {

    @Schema(description = "ID único del torneo", example = "1")
    private Long id;

    @Schema(description = "Nombre del torneo", example = "Copa de Primavera")
    private String nombre;

    @Schema(description = "Número de grupos", example = "4")
    private int numGrupos;

    @Schema(description = "Equipos por grupo", example = "4")
    private int equiposPorGrupo;

    @Schema(description = "Si tiene playoff después de fase de grupos", example = "true")
    private boolean tienePlayoff;

    @Schema(description = "Estado del torneo", example = "RECLUTANDO")
    private String estado;

    @Schema(description = "ID del usuario organizador", example = "1")
    private Long organizadorId;

    @Schema(description = "Nombre del organizador", example = "admin")
    private String organizadorNombre;

    public TorneoDto() {
    }

    public TorneoDto(Long id, String nombre, int numGrupos, int equiposPorGrupo,
                     boolean tienePlayoff, String estado, Long organizadorId,
                     String organizadorNombre) {
        this.id = id;
        this.nombre = nombre;
        this.numGrupos = numGrupos;
        this.equiposPorGrupo = equiposPorGrupo;
        this.tienePlayoff = tienePlayoff;
        this.estado = estado;
        this.organizadorId = organizadorId;
        this.organizadorNombre = organizadorNombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getNumGrupos() {
        return numGrupos;
    }

    public void setNumGrupos(int numGrupos) {
        this.numGrupos = numGrupos;
    }

    public int getEquiposPorGrupo() {
        return equiposPorGrupo;
    }

    public void setEquiposPorGrupo(int equiposPorGrupo) {
        this.equiposPorGrupo = equiposPorGrupo;
    }

    public boolean isTienePlayoff() {
        return tienePlayoff;
    }

    public void setTienePlayoff(boolean tienePlayoff) {
        this.tienePlayoff = tienePlayoff;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getOrganizadorId() {
        return organizadorId;
    }

    public void setOrganizadorId(Long organizadorId) {
        this.organizadorId = organizadorId;
    }

    public String getOrganizadorNombre() {
        return organizadorNombre;
    }

    public void setOrganizadorNombre(String organizadorNombre) {
        this.organizadorNombre = organizadorNombre;
    }
}
