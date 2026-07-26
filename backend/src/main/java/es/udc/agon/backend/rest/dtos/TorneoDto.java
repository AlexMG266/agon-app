package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "DTO que representa un torneo")
public class TorneoDto {

    @Schema(description = "ID único del torneo", example = "1")
    private Long id;

    @Schema(description = "Nombre del torneo", example = "Copa de Primavera")
    private String nombre;

    @Schema(description = "Número de grupos", example = "4")
    private int numGrupos;

    @Schema(description = "Equipos por grupo", example = "4")
    private int equiposPorGrupo;

    @Schema(description = "Si tiene playoff después de fase de grupos", example = "true")
    private boolean tienePlayoff;

    @Schema(description = "Estado del torneo", example = "RECLUTANDO")
    private String estado;

    @Schema(description = "ID del usuario organizador", example = "1")
    private Long organizadorId;

    @Schema(description = "Nombre del organizador", example = "admin")
    private String organizadorNombre;

    @Schema(description = "Tipo de torneo: LIGA_UNICA, GRUPOS_PLAYOFF, ELIMINATORIAS", example = "GRUPOS_PLAYOFF")
    private String tipoTorneo;

    @Schema(description = "Partidos de ida y vuelta en playoffs", example = "false")
    private boolean idaVueltaPlayoff;

    @Schema(description = "Número de equipos inscritos en el torneo", example = "8")
    private int numEquiposInscritos;

    @Schema(description = "Indica si el torneo es privado (requiere código para inscribirse)", example = "false")
    private boolean privado;

    @Schema(description = "Código único del torneo para compartir", example = "T22-K9M8")
    private String codigoTorneo;

    @Schema(description = "Lista de inscripciones del torneo")
    private List<InscripcionDto> inscripciones;

    // === Nuevos campos ===
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalDate fechaLimiteInscripcion;
    private Integer puntosVictoria;
    private Integer puntosEmpate;
    private Integer puntosDerrota;
    private String formatoPartidos;
    private String criterioDesempate;
    private List<String> diasDisponibles;
    private String horaInicio;
    private String horaFin;
    private Integer duracionPartido;
    private List<String> fechasExcluidas;
    private String estrategiaDistribucion;
    private Integer diasEntreJornadas;
    private String estrategiaPlayoff;
    private Integer diasEntrePlayoff;

    public TorneoDto() {
    }

    public TorneoDto(Long id, String nombre, int numGrupos, int equiposPorGrupo,
                     boolean tienePlayoff, String estado, Long organizadorId,
                     String organizadorNombre, String tipoTorneo, boolean idaVueltaPlayoff,
                     int numEquiposInscritos, boolean privado, String codigoTorneo,
                     List<InscripcionDto> inscripciones,
                     LocalDate fechaInicio, LocalDate fechaFin, LocalDate fechaLimiteInscripcion,
                     Integer puntosVictoria, Integer puntosEmpate, Integer puntosDerrota,
                     String formatoPartidos, String criterioDesempate, List<String> diasDisponibles,
                     String horaInicio, String horaFin, Integer duracionPartido,
                     List<String> fechasExcluidas, String estrategiaDistribucion,
                     Integer diasEntreJornadas, String estrategiaPlayoff,
                     Integer diasEntrePlayoff) {
        this.id = id;
        this.nombre = nombre;
        this.numGrupos = numGrupos;
        this.equiposPorGrupo = equiposPorGrupo;
        this.tienePlayoff = tienePlayoff;
        this.estado = estado;
        this.organizadorId = organizadorId;
        this.organizadorNombre = organizadorNombre;
        this.tipoTorneo = tipoTorneo;
        this.idaVueltaPlayoff = idaVueltaPlayoff;
        this.numEquiposInscritos = numEquiposInscritos;
        this.privado = privado;
        this.codigoTorneo = codigoTorneo;
        this.inscripciones = inscripciones;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.fechaLimiteInscripcion = fechaLimiteInscripcion;
        this.puntosVictoria = puntosVictoria;
        this.puntosEmpate = puntosEmpate;
        this.puntosDerrota = puntosDerrota;
        this.formatoPartidos = formatoPartidos;
        this.criterioDesempate = criterioDesempate;
        this.diasDisponibles = diasDisponibles;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.duracionPartido = duracionPartido;
        this.fechasExcluidas = fechasExcluidas;
        this.estrategiaDistribucion = estrategiaDistribucion;
        this.diasEntreJornadas = diasEntreJornadas;
        this.estrategiaPlayoff = estrategiaPlayoff;
        this.diasEntrePlayoff = diasEntrePlayoff;
    }

    // Getters y setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public int getNumGrupos() { return numGrupos; }
    public void setNumGrupos(int numGrupos) { this.numGrupos = numGrupos; }

    public int getEquiposPorGrupo() { return equiposPorGrupo; }
    public void setEquiposPorGrupo(int equiposPorGrupo) { this.equiposPorGrupo = equiposPorGrupo; }

    public boolean isTienePlayoff() { return tienePlayoff; }
    public void setTienePlayoff(boolean tienePlayoff) { this.tienePlayoff = tienePlayoff; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Long getOrganizadorId() { return organizadorId; }
    public void setOrganizadorId(Long organizadorId) { this.organizadorId = organizadorId; }

    public String getOrganizadorNombre() { return organizadorNombre; }
    public void setOrganizadorNombre(String organizadorNombre) { this.organizadorNombre = organizadorNombre; }

    public String getTipoTorneo() { return tipoTorneo; }
    public void setTipoTorneo(String tipoTorneo) { this.tipoTorneo = tipoTorneo; }

    public boolean isIdaVueltaPlayoff() { return idaVueltaPlayoff; }
    public void setIdaVueltaPlayoff(boolean idaVueltaPlayoff) { this.idaVueltaPlayoff = idaVueltaPlayoff; }

    public int getNumEquiposInscritos() { return numEquiposInscritos; }
    public void setNumEquiposInscritos(int numEquiposInscritos) { this.numEquiposInscritos = numEquiposInscritos; }

    public boolean isPrivado() { return privado; }
    public void setPrivado(boolean privado) { this.privado = privado; }

    public String getCodigoTorneo() { return codigoTorneo; }
    public void setCodigoTorneo(String codigoTorneo) { this.codigoTorneo = codigoTorneo; }

    public List<InscripcionDto> getInscripciones() { return inscripciones; }
    public void setInscripciones(List<InscripcionDto> inscripciones) { this.inscripciones = inscripciones; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public LocalDate getFechaLimiteInscripcion() { return fechaLimiteInscripcion; }
    public void setFechaLimiteInscripcion(LocalDate fechaLimiteInscripcion) { this.fechaLimiteInscripcion = fechaLimiteInscripcion; }

    public Integer getPuntosVictoria() { return puntosVictoria; }
    public void setPuntosVictoria(Integer puntosVictoria) { this.puntosVictoria = puntosVictoria; }

    public Integer getPuntosEmpate() { return puntosEmpate; }
    public void setPuntosEmpate(Integer puntosEmpate) { this.puntosEmpate = puntosEmpate; }

    public Integer getPuntosDerrota() { return puntosDerrota; }
    public void setPuntosDerrota(Integer puntosDerrota) { this.puntosDerrota = puntosDerrota; }

    public String getFormatoPartidos() { return formatoPartidos; }
    public void setFormatoPartidos(String formatoPartidos) { this.formatoPartidos = formatoPartidos; }

    public String getCriterioDesempate() { return criterioDesempate; }
    public void setCriterioDesempate(String criterioDesempate) { this.criterioDesempate = criterioDesempate; }

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

    public String getEstrategiaPlayoff() { return estrategiaPlayoff; }
    public void setEstrategiaPlayoff(String estrategiaPlayoff) { this.estrategiaPlayoff = estrategiaPlayoff; }

    public Integer getDiasEntrePlayoff() { return diasEntrePlayoff; }
    public void setDiasEntrePlayoff(Integer diasEntrePlayoff) { this.diasEntrePlayoff = diasEntrePlayoff; }
}
