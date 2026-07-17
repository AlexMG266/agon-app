package es.udc.agon.backend.model.services;

import java.time.LocalDate;
import java.util.Optional;

import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.IncorrectLoginException;
import es.udc.agon.backend.model.exceptions.IncorrectPasswordException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.Notification.TipoNotificacion;
import es.udc.agon.backend.model.entities.NotificationDao;

@Service
@Transactional
public class UserServiceImpl implements UserService {

	@Autowired
	private PermissionChecker permissionChecker;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private UserDao userDao;
	
	@Autowired 
	private NotificationService notificationService;

	@Override
	public User signUp(User user) throws DuplicateInstanceException {

		if (userDao.existsByNombre(user.getNombre())) {
			throw new DuplicateInstanceException("project.entities.user", user.getNombre());
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setElo(800);
		user.setEloProvisional(true);
		user.setRole("USER");

		userDao.save(user);

		notificationService.createWelcomeNotification(user);
		return user;
	}

	@Override
	@Transactional(readOnly = true)
	public User login(String nombre, String password) throws IncorrectLoginException {

		Optional<User> user = userDao.findByNombre(nombre);

		if (!user.isPresent()) {
			throw new IncorrectLoginException(nombre, password);
		}

		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(nombre, password);
		}

		return user.get();

	}

	@Override
	@Transactional(readOnly = true)
	public User loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	@Override
	public User updateProfile(Long id, String nombre, String email, String imagenPerfil,
			LocalDate fechaNacimiento) throws InstanceNotFoundException {

		User user = permissionChecker.checkUser(id);

		user.setNombre(nombre);
		user.setEmail(email);
		user.setImagenPerfil(imagenPerfil);
		user.setFechaNacimiento(fechaNacimiento);

		return user;

	}

	@Override
	public User changePassword(Long id, String oldPassword, String newPassword)
			throws InstanceNotFoundException, IncorrectPasswordException {

		User user = permissionChecker.checkUser(id);

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IncorrectPasswordException();
		} else {
			user.setPassword(passwordEncoder.encode(newPassword));
		}

		return user;
	}

}
