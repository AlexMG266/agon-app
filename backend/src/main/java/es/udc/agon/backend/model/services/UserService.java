package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.IncorrectLoginException;
import es.udc.agon.backend.model.exceptions.IncorrectPasswordException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.entities.User;
import java.time.LocalDate;

public interface UserService {
	
	void signUp(User user) throws DuplicateInstanceException;
	
	User login(String nombre, String password) throws IncorrectLoginException;
	
	User loginFromId(Long id) throws InstanceNotFoundException;
	
	User updateProfile(Long id, String nombre, String email, String imagenPerfil, LocalDate fechaNacimiento)
		throws InstanceNotFoundException;
	
	void changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException;

}
