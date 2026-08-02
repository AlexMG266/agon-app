package es.udc.agon.backend.rest.controllers;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.Block;
import es.udc.agon.backend.model.services.NotificationService;
import es.udc.agon.backend.rest.dtos.BlockDto;
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
            summary = "Obtener las notificaciones del usuario (paginado)",
            description = "Recupera un bloque paginado de notificaciones asociadas al usuario autenticado, ordenadas por fecha descendente."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bloque de notificaciones obtenido con éxito",
                    content = @Content(schema = @Schema(implementation = BlockDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado (Token JWT faltante o inválido)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario autenticado no encontrado en el sistema",
                    content = @Content)
    })
    public BlockDto<NotificationDto> getNotifications(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "Número de página (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página", example = "10")
            @RequestParam(defaultValue = "10") int size) throws InstanceNotFoundException {
        Block<Notification> block = notificationService.getNotifications(userId, page, size);
        return NotificationConversor.toBlockNotificationDtos(block);
    }

    @GetMapping("/unread-count")
    @Operation(
            summary = "Obtener el número de notificaciones no leídas del usuario",
            description = "Recupera el contador de notificaciones no leídas asociadas al usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contador de no leídas obtenido con éxito",
                    content = @Content(schema = @Schema(example = "3"))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario autenticado no encontrado en el sistema",
                    content = @Content)
    })
    public long getUnreadCount(
            @Parameter(hidden = true) @RequestAttribute Long userId) throws InstanceNotFoundException {
        return notificationService.getUnreadCount(userId);
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