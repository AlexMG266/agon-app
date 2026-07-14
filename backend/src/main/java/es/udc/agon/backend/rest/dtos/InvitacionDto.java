package es.udc.agon.backend.rest.dtos;

public class InvitacionDto {
    private Long id;
    private Long usuarioDestinoId;
    private Long usuarioRemitenteId;
    private Long equipoId;
    private String estado;
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
