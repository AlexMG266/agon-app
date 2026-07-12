package es.udc.agon.backend.test.model.services;

import es.udc.agon.backend.rest.dtos.UserDto;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UserDtoTest {

    private static Validator validator;

    @BeforeAll
    public static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    public void testValidUserDtoAllValidations() {
        UserDto userDto = new UserDto(1L, 1500, "User Name", "email@test.com", "imagen", LocalDate.of(2000, 1, 1),
                true);
        userDto.setPassword("password123");
        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertTrue(violations.isEmpty(), "Should be valid");
    }

    @Test
    public void testInvalidUserDtoName() {
        UserDto userDto = new UserDto(1L, 1500, null, "email@test.com", "img", LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("password");
        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Name cannot be null");

        userDto.setNombre(""); // 0 length
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Name cannot be empty");

        userDto.setNombre("a".repeat(61)); // max 60
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Name cannot exceed 60 characters");
    }

    @Test
    public void testInvalidUserDtoEmail() {
        UserDto userDto = new UserDto(1L, 1500, "Name", null, "img", LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("password");
        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Email cannot be null");

        userDto.setEmail(""); // 0 length
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Email cannot be empty");

        userDto.setEmail("invalid-email"); // not an email
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Email should be invalid");

        userDto.setEmail("a".repeat(121) + "@a.com"); // max 120
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Email cannot exceed 120 characters");
    }

    @Test
    public void testInvalidUserDtoPassword() {
        UserDto userDto = new UserDto(1L, 1500, "Name", "email@test.com", "img", LocalDate.of(2000, 1, 1), true);
        userDto.setPassword(null); // null
        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Password cannot be null");

        userDto.setPassword(""); // 0 length
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Password cannot be empty");

        userDto.setPassword("a".repeat(61)); // max 60 length
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Password cannot exceed 60 characters");
    }

    @Test
    public void testInvalidUserDtoFechaNacimiento() {
        UserDto userDto = new UserDto(1L, 1500, "Name", "email@test.com", "img", null, true);
        userDto.setPassword("password");
        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Date cannot be null");

        userDto.setFechaNacimiento(LocalDate.now().plusDays(1)); // future date
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Date must be in the past");
    }

    @Test
    public void testInvalidUserDtoImagenPerfil() {
        UserDto userDto = new UserDto(1L, 1500, "Name", "email@test.com", null, LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("password");
        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertTrue(violations.isEmpty(), "Image can be null");

        userDto.setImagenPerfil("a".repeat(2097153)); // size max + 1
        violations = validator.validate(userDto, UserDto.AllValidations.class);
        assertFalse(violations.isEmpty(), "Image exceeds maximum size limit");
    }
}
