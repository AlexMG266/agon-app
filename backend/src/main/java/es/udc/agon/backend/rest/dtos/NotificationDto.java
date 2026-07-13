package es.udc.agon.backend.rest.dtos;

public class NotificationDto {

    private Long id;
    private String asunto;
    private String cuerpo; 
    private boolean leido;
    private boolean pendienteDeAccion;
    private Long referenciaId;
    private String tipo;
    private Long fechaCreacion; // timestamp

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
