package es.udc.agon.backend.model.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;

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
}
