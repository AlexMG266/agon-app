package es.udc.agon.backend.rest.dtos;

import java.time.LocalDateTime;

public class EncuentroDto {

    private Long id;
    private Long equipoLocalId;
    private String equipoLocalNombre;
    private Long equipoVisitanteId;
    private String equipoVisitanteNombre;
    private String estado;
    private LocalDateTime fechaRealizacion;

    public EncuentroDto() {
    }

    public EncuentroDto(Long id, Long equipoLocalId, String equipoLocalNombre,
                        Long equipoVisitanteId, String equipoVisitanteNombre,
                        String estado, LocalDateTime fechaRealizacion) {
        this.id = id;
        this.equipoLocalId = equipoLocalId;
        this.equipoLocalNombre = equipoLocalNombre;
        this.equipoVisitanteId = equipoVisitanteId;
        this.equipoVisitanteNombre = equipoVisitanteNombre;
        this.estado = estado;
        this.fechaRealizacion = fechaRealizacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEquipoLocalId() {
        return equipoLocalId;
    }

    public void setEquipoLocalId(Long equipoLocalId) {
        this.equipoLocalId = equipoLocalId;
    }

    public String getEquipoLocalNombre() {
        return equipoLocalNombre;
    }

    public void setEquipoLocalNombre(String equipoLocalNombre) {
        this.equipoLocalNombre = equipoLocalNombre;
    }

    public Long getEquipoVisitanteId() {
        return equipoVisitanteId;
    }

    public void setEquipoVisitanteId(Long equipoVisitanteId) {
        this.equipoVisitanteId = equipoVisitanteId;
    }

    public String getEquipoVisitanteNombre() {
        return equipoVisitanteNombre;
    }

    public void setEquipoVisitanteNombre(String equipoVisitanteNombre) {
        this.equipoVisitanteNombre = equipoVisitanteNombre;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaRealizacion() {
        return fechaRealizacion;
    }

    public void setFechaRealizacion(LocalDateTime fechaRealizacion) {
        this.fechaRealizacion = fechaRealizacion;
    }
}
