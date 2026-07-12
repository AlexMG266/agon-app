package es.udc.agon.backend.model.services;

import java.util.List;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;

public interface NotificationService {

    List<Notification> getNotifications(Long userId) throws InstanceNotFoundException;

}
