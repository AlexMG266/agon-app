package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Parámetros para actualizar los datos editables de un torneo")
public class ActualizarTorneoParamsDto {

    @Schema(description = "Nombre del torneo", example = "Copa de Primavera")
    private String nombre;

    @Schema(description = "Fecha de inicio (yyyy-MM-dd)", example = "2026-03-01")
    private String fechaInicio;

    @Schema(description = "Fecha de fin (yyyy-MM-dd)", example = "2026-04-30")
    private String fechaFin;

    @Schema(description = "Fecha límite de inscripción (yyyy-MM-dd)", example = "2026-02-20")
    private String fechaLimiteInscripcion;

    @Schema(description = "Puntos por victoria", example = "3")
    private Integer puntosVictoria;

    @Schema(description = "Puntos por empate", example = "1")
    private Integer puntosEmpate;

    @Schema(description = "Puntos por derrota", example = "0")
    private Integer puntosDerrota;

    @Schema(description = "Formato de partidos: 4_SETS, 5_SETS", example = "4_SETS")
    private String formatoPartidos;

    @Schema(description = "Días disponibles (L, M, X, J, V, S, D)")
    private List<String> diasDisponibles;

    @Schema(description = "Hora de inicio (HH:mm)", example = "16:00")
    private String horaInicio;

    @Schema(description = "Hora de fin (HH:mm)", example = "22:00")
    private String horaFin;

    @Schema(description = "Duración del partido en minutos", example = "45")
    private Integer duracionPartido;

    @Schema(description = "Fechas excluidas")
    private List<String> fechasExcluidas;

    @Schema(description = "Estrategia de distribución: JORNADAS, RAPIDO", example = "JORNADAS")
    private String estrategiaDistribucion;

    @Schema(description = "Días de separación entre jornadas (solo para estrategia JORNADAS)", example = "7")
    private Integer diasEntreJornadas;

    public ActualizarTorneoParamsDto() {
    }

    // Getters y setters

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }

    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }

    public String getFechaLimiteInscripcion() { return fechaLimiteInscripcion; }
    public void setFechaLimiteInscripcion(String fechaLimiteInscripcion) { this.fechaLimiteInscripcion = fechaLimiteInscripcion; }

    public Integer getPuntosVictoria() { return puntosVictoria; }
    public void setPuntosVictoria(Integer puntosVictoria) { this.puntosVictoria = puntosVictoria; }

    public Integer getPuntosEmpate() { return puntosEmpate; }
    public void setPuntosEmpate(Integer puntosEmpate) { this.puntosEmpate = puntosEmpate; }

    public Integer getPuntosDerrota() { return puntosDerrota; }
    public void setPuntosDerrota(Integer puntosDerrota) { this.puntosDerrota = puntosDerrota; }

    public String getFormatoPartidos() { return formatoPartidos; }
    public void setFormatoPartidos(String formatoPartidos) { this.formatoPartidos = formatoPartidos; }

    public List<String> getDiasDisponibles() { return diasDisponibles; }
    public void setDiasDisponibles(List<String> diasDisponibles) { this.diasDisponibles = diasDisponibles; }

    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }

    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }

    public Integer getDuracionPartido() { return duracionPartido; }
    public void setDuracionPartido(Integer duracionPartido) { this.duracionPartido = duracionPartido; }

    public List<String> getFechasExcluidas() { return fechasExcluidas; }
    public void setFechasExcluidas(List<String> fechasExcluidas) { this.fechasExcluidas = fechasExcluidas; }

    public String getEstrategiaDistribucion() { return estrategiaDistribucion; }
    public void setEstrategiaDistribucion(String estrategiaDistribucion) { this.estrategiaDistribucion = estrategiaDistribucion; }

    public Integer getDiasEntreJornadas() { return diasEntreJornadas; }
    public void setDiasEntreJornadas(Integer diasEntreJornadas) { this.diasEntreJornadas = diasEntreJornadas; }
}
