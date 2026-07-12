package es.udc.agon.backend.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private NotificationDao notificationDao;

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotifications(Long userId) throws InstanceNotFoundException {

        permissionChecker.checkUser(userId);

        return notificationDao.findByUsuarioId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Notification getNotification(Long userId, Long notificationId)
            throws InstanceNotFoundException, PermissionException {

        permissionChecker.checkUser(userId);

        Optional<Notification> notification = notificationDao.findById(notificationId);

        if (!notification.isPresent()) {
            throw new InstanceNotFoundException("project.entities.notification", notificationId);
        }

        if (!notification.get().getUsuario().getId().equals(userId)) {
            throw new PermissionException();
        }

        return notification.get();
    }

    @Override
    public Notification markAsRead(Long userId, Long notificationId)
            throws InstanceNotFoundException, PermissionException {

        Notification notification = getNotification(userId, notificationId);
        notification.setLeido(true);

        return notification;
    }
}
