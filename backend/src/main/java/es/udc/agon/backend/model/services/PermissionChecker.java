package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.entities.User;

public interface PermissionChecker {
	
	User checkUser(Long userId) throws InstanceNotFoundException;
	
}
