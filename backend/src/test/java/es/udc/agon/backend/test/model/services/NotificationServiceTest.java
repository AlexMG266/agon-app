package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

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

        Notification n1 = new Notification(user, "Message 1", TipoNotificacion.SYSTEM);
        Notification n2 = new Notification(user, "Message 2", TipoNotificacion.FRIEND_REQUEST);

        notificationDao.save(n1);
        notificationDao.save(n2);

        List<Notification> notifications = notificationService.getNotifications(user.getId());

        assertEquals(3, notifications.size());
    }

    @Test
    public void testGetNotificationsWithNonExistentId() {
        assertThrows(InstanceNotFoundException.class, () -> notificationService.getNotifications(NON_EXISTENT_ID));
    }

}
