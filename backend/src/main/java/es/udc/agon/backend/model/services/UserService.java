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
	User signUp(User user) throws DuplicateInstanceException;

	/**
	 *
	 * @param nombre
	 * @param password
	 * @return
	 * @throws IncorrectLoginException
	 */
	User login(String nombre, String password) throws IncorrectLoginException;

	/**
	 * Inicia sesión (o registra y autentica) mediante un ID Token de Google.
	 *
	 * @param googleToken ID Token JWT obtenido del flujo "Sign in with Google"
	 * @return el usuario autenticado (nuevo o ya existente)
	 * @throws IncorrectLoginException si el token no es válido o no pertenece
	 *         al Client ID configurado
	 */
	User loginWithGoogle(String googleToken) throws IncorrectLoginException;

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
	 * @param notificacionesPartidos
	 * @param diasAntelacionPartidos
	 * @return
	 * @throws InstanceNotFoundException
	 */
	User updateProfile(Long id, String nombre, String email, String imagenPerfil, LocalDate fechaNacimiento,
			boolean notificacionesPartidos, int diasAntelacionPartidos)
		throws InstanceNotFoundException;

	/**
	 *
	 * @param id
	 * @param oldPassword
	 * @param newPassword
	 * @throws InstanceNotFoundException
	 * @throws IncorrectPasswordException
	 */
	User changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException;

}
