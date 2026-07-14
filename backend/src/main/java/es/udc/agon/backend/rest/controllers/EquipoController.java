package es.udc.agon.backend.rest.controllers;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Invitacion;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.rest.dtos.*;

// Imports de OpenAPI Swagger
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
@Tag(name = "Equipo Controller", description = "Endpoints para la creación, disolución, abandono de equipos y gestión del flujo de invitaciones de miembros")
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

    @PostMapping("/{id}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Invitar un miembro al equipo",
            description = "Envía una solicitud de unión de equipo a un jugador destino. Solo puede realizarlo el creador del equipo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Invitación generada correctamente",
                    content = @Content(schema = @Schema(implementation = InvitacionDto.class))),
            @ApiResponse(responseCode = "400", description = "La invitación no es válida (ej. el equipo ya está lleno, el usuario destino ya pertenece a un equipo o tiene invitaciones pendientes)",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Solo el creador del equipo tiene permisos para invitar",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Equipo o jugador destino no encontrado",
                    content = @Content)
    })
    public InvitacionDto invitarMiembro(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del equipo al cual invitar", example = "1") @PathVariable Long id,
            @Parameter(description = "ID del usuario invitado", example = "87") @RequestParam Long destinoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        Invitacion invitacion = equipoService.invitarMiembro(userId, id, destinoId);
        return EquipoConversor.toInvitacionDto(invitacion);
    }

    @PostMapping("/invitations/{invitacionId}/respond")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Responder a una invitación recibida",
            description = "Acepta o rechaza la invitación de un equipo asociada al ID provisto."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Invitación respondida y procesada correctamente (Sin contenido de retorno)"),
            @ApiResponse(responseCode = "400", description = "Petición incorrecta o parámetros inválidos",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Intento de responder a una invitación dirigida a otro usuario",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Invitación no encontrada",
                    content = @Content)
    })
    public void responderInvitacion(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID de la invitación a responder", example = "101") @PathVariable Long invitacionId,
            @Validated @RequestBody ResponderInvitacionParamsDto params)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        equipoService.responderInvitacion(userId, invitacionId, params.getAceptar());
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

    @PostMapping("/{id}/disband")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Disolver el equipo",
            description = "Disuelve de forma permanente un equipo. Solo el creador tiene autorización para ejecutar esta acción."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Equipo disuelto con éxito"),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de creador para disolver este equipo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado",
                    content = @Content)
    })
    public void disolverEquipo(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del equipo a disolver", example = "1") @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException {
        equipoService.disolverEquipo(userId, id);
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
}