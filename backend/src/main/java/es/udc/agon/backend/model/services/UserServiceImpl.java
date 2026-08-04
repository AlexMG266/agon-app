package es.udc.agon.backend.model.services;

import java.time.LocalDate;
import java.util.Optional;
import java.util.regex.Pattern;

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

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

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

	@Autowired
	private GoogleIdTokenVerifier googleIdTokenVerifier;

	/**
	 * Patrón para nombres de usuario derivados de Google: solo letras/dígitos
	 * (con espacios internos), sin empezar ni ser solo números, máx. 15 chars.
	 * Es el mismo criterio que valida el formulario de registro.
	 */
	private static final Pattern NOMBRE_VALIDO = Pattern.compile(
			"^(?![0-9])(?![0-9]+$)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(?: [a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$");

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
	public User loginWithGoogle(String googleToken) throws IncorrectLoginException {

		GoogleIdToken idToken;
		try {
			idToken = googleIdTokenVerifier.verify(googleToken);
		} catch (Exception e) {
			throw new IncorrectLoginException(null, null);
		}

		if (idToken == null) {
			// Token inválido, expirado o con audiencia incorrecta.
			throw new IncorrectLoginException(null, null);
		}

		GoogleIdToken.Payload payload = idToken.getPayload();

		String googleId = payload.getSubject();
		String email = payload.getEmail();
		String nombreGoogle = (String) payload.get("name");

		if (googleId == null || email == null || email.isBlank()) {
			throw new IncorrectLoginException(null, null);
		}

		// 1) Si ya existe un usuario vinculado a este googleId, login directo.
		Optional<User> userByGoogleId = userDao.findByGoogleId(googleId);
		if (userByGoogleId.isPresent()) {
			return userByGoogleId.get();
		}

		// 2) Si ya existe un usuario con ese email (registrado con contraseña),
		// lo vinculamos a la cuenta de Google para próximos logins.
		Optional<User> userByEmail = userDao.findByEmail(email);
		if (userByEmail.isPresent()) {
			User existing = userByEmail.get();
			existing.setGoogleId(googleId);
			userDao.save(existing);
			return existing;
		}

		// 3) El usuario no existe: lo creamos derivando un nombre único válido.
		String nombre = generarNombreUnico(email, nombreGoogle);

		User newUser = new User(800, nombre, email,
				(String) payload.get("picture"), null, null, true);
		newUser.setPassword(null);
		newUser.setRole("USER");
		newUser.setGoogleId(googleId);

		userDao.save(newUser);

		notificationService.createWelcomeNotification(newUser);
		return newUser;
	}

	/**
	 * Deriva un nombre de usuario válido (3-15 chars, sin empezar/ser solo
	 * números) garantizando unicidad añadiendo un sufijo numérico si el nombre
	 * base ya está en uso. Prioriza el nombre de Google si cumple las reglas;
	 * si no, usa el prefijo del email.
	 */
	private String generarNombreUnico(String email, String nombreGoogle) {

		String base = "";
		if (nombreGoogle != null && !nombreGoogle.isBlank()
				&& nombreGoogle.length() >= 3 && nombreGoogle.length() <= 15
				&& NOMBRE_VALIDO.matcher(nombreGoogle).matches()) {
			base = nombreGoogle.trim();
		}

		if (base.isEmpty()) {
			// Prefijo del email: "juan.garcia@x.com" -> "juangarcia"
			base = email.split("@")[0].replaceAll("[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]", "");
		}

		if (base.length() > 15) {
			base = base.substring(0, 15);
		}
		if (base.length() < 3) {
			// Rellenamos hasta 3 chars para cumplir la validación mínima.
			base = (base + "jugador").substring(0, 15);
		}
		if (NOMBRE_VALIDO.matcher(base).matches() == false || base.matches("^[0-9].*") || base.matches("^[0-9]+$")) {
			base = "jugador";
		}

		String candidate = base;
		int suffix = 1;
		while (userDao.existsByNombre(candidate)) {
			String suf = String.valueOf(suffix);
			candidate = (base + suf).substring(0, Math.min(15, base.length() + suf.length()));
			if (candidate.length() < 3) {
				candidate = "jugador" + suf;
			}
			suffix++;
		}
		return candidate;
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
			LocalDate fechaNacimiento, boolean notificacionesPartidos, int diasAntelacionPartidos)
			throws InstanceNotFoundException {

		User user = permissionChecker.checkUser(id);

		user.setNombre(nombre);
		user.setEmail(email);
		user.setImagenPerfil(imagenPerfil);
		user.setFechaNacimiento(fechaNacimiento);
		user.setNotificacionesPartidos(notificacionesPartidos);
		user.setDiasAntelacionPartidos(diasAntelacionPartidos);

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
