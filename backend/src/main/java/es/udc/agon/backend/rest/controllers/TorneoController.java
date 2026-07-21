package es.udc.agon.backend.rest.controllers;

import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.services.TorneoService;
import es.udc.agon.backend.rest.dtos.ConfigurarEstructuraParamsDto;
import es.udc.agon.backend.rest.dtos.CrearTorneoParamsDto;
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

import java.util.List;

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

        Torneo savedTorneo = torneoService.crearTorneo(userId, torneo);
        return TorneoConversor.toTorneoDto(savedTorneo);
    }

    @PostMapping("/{id}/configure")
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
                params.getTipoTorneo(),
                params.getNumGrupos(),
                params.getEquiposPorGrupo(),
                params.isTienePlayoff(),
                params.isIdaVueltaPlayoff()
        );
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

    @GetMapping
    @Operation(
            summary = "Listar todos los torneos",
            description = "Recupera todos los torneos del sistema (opcionalmente filtrados por nombre)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de torneos recuperada con éxito",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TorneoDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public List<TorneoDto> obtenerTorneos(
            @Parameter(hidden = true) @RequestAttribute Long userId) {
        List<Torneo> torneos = torneoService.buscarTorneos(null);
        return TorneoConversor.toTorneoDtos(torneos);
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

    @GetMapping("/search")
    @Operation(
            summary = "Buscar torneos por nombre",
            description = "Busca torneos cuyo nombre contenga el filtro proporcionado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resultados de la búsqueda",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TorneoDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public List<TorneoDto> buscarTorneos(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "Filtro de búsqueda por nombre", example = "Copa")
            @RequestParam(required = false) String filtro) {

        List<Torneo> torneos = torneoService.buscarTorneos(filtro);
        return TorneoConversor.toTorneoDtos(torneos);
    }
}
