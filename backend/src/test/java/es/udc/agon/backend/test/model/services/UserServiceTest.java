package es.udc.agon.backend.test.model.services;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.IncorrectLoginException;
import es.udc.agon.backend.model.exceptions.IncorrectPasswordException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.services.UserService;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

	private final Long NON_EXISTENT_ID = Long.valueOf(-1);

	@Autowired
	private UserService userService;

	private User createUser(String nombre) {
		return new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
				LocalDate.of(2000, 1, 1), true);
	}

	// CU01 caso exitoso
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		User user = createUser("user");

		userService.signUp(user);

		User loggedInUser = userService.loginFromId(user.getId());

		assertEquals(user, loggedInUser);
		assertEquals("user", user.getNombre());

	}

	// CU01 caso de fallo, probados todos los posibles fallos de validacion
	@Test
	public void testSignUpDuplicatedUserName() throws DuplicateInstanceException {

		User user = createUser("user");

		userService.signUp(user);
		assertThrows(DuplicateInstanceException.class, () -> userService.signUp(user));
	}

	// CU02 caso exitoso
	@Test
	public void testLogin() throws DuplicateInstanceException, IncorrectLoginException {

		User user = createUser("user");
		String clearPassword = user.getPassword();

		userService.signUp(user);

		User loggedInUser = userService.login(user.getNombre(), clearPassword);

		assertEquals(user, loggedInUser);

	}

	// CU02 caso de fallo, id no existe
	@Test
	public void testLoginFromNonExistentId() {
		assertThrows(InstanceNotFoundException.class, () -> userService.loginFromId(NON_EXISTENT_ID));
	}

	// CU02 caso de fallo, contraseña incorrecta
	@Test
	public void testLoginWithIncorrectPassword() throws DuplicateInstanceException {

		User user = createUser("user");
		String clearPassword = user.getPassword();

		userService.signUp(user);
		assertThrows(IncorrectLoginException.class, () -> userService.login(user.getNombre(), 'X' + clearPassword));

	}

	// CU02 caso de fallo, nombre de usuario no existe
	@Test
	public void testLoginWithNonExistentUserName() {
		assertThrows(IncorrectLoginException.class, () -> userService.login("X", "Y"));
	}

	// CU03 caso exitoso
	@Test
	public void testUpdateProfile() throws InstanceNotFoundException, DuplicateInstanceException {

		User user = createUser("user");

		userService.signUp(user);

		user.setNombre('X' + user.getNombre());
		user.setEmail('X' + user.getEmail());
		user.setImagenPerfil('X' + user.getImagenPerfil());
		user.setFechaNacimiento(user.getFechaNacimiento().plusDays(1));

		userService.updateProfile(user.getId(), user.getNombre(), user.getEmail(), user.getImagenPerfil(),
				user.getFechaNacimiento());

		User updatedUser = userService.loginFromId(user.getId());

		assertEquals(user, updatedUser);

	}

	// CU03 caso de fallo, id no existe
	@Test
	public void testUpdateProfileWithNonExistentId() {
		assertThrows(InstanceNotFoundException.class,
				() -> userService.updateProfile(NON_EXISTENT_ID, "X", "X", "X", LocalDate.now()));
	}

	// CU04 caso exitoso
	@Test
	public void testChangePassword() throws DuplicateInstanceException, InstanceNotFoundException,
			IncorrectPasswordException, IncorrectLoginException {

		User user = createUser("user");
		String oldPassword = user.getPassword();
		String newPassword = 'X' + oldPassword;

		userService.signUp(user);
		userService.changePassword(user.getId(), oldPassword, newPassword);
		userService.login(user.getNombre(), newPassword);

	}

	// CU04 caso de fallo, id no existe
	@Test
	public void testChangePasswordWithNonExistentId() {
		assertThrows(InstanceNotFoundException.class, () -> userService.changePassword(NON_EXISTENT_ID, "X", "Y"));
	}

	// CU04 caso de fallo, contraseña incorrecta
	@Test
	public void testChangePasswordWithIncorrectPassword() throws DuplicateInstanceException {

		User user = createUser("user");
		String oldPassword = user.getPassword();
		String newPassword = 'X' + oldPassword;

		userService.signUp(user);
		assertThrows(IncorrectPasswordException.class,
				() -> userService.changePassword(user.getId(), 'Y' + oldPassword, newPassword));

	}

}
