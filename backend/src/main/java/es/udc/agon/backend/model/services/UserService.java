package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.IncorrectLoginException;
import es.udc.agon.backend.model.exceptions.IncorrectPasswordException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.entities.User;
import java.time.LocalDate;

public interface UserService {

	/**
	 *
	 * @param user
	 * @throws DuplicateInstanceException
	 */
	void signUp(User user) throws DuplicateInstanceException;

	/**
	 *
	 * @param nombre
	 * @param password
	 * @return
	 * @throws IncorrectLoginException
	 */
	User login(String nombre, String password) throws IncorrectLoginException;

	/**
	 *
	 * @param id
	 * @return
	 * @throws InstanceNotFoundException
	 */
	User loginFromId(Long id) throws InstanceNotFoundException;

	/**
	 *
	 * @param id
	 * @param nombre
	 * @param email
	 * @param imagenPerfil
	 * @param fechaNacimiento
	 * @return
	 * @throws InstanceNotFoundException
	 */
	User updateProfile(Long id, String nombre, String email, String imagenPerfil, LocalDate fechaNacimiento)
		throws InstanceNotFoundException;

	/**
	 *
	 * @param id
	 * @param oldPassword
	 * @param newPassword
	 * @throws InstanceNotFoundException
	 * @throws IncorrectPasswordException
	 */
	void changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException;

}
