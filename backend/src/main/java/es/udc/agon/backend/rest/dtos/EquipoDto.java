package es.udc.agon.backend.rest.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa la información pública y detallada de un equipo")
public class EquipoDto {

    @Schema(description = "ID único del equipo", example = "1")
    private Long id;

    @Schema(description = "Nombre exclusivo que identifica al equipo", example = "Los Leones de Hércules", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombreEquipo;

    @Schema(description = "Estado actual del equipo en el sistema", example = "ACTIVO", allowableValues = {"ACTIVO", "DISUELTO"})
    private String estado;

    @Schema(description = "Descripción del equipo, que puede incluir información adicional sobre su propósito o características", example = "Equipo de desarrollo de software especializado en aplicaciones web")
    private String descripcion;

    @Schema(description = "ID del usuario que creó y administra el equipo", example = "42")
    private Long creadorId;

    @Schema(description = "Código único de invitación del equipo", example = "ABCD1234")
    private String codigoEquipo;

    @Schema(description = "Lista con los datos detallados de los miembros que integran el equipo", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<UserDto> miembros;

    @Schema(description = "Fecha de creación en formato timestamp (milisegundos Epoch)", example = "1783958400000", accessMode = Schema.AccessMode.READ_ONLY)
    private Long fechaCreacion;

    @Schema(description = "Número de encuentros jugados (estado JUGADO) en los que ha participado el equipo", example = "4")
    private long numPartidas;

    public EquipoDto() {
    }

    public EquipoDto(Long id, String nombreEquipo, String descripcion, String estado, Long creadorId, String codigoEquipo, List<UserDto> miembros, Long fechaCreacion, long numPartidas) {
        this.id = id;
        this.nombreEquipo = nombreEquipo;
        this.descripcion = descripcion;
        this.estado = estado;
        this.creadorId = creadorId;
        this.codigoEquipo = codigoEquipo;
        this.miembros = miembros;
        this.fechaCreacion = fechaCreacion;
        this.numPartidas = numPartidas;
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

    public String getCodigoEquipo() {
        return codigoEquipo;
    }

    public void setCodigoEquipo(String codigoEquipo) {
        this.codigoEquipo = codigoEquipo;
    }

    public List<UserDto> getMiembros() {
        return miembros;
    }

    public void setMiembros(List<UserDto> miembros) {
        this.miembros = miembros;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Long fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public long getNumPartidas() {
        return numPartidas;
    }

    public void setNumPartidas(long numPartidas) {
        this.numPartidas = numPartidas;
    }
}