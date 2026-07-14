package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa la información detallada de una invitación enviada a un usuario para unirse a un equipo")
public class InvitacionDto {

    @Schema(description = "ID único de la invitación", example = "101", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID del usuario que recibe la invitación para unirse", example = "87")
    private Long usuarioDestinoId;

    @Schema(description = "ID del usuario que envía/crea la invitación (normalmente el creador del equipo)", example = "42")
    private Long usuarioRemitenteId;

    @Schema(description = "ID del equipo al que se le invita a unirse", example = "1")
    private Long equipoId;

    @Schema(
            description = "Estado actual de la invitación",
            example = "PENDIENTE",
            allowableValues = {"PENDIENTE", "ACEPTADA", "RECHAZADA"}
    )
    private String estado;

    @Schema(description = "Fecha de envío en formato timestamp (milisegundos Epoch)", example = "1783958400000", accessMode = Schema.AccessMode.READ_ONLY)
    private long fechaEnvio;

    public InvitacionDto() {
    }

    public InvitacionDto(Long id, Long usuarioDestinoId, Long usuarioRemitenteId, Long equipoId, String estado,
                         long fechaEnvio) {
        this.id = id;
        this.usuarioDestinoId = usuarioDestinoId;
        this.usuarioRemitenteId = usuarioRemitenteId;
        this.equipoId = equipoId;
        this.estado = estado;
        this.fechaEnvio = fechaEnvio;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioDestinoId() {
        return usuarioDestinoId;
    }

    public void setUsuarioDestinoId(Long usuarioDestinoId) {
        this.usuarioDestinoId = usuarioDestinoId;
    }

    public Long getUsuarioRemitenteId() {
        return usuarioRemitenteId;
    }

    public void setUsuarioRemitenteId(Long usuarioRemitenteId) {
        this.usuarioRemitenteId = usuarioRemitenteId;
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

    public long getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(long fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }
}