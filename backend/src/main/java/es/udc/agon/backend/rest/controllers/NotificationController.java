package es.udc.agon.backend.rest.controllers;

import java.util.List;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.NotificationService;
import es.udc.agon.backend.rest.dtos.NotificationConversor;
import es.udc.agon.backend.rest.dtos.NotificationDto;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notification Controller", description = "Endpoints para la gestión, consulta y actualización de notificaciones del usuario")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(
            summary = "Obtener todas las notificaciones del usuario",
            description = "Recupera la lista completa de notificaciones asociadas al usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de notificaciones obtenida con éxito",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = NotificationDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado (Token JWT faltante o inválido)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario autenticado no encontrado en el sistema",
                    content = @Content)
    })
    public List<NotificationDto> getNotifications(
            @Parameter(hidden = true) @RequestAttribute Long userId) throws InstanceNotFoundException {
        return NotificationConversor.toNotificationDtos(notificationService.getNotifications(userId));
    }

    @GetMapping("/{notificationId}")
    @Operation(
            summary = "Obtener una notificación específica",
            description = "Recupera los detalles de una notificación concreta validando que pertenezca al usuario solicitante."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notificación recuperada con éxito",
                    content = @Content(schema = @Schema(implementation = NotificationDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Fallo de permisos (La notificación no pertenece al usuario)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Notificación o usuario no encontrado",
                    content = @Content)
    })
    public NotificationDto getNotification(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID de la notificación a consultar", example = "204") @PathVariable Long notificationId)
            throws InstanceNotFoundException, PermissionException {
        return NotificationConversor.toNotificationDto(
                notificationService.getNotification(userId, notificationId));
    }

    @PutMapping("/{notificationId}")
    @Operation(
            summary = "Marcar una notificación como leída",
            description = "Actualiza el estado de la notificación a 'leída' y la devuelve actualizada."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notificación marcada como leída exitosamente",
                    content = @Content(schema = @Schema(implementation = NotificationDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Fallo de permisos (Intento de modificar notificación ajena)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Notificación no encontrada",
                    content = @Content)
    })
    public NotificationDto markAsRead(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID de la notificación a actualizar", example = "204") @PathVariable Long notificationId)
            throws InstanceNotFoundException, PermissionException {
        return NotificationConversor.toNotificationDto(
                notificationService.markAsRead(userId, notificationId));
    }
}