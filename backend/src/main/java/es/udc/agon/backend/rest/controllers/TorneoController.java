package es.udc.agon.backend.rest.controllers;

import es.udc.agon.backend.model.entities.EstrategiaDistribucion;
import es.udc.agon.backend.model.entities.EstrategiaPlayoff;
import es.udc.agon.backend.model.entities.RondaPlayoff;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.TipoTorneo;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.Block;
import es.udc.agon.backend.model.services.TorneoService;
import es.udc.agon.backend.rest.dtos.ActualizarEstadoTorneoParamsDto;
import es.udc.agon.backend.rest.dtos.ActualizarInscripcionParamsDto;
import es.udc.agon.backend.rest.dtos.ActualizarTorneoParamsDto;
import es.udc.agon.backend.rest.dtos.BlockDto;
import es.udc.agon.backend.rest.dtos.ConfigurarEstructuraParamsDto;
import es.udc.agon.backend.rest.dtos.CrearTorneoParamsDto;
import es.udc.agon.backend.rest.dtos.InscribirEquipoParamsDto;
import es.udc.agon.backend.rest.dtos.JornadaDto;
import es.udc.agon.backend.rest.dtos.SolicitudDto;
import es.udc.agon.backend.rest.dtos.TorneoConversor;
import es.udc.agon.backend.rest.dtos.TorneoDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tournaments")
@Tag(name = "Torneo Controller", description = "Endpoints para la gestión de torneos (creación, consulta, búsqueda)")
@SecurityRequirement(name = "bearerAuth")
public class TorneoController {

    @Autowired
    private TorneoService torneoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Crear un nuevo torneo",
            description = "Registra un torneo en el sistema con los datos básicos (sin estructura de grupos)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Torneo creado con éxito",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "400", description = "Datos del torneo inválidos",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado (Token JWT faltante o inválido)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario organizador no encontrado",
                    content = @Content)
    })
    public TorneoDto crearTorneo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @RequestBody CrearTorneoParamsDto params)
            throws InstanceNotFoundException {

        Torneo torneo = new Torneo();
        torneo.setNombre(params.getNombre());
        torneo.setFechaInicio(params.getFechaInicio() != null ? LocalDate.parse(params.getFechaInicio()) : null);
        torneo.setFechaLimiteInscripcion(params.getFechaLimiteInscripcion() != null ? LocalDate.parse(params.getFechaLimiteInscripcion()) : null);
        torneo.setPuntosVictoria(params.getPuntosVictoria());
        torneo.setPuntosEmpate(params.getPuntosEmpate());
        torneo.setPuntosDerrota(params.getPuntosDerrota());
        torneo.setFormatoPartidos(params.getFormatoPartidos());
        if (params.getDiasDisponibles() != null) {
            torneo.setDiasDisponibles(String.join(",", params.getDiasDisponibles()));
        }
        torneo.setHoraInicio(params.getHoraInicio());
        torneo.setHoraFin(params.getHoraFin());
        torneo.setDuracionPartido(params.getDuracionPartido());
        if (params.getFechasExcluidas() != null) {
            torneo.setFechasExcluidas(String.join(",", params.getFechasExcluidas()));
        }
        String estrDistribucion = "UNIFORME".equals(params.getEstrategiaDistribucion())
                ? "RAPIDO" : params.getEstrategiaDistribucion();
        torneo.setEstrategiaDistribucion(estrDistribucion != null
                ? EstrategiaDistribucion.valueOf(estrDistribucion) : null);
        torneo.setDiasEntreJornadas(params.getDiasEntreJornadas());

        Torneo savedTorneo = torneoService.crearTorneo(userId, torneo, params.getPrivado());
        return TorneoConversor.toTorneoDto(savedTorneo);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Actualizar datos editables de un torneo",
            description = "Permite al organizador modificar los datos básicos del torneo (nombre, fechas, reglas, calendario, etc.). Solo el organizador puede hacerlo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Torneo actualizado con éxito",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "El usuario no es el organizador del torneo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado",
                    content = @Content)
    })
    public TorneoDto actualizarTorneo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id,
            @RequestBody ActualizarTorneoParamsDto params)
            throws InstanceNotFoundException, PermissionException {

        Torneo datos = new Torneo();
        datos.setNombre(params.getNombre());
        datos.setFechaInicio(params.getFechaInicio() != null ? LocalDate.parse(params.getFechaInicio()) : null);
        datos.setFechaFin(params.getFechaFin() != null ? LocalDate.parse(params.getFechaFin()) : null);
        datos.setFechaLimiteInscripcion(params.getFechaLimiteInscripcion() != null ? LocalDate.parse(params.getFechaLimiteInscripcion()) : null);
        datos.setPuntosVictoria(params.getPuntosVictoria());
        datos.setPuntosEmpate(params.getPuntosEmpate());
        datos.setPuntosDerrota(params.getPuntosDerrota());
        datos.setFormatoPartidos(params.getFormatoPartidos());
        if (params.getDiasDisponibles() != null) {
            datos.setDiasDisponibles(String.join(",", params.getDiasDisponibles()));
        }
        datos.setHoraInicio(params.getHoraInicio());
        datos.setHoraFin(params.getHoraFin());
        datos.setDuracionPartido(params.getDuracionPartido());
        if (params.getFechasExcluidas() != null) {
            datos.setFechasExcluidas(String.join(",", params.getFechasExcluidas()));
        }
        String estrDistribucion = "UNIFORME".equals(params.getEstrategiaDistribucion())
                ? "RAPIDO" : params.getEstrategiaDistribucion();
        datos.setEstrategiaDistribucion(estrDistribucion != null
                ? EstrategiaDistribucion.valueOf(estrDistribucion) : null);
        datos.setDiasEntreJornadas(params.getDiasEntreJornadas());

        Torneo torneo = torneoService.actualizarTorneo(userId, id, datos);
        return TorneoConversor.toTorneoDto(torneo);
    }

    @PatchMapping("/{id}/estructura")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Configurar estructura del torneo y generar calendario",
            description = "Tras cerrar inscripciones, configura el tipo de torneo, grupos, playoff y genera el calendario automáticamente."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estructura configurada y calendario generado",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "400", description = "El torneo no está en estado INSCRIPCION_CERRADA o datos inválidos",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado",
                    content = @Content)
    })
    public TorneoDto configurarEstructura(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id,
            @RequestBody ConfigurarEstructuraParamsDto params)
            throws InstanceNotFoundException {

        Torneo torneo = torneoService.configurarEstructuraYGenerarCalendario(
                id,
                params.getTipoTorneo() != null ? TipoTorneo.valueOf(params.getTipoTorneo()) : null,
                params.getNumGrupos(),
                params.getEquiposPorGrupo(),
                params.isTienePlayoff(),
                params.isIdaVueltaPlayoff(),
                params.getEstrategiaPlayoff() != null
                        ? EstrategiaPlayoff.valueOf(params.getEstrategiaPlayoff()) : null,
                params.getDiasEntrePlayoff(),
                params.getFechaFin(),
                params.getRondaInicioPlayoff() != null
                        ? RondaPlayoff.valueOf(params.getRondaInicioPlayoff()) : null
        );
        return TorneoConversor.toTorneoDto(torneo);
    }

    @PostMapping("/{id}/inscripciones")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Solicitar inscripción de un equipo en el torneo",
            description = "Envía una solicitud de inscripción para un equipo en el torneo. " +
                    "El organizador deberá aprobarla. Solo el capitán del equipo puede solicitarlo. " +
                    "El torneo debe estar en estado RECLUTANDO."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud de inscripción enviada con éxito",
                    content = @Content(schema = @Schema(implementation = SolicitudDto.class))),
            @ApiResponse(responseCode = "400", description = "El torneo no está en RECLUTANDO, ya hay una solicitud pendiente, o el equipo ya está inscrito",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "El usuario no es el capitán del equipo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Torneo o equipo no encontrado",
                    content = @Content)
    })
    public SolicitudDto solicitarInscripcion(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id,
            @RequestBody InscribirEquipoParamsDto params)
            throws InstanceNotFoundException, PermissionException {

        Solicitud solicitud = torneoService.solicitarInscripcion(userId, id, params.getEquipoId(), params.getCodigoTorneo());
        return toSolicitudDto(solicitud);
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Cerrar inscripciones del torneo",
            description = "Cierra las inscripciones del torneo, cambiando su estado de RECLUTANDO a INSCRIPCION_CERRADA. " +
                    "Requiere al menos 2 equipos inscritos."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscripciones cerradas con éxito",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "400", description = "El torneo no está en estado RECLUTANDO o no hay suficientes equipos",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado",
                    content = @Content)
    })
    public TorneoDto actualizarEstadoTorneo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id,
            @RequestBody ActualizarEstadoTorneoParamsDto params)
            throws InstanceNotFoundException, IllegalArgumentException {

        if (!"INSCRIPCION_CERRADA".equals(params.getEstado())) {
            throw new IllegalArgumentException("Estado de torneo no soportado: " + params.getEstado());
        }
        torneoService.cerrarInscripciones(id);
        Torneo torneo = torneoService.consultarTorneo(id);
        return TorneoConversor.toTorneoDto(torneo);
    }

    @GetMapping("/my")
    @Operation(
            summary = "Listar torneos del usuario autenticado",
            description = "Recupera los torneos creados por el usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de torneos recuperada con éxito",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TorneoDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public List<TorneoDto> obtenerMisTorneos(
            @Parameter(hidden = true) @RequestAttribute Long userId) {
        List<Torneo> torneos = torneoService.obtenerTorneosOrganizador(userId);
        return TorneoConversor.toTorneoDtos(torneos);
    }

    @PutMapping("/{id}/seguidores/me")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Seguir un torneo",
            description = "Marca un torneo como seguido por el usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Torneo seguido con éxito"),
            @ApiResponse(responseCode = "400", description = "Ya sigues este torneo"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado")
    })
    public void seguirTorneo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id)
            throws InstanceNotFoundException {

        torneoService.seguirTorneo(userId, id);
    }

    @DeleteMapping("/{id}/seguidores/me")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Dejar de seguir un torneo",
            description = "Elimina el marcado de seguimiento de un torneo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dejaste de seguir el torneo"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public void dejarDeSeguirTorneo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id) {

        torneoService.dejarDeSeguirTorneo(userId, id);
    }

    @GetMapping("/followed")
    @Operation(
            summary = "Listar torneos seguidos",
            description = "Recupera los torneos que el usuario autenticado sigue."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de torneos seguidos",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TorneoDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public List<TorneoDto> obtenerTorneosSeguidos(
            @Parameter(hidden = true) @RequestAttribute Long userId) {
        List<Torneo> torneos = torneoService.obtenerTorneosSeguidos(userId);
        return TorneoConversor.toTorneoDtos(torneos);
    }

    @GetMapping("/enrolled")
    @Operation(
            summary = "Listar torneos inscritos",
            description = "Recupera los torneos en los que el usuario autenticado tiene equipos inscritos (como capitán o miembro)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de torneos inscritos",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TorneoDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public List<TorneoDto> obtenerTorneosInscritos(
            @Parameter(hidden = true) @RequestAttribute Long userId) {
        List<Torneo> torneos = torneoService.obtenerTorneosInscritos(userId);
        return TorneoConversor.toTorneoDtos(torneos);
    }

    @GetMapping
    @Operation(
            summary = "Listar todos los torneos (paginado)",
            description = "Recupera los torneos públicos del sistema con paginación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bloque de torneos recuperado con éxito",
                    content = @Content(schema = @Schema(implementation = BlockDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public BlockDto<TorneoDto> obtenerTorneos(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "Número de página (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filtro de estado: ALL, RECLUTANDO, EN_JUEGO, FINALIZADO", example = "ALL")
            @RequestParam(required = false, defaultValue = "ALL") String estado,
            @Parameter(description = "Filtro de búsqueda por nombre", example = "Copa")
            @RequestParam(required = false) String filtro) {
        Block<Torneo> block = torneoService.buscarTorneos(filtro, estado, page, size);
        return TorneoConversor.toBlockTorneoDtos(block);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener detalles de un torneo",
            description = "Recupera la información completa de un torneo específico por su ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Detalles del torneo recuperados con éxito",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado",
                    content = @Content)
    })
    public TorneoDto obtenerTorneo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id)
            throws InstanceNotFoundException {

        Torneo torneo = torneoService.consultarTorneo(id);
        return TorneoConversor.toTorneoDto(torneo);
    }

    @GetMapping("/by-code/{codigo}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Buscar torneo por código",
            description = "Busca un torneo por su código único (ej: T22-K9M8)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Torneo encontrado",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "No existe torneo con ese código",
                    content = @Content)
    })
    public TorneoDto buscarTorneoPorCodigo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "Código del torneo", example = "T22-K9M8") @PathVariable String codigo)
            throws InstanceNotFoundException {

        Torneo torneo = torneoService.buscarPorCodigo(codigo);
        return TorneoConversor.toTorneoDto(torneo);
    }

    @GetMapping("/{id}/inscripciones")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Obtener solicitudes de inscripción pendientes",
            description = "Recupera las solicitudes de inscripción pendientes para un torneo. " +
                    "Solo el organizador del torneo puede verlas."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes pendientes",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SolicitudDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public List<SolicitudDto> obtenerSolicitudesPendientes(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id) {

        List<Solicitud> solicitudes = torneoService.obtenerSolicitudesPendientes(id);
        return solicitudes.stream().map(this::toSolicitudDto).collect(Collectors.toList());
    }

    @PatchMapping("/{id}/inscripciones/{solicitudId}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Aprobar o rechazar una solicitud de inscripción",
            description = "Actualiza el estado de una solicitud de inscripción pendiente a APROBADA o RECHAZADA. " +
                    "Solo el organizador puede gestionar solicitudes."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud gestionada",
                    content = @Content(schema = @Schema(implementation = TorneoDto.class))),
            @ApiResponse(responseCode = "400", description = "Estado no soportado, la solicitud no está PENDIENTE o el torneo ya no está RECLUTANDO",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "El usuario no es el organizador del torneo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Solicitud o torneo no encontrado",
                    content = @Content)
    })
    public TorneoDto actualizarInscripcion(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del torneo", example = "1") @PathVariable Long id,
            @Parameter(description = "ID de la solicitud", example = "10") @PathVariable Long solicitudId,
            @RequestBody ActualizarInscripcionParamsDto params)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        if ("APROBADA".equals(params.getEstado())) {
            torneoService.aprobarInscripcion(userId, solicitudId);
        } else if ("RECHAZADA".equals(params.getEstado())) {
            torneoService.rechazarInscripcion(userId, solicitudId);
        } else {
            throw new IllegalArgumentException("Estado de inscripción no soportado: " + params.getEstado());
        }
        Torneo torneo = torneoService.consultarTorneo(id);
        return TorneoConversor.toTorneoDto(torneo);
    }

    @GetMapping("/{id}/jornadas")
    @ResponseStatus(HttpStatus.OK)
    public List<JornadaDto> obtenerJornadas(@PathVariable Long id) {
        return TorneoConversor.toJornadaDtos(torneoService.obtenerJornadas(id));
    }

    @GetMapping("/inscripciones/{solicitudId}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Obtener una solicitud de inscripción por su ID",
            description = "Devuelve los detalles de una solicitud de inscripción, incluyendo equipoId y torneoId."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud encontrada",
                    content = @Content(schema = @Schema(implementation = SolicitudDto.class))),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada",
                    content = @Content)
    })
    public SolicitudDto obtenerSolicitud(
            @Parameter(description = "ID de la solicitud", example = "10") @PathVariable Long solicitudId)
            throws InstanceNotFoundException {

        Solicitud solicitud = torneoService.obtenerSolicitud(solicitudId);
        return toSolicitudDto(solicitud);
    }

    private SolicitudDto toSolicitudDto(Solicitud solicitud) {
        String nombreCandidato = solicitud.getCandidato() != null ? solicitud.getCandidato().getNombre() : null;
        String nombreEquipo = solicitud.getEquipo() != null ? solicitud.getEquipo().getNombreEquipo() : null;
        long fecha = 0L;
        if (solicitud.getFechaCreacion() != null) {
            fecha = solicitud.getFechaCreacion().atZone(java.time.ZoneOffset.UTC).toInstant().toEpochMilli();
        }
        SolicitudDto dto = new SolicitudDto(
                solicitud.getId(),
                solicitud.getCandidato() != null ? solicitud.getCandidato().getId() : null,
                nombreCandidato,
                solicitud.getDecisor() != null ? solicitud.getDecisor().getId() : null,
                solicitud.getEquipo() != null ? solicitud.getEquipo().getId() : null,
                nombreEquipo,
                solicitud.getEstado().name(),
                solicitud.getTipoSolicitud().name(),
                fecha
        );
        if (solicitud.getTorneo() != null) {
            dto.setTorneoId(solicitud.getTorneo().getId());
        }
        return dto;
    }
}
