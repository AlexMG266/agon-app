package es.udc.agon.backend.model.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.entities.Notification.TipoNotificacion;
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
    public void createWelcomeNotification(User user) {
        String asunto = "¡Bienvenido a Agon!";

        String cuerpo = "Estás a un paso de la competición. Primero, personaliza tu perfil en 'Ajustes' para que otros jugadores te identifiquen. Después, explora la sección de torneos activos para inscribirte con tu equipo. \n\n" +
                "¡La reputación competitiva es tuya!";

        Notification welcomeNotification = new Notification(user, asunto, cuerpo, TipoNotificacion.SYSTEM);
        notificationDao.save(welcomeNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public Block<Notification> getNotifications(Long userId, int page, int size) throws InstanceNotFoundException {

        permissionChecker.checkUser(userId);

        Page<Notification> notificationPage = notificationDao.findByUsuarioId(userId, PageRequest.of(page, size));

        return new Block<>(notificationPage.getContent(), notificationPage.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) throws InstanceNotFoundException {

        permissionChecker.checkUser(userId);

        return notificationDao.countUnreadByUsuarioId(userId);
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
