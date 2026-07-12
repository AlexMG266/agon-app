package es.udc.agon.backend.rest.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.services.NotificationService;
import es.udc.agon.backend.rest.dtos.NotificationConversor;
import es.udc.agon.backend.rest.dtos.NotificationDto;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> getNotifications(@RequestAttribute Long userId) throws InstanceNotFoundException {
        return NotificationConversor.toNotificationDtos(notificationService.getNotifications(userId));
    }
}
