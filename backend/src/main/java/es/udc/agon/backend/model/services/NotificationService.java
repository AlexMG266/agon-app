package es.udc.agon.backend.model.services;

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
     * devuelve un bloque paginado de notificaciones del usuario con id userId
     * @param userId
     * @param page numero de pagina (0-based)
     * @param size tamano de pagina
     * @return bloque de notificaciones ordenadas por fecha desc
     * @throws InstanceNotFoundException
     */
    Block<Notification> getNotifications(Long userId, int page, int size) throws InstanceNotFoundException;

    /**
     * devuelve el numero de notificaciones no leidas del usuario
     * @param userId
     * @return contador de no leidas
     * @throws InstanceNotFoundException
     */
    long getUnreadCount(Long userId) throws InstanceNotFoundException;

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
