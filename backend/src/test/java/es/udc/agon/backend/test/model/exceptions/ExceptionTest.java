package es.udc.agon.backend.test.model.exceptions;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.IncorrectLoginException;
import es.udc.agon.backend.model.exceptions.IncorrectPasswordException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

public class ExceptionTest {

    @Test
    public void instanceNotFoundExceptionGuardaNombreYClave() {
        InstanceNotFoundException e = new InstanceNotFoundException("project.entities.user", 7L);
        assertEquals("project.entities.user", e.getName());
        assertEquals(7L, e.getKey());
    }

    @Test
    public void duplicateInstanceExceptionGuardaNombreYClave() {
        DuplicateInstanceException e = new DuplicateInstanceException("project.entities.user", "jugador1");
        assertEquals("project.entities.user", e.getName());
        assertEquals("jugador1", e.getKey());
    }

    @Test
    public void incorrectLoginExceptionGuardaCredenciales() {
        IncorrectLoginException e = new IncorrectLoginException("jugador1", "clave");
        assertEquals("jugador1", e.getUserName());
        assertEquals("clave", e.getPassword());
    }

    @Test
    public void incorrectPasswordExceptionSinArgumentos() {
        IncorrectPasswordException e = new IncorrectPasswordException();
        assertEquals("es.udc.agon.backend.model.exceptions.IncorrectPasswordException",
                e.getClass().getName());
    }

    @Test
    public void permissionExceptionSinArgumentos() {
        PermissionException e = new PermissionException();
        assertEquals("es.udc.agon.backend.model.exceptions.PermissionException",
                e.getClass().getName());
    }
}
