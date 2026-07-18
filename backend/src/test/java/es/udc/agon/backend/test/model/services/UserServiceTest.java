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

        User registeredUser = userService.signUp(user);

        User loggedInUser = userService.loginFromId(registeredUser.getId());

        assertEquals(registeredUser, loggedInUser);
        assertEquals("user", registeredUser.getNombre());

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

        User registeredUser = userService.signUp(user);

        User loggedInUser = userService.login(registeredUser.getNombre(), clearPassword);

        assertEquals(registeredUser, loggedInUser);

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

        User registeredUser = userService.signUp(user);
        assertThrows(IncorrectLoginException.class, () -> userService.login(registeredUser.getNombre(), 'X' + clearPassword));

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

        User registeredUser = userService.signUp(user);

        registeredUser.setNombre('X' + registeredUser.getNombre());
        registeredUser.setEmail('X' + registeredUser.getEmail());
        registeredUser.setImagenPerfil('X' + registeredUser.getImagenPerfil());
        registeredUser.setFechaNacimiento(registeredUser.getFechaNacimiento().plusDays(1));

        userService.updateProfile(registeredUser.getId(), registeredUser.getNombre(), registeredUser.getEmail(),
                registeredUser.getImagenPerfil(), registeredUser.getFechaNacimiento());

        User updatedUser = userService.loginFromId(registeredUser.getId());

        assertEquals(registeredUser, updatedUser);

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

        User registeredUser = userService.signUp(user);
        userService.changePassword(registeredUser.getId(), oldPassword, newPassword);
        userService.login(registeredUser.getNombre(), newPassword);

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

        User registeredUser = userService.signUp(user);
        assertThrows(IncorrectPasswordException.class,
                () -> userService.changePassword(registeredUser.getId(), 'Y' + oldPassword, newPassword));

    }

    // Test para verificar que el rol se asigna correctamente al registrarse
    @Test
    public void testSignUpRole() throws DuplicateInstanceException {
        User user = new User(1500, "testRole", "test@mail.com", null, "password", LocalDate.of(2000, 1, 1), true);
        User registeredUser = userService.signUp(user);
        assertEquals("USER", registeredUser.getRole());
    }

}