package es.udc.agon.backend.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class EncuentroDto {

    private Long id;
    private Long equipoLocalId;
    private String equipoLocalNombre;
    private Long equipoVisitanteId;
    private String equipoVisitanteNombre;
    private String estado;
    private LocalDateTime fechaRealizacion;
    private List<SetDto> sets;
    private Long ganadorId;
    private String resultado;

    public EncuentroDto() {
    }

    public EncuentroDto(Long id, Long equipoLocalId, String equipoLocalNombre,
                        Long equipoVisitanteId, String equipoVisitanteNombre,
                        String estado, LocalDateTime fechaRealizacion) {
        this(id, equipoLocalId, equipoLocalNombre, equipoVisitanteId, equipoVisitanteNombre,
                estado, fechaRealizacion, null, null, null);
    }

    public EncuentroDto(Long id, Long equipoLocalId, String equipoLocalNombre,
                        Long equipoVisitanteId, String equipoVisitanteNombre,
                        String estado, LocalDateTime fechaRealizacion,
                        List<SetDto> sets, Long ganadorId, String resultado) {
        this.id = id;
        this.equipoLocalId = equipoLocalId;
        this.equipoLocalNombre = equipoLocalNombre;
        this.equipoVisitanteId = equipoVisitanteId;
        this.equipoVisitanteNombre = equipoVisitanteNombre;
        this.estado = estado;
        this.fechaRealizacion = fechaRealizacion;
        this.sets = sets;
        this.ganadorId = ganadorId;
        this.resultado = resultado;
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

    public List<SetDto> getSets() {
        return sets;
    }

    public void setSets(List<SetDto> sets) {
        this.sets = sets;
    }

    public Long getGanadorId() {
        return ganadorId;
    }

    public void setGanadorId(Long ganadorId) {
        this.ganadorId = ganadorId;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }
}
