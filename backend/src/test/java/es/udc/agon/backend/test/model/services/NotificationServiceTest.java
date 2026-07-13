package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.Notification.TipoNotificacion;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.NotificationService;
import es.udc.agon.backend.model.services.UserService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class NotificationServiceTest {

    private final Long NON_EXISTENT_ID = Long.valueOf(-1);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationDao notificationDao;

    private User createUser(String nombre) {
        return new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
    }

    @Test
    public void testGetNotifications() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        userService.signUp(user);

        // Actualizado: (usuario, asunto, cuerpo, tipo)
        Notification n1 = new Notification(user, "Asunto 1", "Cuerpo 1", TipoNotificacion.INVITACION);
        Notification n2 = new Notification(user, "Asunto 2", "Cuerpo 2", TipoNotificacion.RECORDATORIO_PARTIDO);

        notificationDao.save(n1);
        notificationDao.save(n2);

        List<Notification> notifications = notificationService.getNotifications(user.getId());

        assertEquals(3, notifications.size());
    }

    @Test
    public void testGetNotificationsWithNonExistentId() {
        assertThrows(InstanceNotFoundException.class, () -> notificationService.getNotifications(NON_EXISTENT_ID));
    }

    @Test
    public void testGetNotification() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("userGet");
        userService.signUp(user);

        Notification notification = new Notification(user, "Asunto test", "Cuerpo test", TipoNotificacion.INVITACION);
        notificationDao.save(notification);

        Notification found = notificationService.getNotification(user.getId(), notification.getId());

        assertEquals("Asunto test", found.getAsunto());
        assertEquals("Cuerpo test", found.getCuerpo());
    }

    @Test
    public void testGetNotificationWithNonExistentId() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("userGetNotFound");
        userService.signUp(user);

        assertThrows(InstanceNotFoundException.class,
                () -> notificationService.getNotification(user.getId(), NON_EXISTENT_ID));
    }

    @Test
    public void testGetNotificationWithPermissionException()
            throws DuplicateInstanceException, InstanceNotFoundException {
        User user1 = createUser("userPerm1");
        User user2 = createUser("userPerm2");
        userService.signUp(user1);
        userService.signUp(user2);

        Notification notification = new Notification(user1, "Asunto", "Cuerpo", TipoNotificacion.SYSTEM);
        notificationDao.save(notification);

        assertThrows(PermissionException.class,
                () -> notificationService.getNotification(user2.getId(), notification.getId()));
    }

    @Test
    public void testMarkAsRead() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("userRead");
        userService.signUp(user);

        Notification notification = new Notification(user, "Asunto", "Cuerpo", TipoNotificacion.SYSTEM);
        notificationDao.save(notification);

        assertFalse(notification.isLeido());

        Notification updated = notificationService.markAsRead(user.getId(), notification.getId());

        assertTrue(updated.isLeido());
    }
}