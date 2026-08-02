package es.udc.agon.backend.rest.dtos;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.services.Block;

public class NotificationConversor {

    private NotificationConversor() {
    }

    public final static NotificationDto toNotificationDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getAsunto(),
                notification.getCuerpo(),
                notification.isLeido(),
                notification.isPendienteDeAccion(),
                notification.getReferenciaId(),
                notification.getTipo().name(),
                notification.getFechaCreacion().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
    }

    public final static List<NotificationDto> toNotificationDtos(List<Notification> notifications) {
        return notifications.stream().map(NotificationConversor::toNotificationDto).collect(Collectors.toList());
    }

    public final static BlockDto<NotificationDto> toBlockNotificationDtos(Block<Notification> block) {
        List<NotificationDto> dtos = block.getItems().stream()
                .map(NotificationConversor::toNotificationDto)
                .collect(Collectors.toList());
        return new BlockDto<>(dtos, block.getExistMoreItems());
    }

}
