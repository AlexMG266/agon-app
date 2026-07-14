package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import es.udc.agon.backend.rest.dtos.UserDto;

public class UserDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    public static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // caso exitoso: El DTO pasa todas las validaciones estrictas
    @Test
    public void testValidUserDtoAllValidations() {
        UserDto userDto = new UserDto(null, 800, "Carlos", "carlos@mail.com", "img.png", 
                LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("Password123!"); // Cumple: mayúscula, minúscula, número y especial

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertTrue(violations.isEmpty(), "El DTO válido no debería generar violaciones");
    }

    // fallo: nombre invalido (empieza por numeros)
    @Test
    public void testInvalidNombreWithNumbersAtStart() {
        UserDto userDto = new UserDto(null, 800, "123Carlos", "carlos@mail.com", "img.png", 
                LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("Password123!");

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertFalse(violations.isEmpty(), "Debería fallar por empezar con números");
        assertEquals("nombre", violations.iterator().next().getPropertyPath().toString());
    }

    // fallo: nombre invalido (nombre demasiado largo)
    @Test
    public void testInvalidNombreTooLong() {
        UserDto userDto = new UserDto(null, 800, "NombreSuperLargoQuePasaLosQuince", "carlos@mail.com", "img.png", 
                LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("Password123!");

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertFalse(violations.isEmpty(), "Debería fallar por longitud excesiva");
        assertEquals("nombre", violations.iterator().next().getPropertyPath().toString());
    }

    // fallo: nombre invalido (nombre demasiado corto)
    @Test
    public void testInvalidNombreTooShort() {
        UserDto userDto = new UserDto(null, 800, "Al", "test@mail.com", "img.png", 
                LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("Password123!");

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertFalse(violations.isEmpty(), "Debería fallar por longitud insuficiente");
        assertEquals("nombre", violations.iterator().next().getPropertyPath().toString());
    }

    // fallo: contraseña debil (sin caracteres especiales ni mayusculas)
    @Test
    public void testWeakPassword() {
        UserDto userDto = new UserDto(null, 800, "Carlos", "carlos@mail.com", "img.png", 
                LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("12345678"); 

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertFalse(violations.isEmpty(), "Debería fallar por contraseña débil");
        assertEquals("password", violations.iterator().next().getPropertyPath().toString());
    }

    // fallo: email con formato incorrecto
    @Test
    public void testInvalidEmailFormat() {
        UserDto userDto = new UserDto(null, 800, "Carlos", "emailInvalido.com", "img.png", 
                LocalDate.of(2000, 1, 1), true);
        userDto.setPassword("Password123!");

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertFalse(violations.isEmpty(), "Debería fallar por formato de email inválido");
        assertEquals("email", violations.iterator().next().getPropertyPath().toString());
    }

    // fallo: Fecha de nacimiento en el futuro
    @Test
    public void testInvalidFechaNacimientoInFuture() {
        UserDto userDto = new UserDto(null, 800, "Carlos", "carlos@mail.com", "img.png", 
                LocalDate.now().plusDays(1), true);
        userDto.setPassword("Password123!");

        Set<ConstraintViolation<UserDto>> violations = validator.validate(userDto, UserDto.AllValidations.class);

        assertFalse(violations.isEmpty(), "Debería fallar por fecha de nacimiento futura");
        assertEquals("fechaNacimiento", violations.iterator().next().getPropertyPath().toString());
    }
}