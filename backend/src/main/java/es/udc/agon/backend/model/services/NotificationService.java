package es.udc.agon.backend.model.services;

import java.util.List;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

public interface NotificationService {

    List<Notification> getNotifications(Long userId) throws InstanceNotFoundException;

    Notification getNotification(Long userId, Long notificationId)
            throws InstanceNotFoundException, PermissionException;

    Notification markAsRead(Long userId, Long notificationId)
            throws InstanceNotFoundException, PermissionException;

}
