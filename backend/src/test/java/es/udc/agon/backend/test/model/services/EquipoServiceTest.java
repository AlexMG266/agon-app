package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstadoEquipo;
import es.udc.agon.backend.model.entities.EstadoInvitacion;
import es.udc.agon.backend.model.entities.Invitacion;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.model.services.UserService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class EquipoServiceTest {

    private final Long NON_EXISTENT_ID = Long.valueOf(-1);

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserService userService;

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

    // CU06: crear equipo
    @Test
    public void testCrearEquipo() throws InstanceNotFoundException {
        User creador = createUser("creador1");

        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Mi Primer Equipo");

        assertEquals("Mi Primer Equipo", equipo.getNombreEquipo());
        assertEquals(creador.getId(), equipo.getCreador().getId());
        assertEquals(EstadoEquipo.ACTIVO, equipo.getEstado());
        assertTrue(equipo.getMiembros().contains(creador));
    }

    // CU07: invitar miembro
    @Test
    public void testInvitarMiembro() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_equipo");
        User destino = createUser("destino_invitacion");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Invita");

        Invitacion invitacion = equipoService.invitarMiembro(creador.getId(), equipo.getId(), destino.getId());

        assertEquals(destino.getId(), invitacion.getUsuarioDestino().getId());
        assertEquals(creador.getId(), invitacion.getUsuarioRemitente().getId());
        assertEquals(equipo.getId(), invitacion.getEquipo().getId());
        assertEquals(EstadoInvitacion.PENDIENTE, invitacion.getEstado());

        long unreadNotifs = notificationDao.countUnreadByUsuarioId(destino.getId());
        assertEquals(1, unreadNotifs);
    }

    @Test
    public void testInvitarMiembroPermissionException() throws InstanceNotFoundException {
        User creador = createUser("creador2");
        User destino = createUser("destino2");
        User otroUser = createUser("otro2");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 2");

        assertThrows(PermissionException.class,
                () -> equipoService.invitarMiembro(otroUser.getId(), equipo.getId(), destino.getId()));
    }

    // CU08: responder invitacion
    @Test
    public void testResponderInvitacionAceptar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador3");
        User destino = createUser("destino3");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 3");

        Invitacion invitacion = equipoService.invitarMiembro(creador.getId(), equipo.getId(), destino.getId());

        equipoService.responderInvitacion(destino.getId(), invitacion.getId(), true);

        assertEquals(EstadoInvitacion.ACEPTADO, invitacion.getEstado());

        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertTrue(equipoEncontrado.getMiembros().contains(destino));
    }

    @Test
    public void testResponderInvitacionRechazar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador4");
        User destino = createUser("destino4");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 4");

        Invitacion invitacion = equipoService.invitarMiembro(creador.getId(), equipo.getId(), destino.getId());

        equipoService.responderInvitacion(destino.getId(), invitacion.getId(), false);

        assertEquals(EstadoInvitacion.RECHAZADO, invitacion.getEstado());

        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertFalse(equipoEncontrado.getMiembros().contains(destino));
    }

    // CU09: abandonar equipo
    @Test
    public void testAbandonarEquipo() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador5");
        User miembro = createUser("miembro5");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 5");

        Invitacion invitacion = equipoService.invitarMiembro(creador.getId(), equipo.getId(), miembro.getId());
        equipoService.responderInvitacion(miembro.getId(), invitacion.getId(), true);

        // Assert he is member
        assertTrue(equipoService.obtenerEquipo(equipo.getId()).getMiembros().contains(miembro));

        equipoService.abandonarEquipo(miembro.getId(), equipo.getId());

        assertFalse(equipoService.obtenerEquipo(equipo.getId()).getMiembros().contains(miembro));
    }

    @Test
    public void testAbandonarEquipoCreadorNoPuede() throws InstanceNotFoundException {
        User creador = createUser("creador6");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 6");

        assertThrows(IllegalArgumentException.class,
                () -> equipoService.abandonarEquipo(creador.getId(), equipo.getId()));
    }

    // CU10: disolver equipo
    @Test
    public void testDisolverEquipo() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador7");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 7");

        equipoService.disolverEquipo(creador.getId(), equipo.getId());

        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertEquals(EstadoEquipo.DISUELTO, equipoEncontrado.getEstado());
    }

    @Test
    public void testDisolverEquipoPermissionException() throws InstanceNotFoundException {
        User creador = createUser("creador8");
        User miembro = createUser("miembro8");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 8");

        assertThrows(PermissionException.class, () -> equipoService.disolverEquipo(miembro.getId(), equipo.getId()));
    }
}
