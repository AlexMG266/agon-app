package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "DTO con una entrada del historial de variaciones de ELO de un usuario")
public class EloHistorialDto {

    private Long id;
    private Long encuentroId;
    private String equipoLocal;
    private String equipoVisitante;
    private String resultado;
    private int eloAnterior;
    private int eloNuevo;
    private int variacion;
    private LocalDateTime fecha;

    public EloHistorialDto() {
    }

    public EloHistorialDto(Long id, Long encuentroId, String equipoLocal, String equipoVisitante, String resultado,
            int eloAnterior, int eloNuevo, int variacion, LocalDateTime fecha) {
        this.id = id;
        this.encuentroId = encuentroId;
        this.equipoLocal = equipoLocal;
        this.equipoVisitante = equipoVisitante;
        this.resultado = resultado;
        this.eloAnterior = eloAnterior;
        this.eloNuevo = eloNuevo;
        this.variacion = variacion;
        this.fecha = fecha;
    }

    @Schema(description = "Identificador del registro de historial", example = "12")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Schema(description = "Identificador del encuentro en el que se produjo la variación", example = "7")
    public Long getEncuentroId() {
        return encuentroId;
    }

    public void setEncuentroId(Long encuentroId) {
        this.encuentroId = encuentroId;
    }

    @Schema(description = "Nombre del equipo local", example = "Los Pájaros")
    public String getEquipoLocal() {
        return equipoLocal;
    }

    public void setEquipoLocal(String equipoLocal) {
        this.equipoLocal = equipoLocal;
    }

    @Schema(description = "Nombre del equipo visitante", example = "Las Águilas")
    public String getEquipoVisitante() {
        return equipoVisitante;
    }

    public void setEquipoVisitante(String equipoVisitante) {
        this.equipoVisitante = equipoVisitante;
    }

    @Schema(description = "Resultado del encuentro para el usuario (VICTORIA, DERROTA o EMPATE)",
            example = "VICTORIA")
    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    @Schema(description = "ELO del usuario antes del encuentro", example = "832")
    public int getEloAnterior() {
        return eloAnterior;
    }

    public void setEloAnterior(int eloAnterior) {
        this.eloAnterior = eloAnterior;
    }

    @Schema(description = "ELO del usuario después del encuentro", example = "864")
    public int getEloNuevo() {
        return eloNuevo;
    }

    public void setEloNuevo(int eloNuevo) {
        this.eloNuevo = eloNuevo;
    }

    @Schema(description = "Variación de ELO (positiva: subida, negativa: bajada)", example = "32")
    public int getVariacion() {
        return variacion;
    }

    public void setVariacion(int variacion) {
        this.variacion = variacion;
    }

    @Schema(description = "Fecha y hora en la que se registró la variación", example = "2026-08-05T20:30:00")
    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
