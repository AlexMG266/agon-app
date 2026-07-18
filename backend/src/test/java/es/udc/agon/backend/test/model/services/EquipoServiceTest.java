// src/test/java/es/udc/agon/backend/test/model/services/EquipoServiceTest.java
package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstadoEquipo;
import es.udc.agon.backend.model.entities.EstadoSolicitud;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.TipoSolicitud;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class EquipoServiceTest {

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private NotificationDao notificationDao;

    private User createUser(String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    @Test
    public void testCrearEquipo() throws InstanceNotFoundException {
        User creador = createUser("creador1");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Mi Primer Equipo", "Descripción del equipo");
        assertEquals("Mi Primer Equipo", equipo.getNombreEquipo());
        assertEquals(creador.getId(), equipo.getCreador().getId());
        assertEquals(EstadoEquipo.ACTIVO, equipo.getEstado());
        assertTrue(equipo.getMiembros().contains(creador));
        assertNotNull(equipo.getCodigoEquipo());
        assertEquals(8, equipo.getCodigoEquipo().length());
    }

    @Test
    public void testCrearPropuestaDeUnion() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_equipo");
        User jugador = createUser("destino_invitacion");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Invita", "Equipo para invitar");
        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());
        assertEquals(jugador.getId(), solicitud.getCandidato().getId());
        assertEquals(jugador.getId(), solicitud.getDecisor().getId());
        assertEquals(equipo.getId(), solicitud.getEquipo().getId());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertEquals(TipoSolicitud.PROPUESTA, solicitud.getTipoSolicitud());
        long unreadNotifs = notificationDao.countUnreadByUsuarioId(jugador.getId());
        assertEquals(1, unreadNotifs);
    }

    @Test
    public void testCrearPropuestaDeUnionPermissionException() throws InstanceNotFoundException {
        User creador = createUser("creador2");
        User jugador = createUser("destino2");
        User otroUser = createUser("otro2");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 2", "Descripción");
        assertThrows(PermissionException.class,
                () -> equipoService.crearPropuestaDeUnion(otroUser.getId(), equipo.getId(), jugador.getId()));
    }

    @Test
    public void testCrearPeticionDeUnion() throws InstanceNotFoundException {
        User creador = createUser("creador_peticion");
        User jugador = createUser("jugador_solicitante");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Solicitado", "Descripción");
        Solicitud solicitud = equipoService.crearPeticionDeUnion(jugador.getId(), equipo.getCodigoEquipo());
        assertEquals(jugador.getId(), solicitud.getCandidato().getId());
        assertEquals(creador.getId(), solicitud.getDecisor().getId());
        assertEquals(equipo.getId(), solicitud.getEquipo().getId());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertEquals(TipoSolicitud.PETICION, solicitud.getTipoSolicitud());
        long unreadNotifs = notificationDao.countUnreadByUsuarioId(creador.getId());
        assertEquals(1, unreadNotifs);
    }

    @Test
    public void testResponderSolicitudPropuestaAceptar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador3");
        User jugador = createUser("destino3");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 3", "Descripción");
        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());
        equipoService.responderSolicitud(jugador.getId(), solicitud.getId(), true);
        assertEquals(EstadoSolicitud.ACEPTADO, solicitud.getEstado());
        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertTrue(equipoEncontrado.getMiembros().contains(jugador));
    }

    @Test
    public void testResponderSolicitudPeticionAceptar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_peticion_acc");
        User jugador = createUser("jugador_peticion_acc");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Peticion", "Descripción");
        Solicitud solicitud = equipoService.crearPeticionDeUnion(jugador.getId(), equipo.getCodigoEquipo());
        equipoService.responderSolicitud(creador.getId(), solicitud.getId(), true);
        assertEquals(EstadoSolicitud.ACEPTADO, solicitud.getEstado());
        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertTrue(equipoEncontrado.getMiembros().contains(jugador));
    }

    @Test
    public void testResponderSolicitudPropuestaRechazar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador4");
        User jugador = createUser("destino4");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 4", "Descripción");
        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());
        equipoService.responderSolicitud(jugador.getId(), solicitud.getId(), false);
        assertEquals(EstadoSolicitud.RECHAZADO, solicitud.getEstado());
        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertFalse(equipoEncontrado.getMiembros().contains(jugador));
    }

    @Test
    public void testResponderSolicitudPermissionException() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_error");
        User jugador = createUser("jugador_error");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Error", "Descripción");
        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());
        assertThrows(PermissionException.class,
                () -> equipoService.responderSolicitud(creador.getId(), solicitud.getId(), true));
    }

    @Test
    public void testAbandonarEquipo() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador5");
        User miembro = createUser("miembro5");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 5", "Descripción");
        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), miembro.getId());
        equipoService.responderSolicitud(miembro.getId(), solicitud.getId(), true);
        assertTrue(equipoService.obtenerEquipo(equipo.getId()).getMiembros().contains(miembro));
        equipoService.abandonarEquipo(miembro.getId(), equipo.getId());
        assertFalse(equipoService.obtenerEquipo(equipo.getId()).getMiembros().contains(miembro));
    }

    @Test
    public void testAbandonarEquipoCreadorNoPuede() throws InstanceNotFoundException {
        User creador = createUser("creador6");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 6", "Descripción");
        assertThrows(IllegalArgumentException.class,
                () -> equipoService.abandonarEquipo(creador.getId(), equipo.getId()));
    }

    @Test
    public void testEliminarEquipo() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_eliminar");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Eliminar", "Descripción");
        equipoService.eliminarEquipo(creador.getId(), equipo.getId());
        assertThrows(InstanceNotFoundException.class,
                () -> equipoService.obtenerEquipo(equipo.getId()));
    }

    @Test
    public void testEliminarEquipoPermissionException() throws InstanceNotFoundException {
        User creador = createUser("creador_eliminar_permiso");
        User otroUsuario = createUser("otro_eliminar_permiso");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Eliminar Permiso", "Descripción");
        assertThrows(PermissionException.class,
                () -> equipoService.eliminarEquipo(otroUsuario.getId(), equipo.getId()));
    }

    @Test
    public void testEliminarEquipoInstanceNotFoundException() throws InstanceNotFoundException {
        User creador = createUser("creador_eliminar_notfound");
        assertThrows(InstanceNotFoundException.class,
                () -> equipoService.eliminarEquipo(creador.getId(), 999L));
    }
}