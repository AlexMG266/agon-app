package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Parámetros para la creación de un torneo")
public class CrearTorneoParamsDto {

    @Schema(description = "Nombre del torneo", example = "Copa de Primavera", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @Schema(description = "Fecha de inicio (yyyy-MM-dd)", example = "2026-03-01")
    private String fechaInicio;

    @Schema(description = "Fecha límite de inscripción (yyyy-MM-dd)", example = "2026-02-20")
    private String fechaLimiteInscripcion;

    @Schema(description = "Puntos por victoria", example = "3")
    private int puntosVictoria;

    @Schema(description = "Puntos por empate", example = "1")
    private int puntosEmpate;

    @Schema(description = "Puntos por derrota", example = "0")
    private int puntosDerrota;

    @Schema(description = "Formato de partidos: 4_SETS, 5_SETS", example = "4_SETS")
    private String formatoPartidos;

    @Schema(description = "Criterio de desempate", example = "PUNTOS")
    private String criterioDesempate;

    @Schema(description = "Días disponibles (L, M, X, J, V, S, D)")
    private List<String> diasDisponibles;

    @Schema(description = "Hora de inicio (HH:mm)", example = "16:00")
    private String horaInicio;

    @Schema(description = "Hora de fin (HH:mm)", example = "22:00")
    private String horaFin;

    @Schema(description = "Duración del partido en minutos", example = "45")
    private int duracionPartido;

    @Schema(description = "Fechas excluidas")
    private List<String> fechasExcluidas;

    @Schema(description = "Estrategia de distribución: JORNADAS, UNIFORME, RAPIDO", example = "JORNADAS")
    private String estrategiaDistribucion;

    @Schema(description = "Días de separación entre jornadas (solo para estrategia JORNADAS)", example = "7")
    private Integer diasEntreJornadas;

    @Schema(description = "Indica si el torneo es privado (requiere código para inscribirse)", example = "false")
    private Boolean privado;

    public CrearTorneoParamsDto() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(String fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public String getFechaLimiteInscripcion() {
        return fechaLimiteInscripcion;
    }

    public void setFechaLimiteInscripcion(String fechaLimiteInscripcion) {
        this.fechaLimiteInscripcion = fechaLimiteInscripcion;
    }

    public int getPuntosVictoria() {
        return puntosVictoria;
    }

    public void setPuntosVictoria(int puntosVictoria) {
        this.puntosVictoria = puntosVictoria;
    }

    public int getPuntosEmpate() {
        return puntosEmpate;
    }

    public void setPuntosEmpate(int puntosEmpate) {
        this.puntosEmpate = puntosEmpate;
    }

    public int getPuntosDerrota() {
        return puntosDerrota;
    }

    public void setPuntosDerrota(int puntosDerrota) {
        this.puntosDerrota = puntosDerrota;
    }

    public String getFormatoPartidos() {
        return formatoPartidos;
    }

    public void setFormatoPartidos(String formatoPartidos) {
        this.formatoPartidos = formatoPartidos;
    }

    public String getCriterioDesempate() {
        return criterioDesempate;
    }

    public void setCriterioDesempate(String criterioDesempate) {
        this.criterioDesempate = criterioDesempate;
    }

    public List<String> getDiasDisponibles() {
        return diasDisponibles;
    }

    public void setDiasDisponibles(List<String> diasDisponibles) {
        this.diasDisponibles = diasDisponibles;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public int getDuracionPartido() {
        return duracionPartido;
    }

    public void setDuracionPartido(int duracionPartido) {
        this.duracionPartido = duracionPartido;
    }

    public List<String> getFechasExcluidas() {
        return fechasExcluidas;
    }

    public void setFechasExcluidas(List<String> fechasExcluidas) {
        this.fechasExcluidas = fechasExcluidas;
    }

    public String getEstrategiaDistribucion() {
        return estrategiaDistribucion;
    }

    public void setEstrategiaDistribucion(String estrategiaDistribucion) {
        this.estrategiaDistribucion = estrategiaDistribucion;
    }

    public Integer getDiasEntreJornadas() {
        return diasEntreJornadas;
    }

    public void setDiasEntreJornadas(Integer diasEntreJornadas) {
        this.diasEntreJornadas = diasEntreJornadas;
    }

    public Boolean getPrivado() {
        return privado;
    }

    public void setPrivado(Boolean privado) {
        this.privado = privado;
    }
}
