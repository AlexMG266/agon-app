package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa la información de una solicitud de unión (PROPUESTA del creador o PETICION del jugador)")
public class SolicitudDto {

    @Schema(description = "ID único de la solicitud", example = "101", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID del usuario que entrará al equipo si se aprueba (el candidato)", example = "87")
    private Long candidatoId;

    @Schema(description = "ID del usuario que debe decidir si acepta o rechaza (el decisor)", example = "42")
    private Long decisorId;

    @Schema(description = "ID del equipo asociado a la solicitud", example = "1")
    private Long equipoId;

    @Schema(
            description = "Estado actual de la solicitud",
            example = "PENDIENTE",
            allowableValues = {"PENDIENTE", "ACEPTADO", "RECHAZADO"}
    )
    private String estado;

    @Schema(
            description = "Tipo de flujo que originó la solicitud",
            example = "PROPUESTA",
            allowableValues = {"PROPUESTA", "PETICION"}
    )
    private String tipoSolicitud;

    @Schema(description = "Fecha de creación en formato timestamp (milisegundos Epoch)", example = "1783958400000", accessMode = Schema.AccessMode.READ_ONLY)
    private long fechaCreacion;

    public SolicitudDto() {
    }

    public SolicitudDto(Long id, Long candidatoId, Long decisorId, Long equipoId, String estado,
                        String tipoSolicitud, long fechaCreacion) {
        this.id = id;
        this.candidatoId = candidatoId;
        this.decisorId = decisorId;
        this.equipoId = equipoId;
        this.estado = estado;
        this.tipoSolicitud = tipoSolicitud;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCandidatoId() {
        return candidatoId;
    }

    public void setCandidatoId(Long candidatoId) {
        this.candidatoId = candidatoId;
    }

    public Long getDecisorId() {
        return decisorId;
    }

    public void setDecisorId(Long decisorId) {
        this.decisorId = decisorId;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getTipoSolicitud() {
        return tipoSolicitud;
    }

    public void setTipoSolicitud(String tipoSolicitud) {
        this.tipoSolicitud = tipoSolicitud;
    }

    public long getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(long fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}