package es.udc.agon.backend.model.services;

import java.util.List;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

public interface NotificationService {

    /**
     *
     * @param user
     */
    void createWelcomeNotification(User user);

    /**
     *
     * @param userId
     * @return notificaciones del usuario con id userId
     * @throws InstanceNotFoundException
     */
    List<Notification> getNotifications(Long userId) throws InstanceNotFoundException;

    /**
     *
     * @param userId
     * @param notificationId
     * @return notificacion con id notificationId del usuario con id userId
     * @throws InstanceNotFoundException
     * @throws PermissionException
     */
    Notification getNotification(Long userId, Long notificationId)
            throws InstanceNotFoundException, PermissionException;

    /**
     *
     * @param userId
     * @param notificationId
     * @return notificacion con id notificationId del usuario con id userId marcada como leida
     * @throws InstanceNotFoundException
     * @throws PermissionException
     */
    Notification markAsRead(Long userId, Long notificationId)
            throws InstanceNotFoundException, PermissionException;
}
