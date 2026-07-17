package es.udc.agon.backend.rest.controllers;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.rest.dtos.*;

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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@Tag(name = "Equipo Controller", description = "Endpoints para la creación, disolución, abandono de equipos y gestión del flujo híbrido de solicitudes de unión (Propuestas y Peticiones)")
@SecurityRequirement(name = "bearerAuth")
public class EquipoController {

    @Autowired
    private EquipoService equipoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Crear un nuevo equipo",
            description = "Registra un equipo en el sistema y asigna al usuario autenticado como su creador y administrador."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Equipo creado con éxito",
                    content = @Content(schema = @Schema(implementation = EquipoDto.class))),
            @ApiResponse(responseCode = "400", description = "Nombre del equipo vacío o formato incorrecto",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado (Token JWT faltante o inválido)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario creador no encontrado",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "El nombre del equipo ya está en uso",
                    content = @Content)
    })
    public EquipoDto crearEquipo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Validated @RequestBody CrearEquipoParamsDto params)
            throws InstanceNotFoundException {
        Equipo equipo = equipoService.crearEquipo(userId, params.getNombreEquipo());
        return EquipoConversor.toEquipoDto(equipo);
    }

    @PostMapping("/{id}/propuestas")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Proponer unirse a un miembro (Invitación proactiva)",
            description = "Envía una propuesta de unión a un jugador específico. Solo puede realizarlo el creador del equipo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Propuesta de unión generada correctamente",
                    content = @Content(schema = @Schema(implementation = SolicitudDto.class))),
            @ApiResponse(responseCode = "400", description = "La propuesta no es válida (ej. el equipo está lleno, el usuario ya tiene solicitudes activas)",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Solo el creador del equipo tiene permisos para proponer unión",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Equipo o jugador no encontrado",
                    content = @Content)
    })
    public SolicitudDto crearPropuestaDeUnion(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del equipo al cual invitar", example = "1") @PathVariable Long id,
            @Parameter(description = "ID del jugador invitado", example = "87") @RequestParam Long jugadorId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        Solicitud solicitud = equipoService.crearPropuestaDeUnion(userId, id, jugadorId);
        return EquipoConversor.toSolicitudDto(solicitud);
    }

    @PostMapping("/peticiones")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Solicitar unirse a un equipo mediante código alfanumérico",
            description = "Permite a un usuario autenticado enviar una petición de entrada utilizando el código de acceso único de 8 caracteres de un equipo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Petición de unión enviada al creador correctamente",
                    content = @Content(schema = @Schema(implementation = SolicitudDto.class))),
            @ApiResponse(responseCode = "400", description = "La petición no es válida (ej. ya formas parte del equipo o ya tienes una petición pendiente)",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "El código de equipo no corresponde a ningún equipo activo",
                    content = @Content)
    })
    public SolicitudDto crearPeticionDeUnion(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "Código de invitación único del equipo (8 caracteres alfanuméricos)", example = "a7K9pX2L")
            @RequestParam(name = "codigoEquipo", required = true) String codigoEquipo)
            throws InstanceNotFoundException, IllegalArgumentException {
        Solicitud solicitud = equipoService.crearPeticionDeUnion(userId, codigoEquipo);
        return EquipoConversor.toSolicitudDto(solicitud);
    }

    @PostMapping("/solicitudes/{solicitudId}/responder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Responder a una solicitud (PROPUESTA o PETICION)",
            description = "Permite al decisor (el jugador en caso de propuesta, o el creador en caso de petición) aceptar o rechazar la solicitud de unión."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Solicitud respondida y procesada correctamente"),
            @ApiResponse(responseCode = "400", description = "Petición incorrecta o lógica de negocio inválida (ej. equipo lleno)",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "No eres el decisor autorizado para responder a esta solicitud",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada",
                    content = @Content)
    })
    public void responderSolicitud(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID de la solicitud a responder", example = "101") @PathVariable Long solicitudId,
            @Validated @RequestBody ResponderSolicitudParamsDto params)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        equipoService.responderSolicitud(userId, solicitudId, params.getAceptar());
    }

    @PostMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Abandonar el equipo",
            description = "Permite a un miembro abandonar un equipo del que forma parte actualmente."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Equipo abandonado con éxito"),
            @ApiResponse(responseCode = "400", description = "Lógica de negocio inválida (ej. el creador no puede abandonar sin disolver)",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "El usuario no forma parte de este equipo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado",
                    content = @Content)
    })
    public void abandonarEquipo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del equipo a abandonar", example = "1") @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        equipoService.abandonarEquipo(userId, id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Eliminar un equipo",
            description = "Elimina físicamente un equipo del sistema. Solo el creador tiene autorización."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Equipo eliminado con éxito"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para eliminar este equipo"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    })
    public void eliminarEquipo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del equipo a eliminar", example = "1") @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException {
        equipoService.eliminarEquipo(userId, id);
    }

    @GetMapping
    @Operation(
            summary = "Listar equipos del usuario",
            description = "Recupera los equipos a los que pertenece o ha pertenecido el usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de equipos recuperada con éxito",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = EquipoDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public List<EquipoDto> obtenerEquipos(
            @Parameter(hidden = true) @RequestAttribute Long userId) {
        return EquipoConversor.toEquipoDtos(equipoService.obtenerEquiposDeUsuario(userId));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener detalles de un equipo",
            description = "Recupera la información completa de un equipo específico, incluyendo sus miembros y solicitudes activas. Solo los miembros del equipo pueden acceder a esta información."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Detalles del equipo recuperados con éxito",
                content = @Content(schema = @Schema(implementation = EquipoDto.class))),
        @ApiResponse(responseCode = "401", description = "No autorizado",
                content = @Content),
        @ApiResponse(responseCode = "403", description = "El usuario no es miembro de este equipo",
                content = @Content),
        @ApiResponse(responseCode = "404", description = "Equipo no encontrado",
                content = @Content)
    })
    public EquipoDto obtenerEquipo(
        @Parameter(hidden = true) @RequestAttribute Long userId,
        @Parameter(description = "ID del equipo", example = "1") @PathVariable Long id)
        throws InstanceNotFoundException, PermissionException {
    
        Equipo equipo = equipoService.obtenerEquipo(id);
    
        boolean esMiembro = equipo.getMiembros().stream()
            .anyMatch(u -> u.getId().equals(userId));
    
        if (!esMiembro) {
            throw new PermissionException();
        }
    
        return EquipoConversor.toEquipoDto(equipo);
    }
}