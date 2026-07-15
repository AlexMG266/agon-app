package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa una notificación del sistema dirigida a un usuario")
public class NotificationDto {

    @Schema(description = "ID único de la notificación", example = "204", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "Título o asunto breve de la notificación", example = "Invitación a equipo", requiredMode = Schema.RequiredMode.REQUIRED)
    private String asunto;

    @Schema(description = "Contenido detallado del mensaje de la notificación", example = "El usuario Drako266 te ha invitado a unirte a su equipo 'Os Riazor Boys'.")
    private String cuerpo;

    @Schema(description = "Indica si el usuario ya ha visualizado la notificación", example = "false")
    private boolean leido;

    @Schema(description = "Indica si la notificación requiere que el usuario tome una decisión (ej. responder a una invitación)", example = "true")
    private boolean pendienteDeAccion;

    @Schema(description = "ID del recurso asociado al que hace referencia la notificación (ej. el ID de la invitación o del equipo)", example = "101")
    private Long referenciaId;

    @Schema(
            description = "Categoría o tipo de notificación que determina el comportamiento en el frontend",
            example = "INVITACION_EQUIPO",
            allowableValues = {"INVITACION_EQUIPO", "SISTEMA", "COMPETICION"}
    )
    private String tipo;

    @Schema(description = "Fecha de registro de la notificación en formato timestamp (milisegundos Epoch)", example = "1783958400000", accessMode = Schema.AccessMode.READ_ONLY)
    private Long fechaCreacion;

    public NotificationDto() {
    }

    public NotificationDto(Long id, String asunto, String cuerpo, boolean leido, boolean pendienteDeAccion, Long referenciaId,
                           String tipo, Long fechaCreacion) {
        this.id = id;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.leido = leido;
        this.pendienteDeAccion = pendienteDeAccion;
        this.referenciaId = referenciaId;
        this.tipo = tipo;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAsunto() {
        return asunto;
    }

    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }

    public String getCuerpo() {
        return cuerpo;
    }

    public void setCuerpo(String cuerpo) {
        this.cuerpo = cuerpo;
    }

    public boolean isLeido() {
        return leido;
    }

    public void setLeido(boolean leido) {
        this.leido = leido;
    }

    public boolean isPendienteDeAccion() {
        return pendienteDeAccion;
    }

    public void setPendienteDeAccion(boolean pendienteDeAccion) {
        this.pendienteDeAccion = pendienteDeAccion;
    }

    public Long getReferenciaId() {
        return referenciaId;
    }

    public void setReferenciaId(Long referenciaId) {
        this.referenciaId = referenciaId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Long getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Long fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}