package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import es.udc.agon.backend.model.entities.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

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

    // CU06: Crear equipo
    @Test
    public void testCrearEquipo() throws InstanceNotFoundException {
        User creador = createUser("creador1");

        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Mi Primer Equipo");

        assertEquals("Mi Primer Equipo", equipo.getNombreEquipo());
        assertEquals(creador.getId(), equipo.getCreador().getId());
        assertEquals(EstadoEquipo.ACTIVO, equipo.getEstado());
        assertTrue(equipo.getMiembros().contains(creador));

        // Verificación crítica: Comprobar que se autogenera el código de invitación de 8 caracteres
        assertNotNull(equipo.getCodigoEquipo());
        assertEquals(8, equipo.getCodigoEquipo().length());
    }

    // CU07: Propuesta de unión (El creador invita al jugador)
    @Test
    public void testCrearPropuestaDeUnion() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_equipo");
        User jugador = createUser("destino_invitacion");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Invita");

        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());

        // En PROPUESTA: el candidato es el jugador y el decisor es el jugador
        assertEquals(jugador.getId(), solicitud.getCandidato().getId());
        assertEquals(jugador.getId(), solicitud.getDecisor().getId());
        assertEquals(equipo.getId(), solicitud.getEquipo().getId());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertEquals(TipoSolicitud.PROPUESTA, solicitud.getTipoSolicitud());

        // La notificación va para el decisor (el jugador)
        long unreadNotifs = notificationDao.countUnreadByUsuarioId(jugador.getId());
        assertEquals(1, unreadNotifs);
    }

    @Test
    public void testCrearPropuestaDeUnionPermissionException() throws InstanceNotFoundException {
        User creador = createUser("creador2");
        User jugador = createUser("destino2");
        User otroUser = createUser("otro2");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 2");

        // alguien que no es el creador intenta proponer unirse a un jugador
        assertThrows(PermissionException.class,
                () -> equipoService.crearPropuestaDeUnion(otroUser.getId(), equipo.getId(), jugador.getId()));
    }

    // CU07: Petición de unión (El jugador solicita unirse usando el código alfanumérico del equipo)
    @Test
    public void testCrearPeticionDeUnion() throws InstanceNotFoundException {
        User creador = createUser("creador_peticion");
        User jugador = createUser("jugador_solicitante");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Solicitado");

        // CORRECCIÓN: Ahora el jugador se une usando el código único String de 8 caracteres
        Solicitud solicitud = equipoService.crearPeticionDeUnion(jugador.getId(), equipo.getCodigoEquipo());

        // en PETICION: el candidato es el jugador y el decisor es el creador del equipo
        assertEquals(jugador.getId(), solicitud.getCandidato().getId());
        assertEquals(creador.getId(), solicitud.getDecisor().getId());
        assertEquals(equipo.getId(), solicitud.getEquipo().getId());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertEquals(TipoSolicitud.PETICION, solicitud.getTipoSolicitud());

        // la notificacion va para el decisor (el creador)
        long unreadNotifs = notificationDao.countUnreadByUsuarioId(creador.getId());
        assertEquals(1, unreadNotifs);
    }

    // CU08: Responder a solicitudes
    @Test
    public void testResponderSolicitudPropuestaAceptar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador3");
        User jugador = createUser("destino3");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 3");

        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());

        // el jugador (decisor) responde a la propuesta
        equipoService.responderSolicitud(jugador.getId(), solicitud.getId(), true);

        assertEquals(EstadoSolicitud.ACEPTADO, solicitud.getEstado());

        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertTrue(equipoEncontrado.getMiembros().contains(jugador));
    }

    @Test
    public void testResponderSolicitudPeticionAceptar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_peticion_acc");
        User jugador = createUser("jugador_peticion_acc");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Peticion");

        // CORRECCIÓN: Se usa el código de equipo String
        Solicitud solicitud = equipoService.crearPeticionDeUnion(jugador.getId(), equipo.getCodigoEquipo());

        // el creador (decisor) responde a la petición del jugador
        equipoService.responderSolicitud(creador.getId(), solicitud.getId(), true);

        assertEquals(EstadoSolicitud.ACEPTADO, solicitud.getEstado());

        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertTrue(equipoEncontrado.getMiembros().contains(jugador));
    }

    @Test
    public void testResponderSolicitudPropuestaRechazar() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador4");
        User jugador = createUser("destino4");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 4");

        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());

        // el jugador (decisor) rechaza
        equipoService.responderSolicitud(jugador.getId(), solicitud.getId(), false);

        assertEquals(EstadoSolicitud.RECHAZADO, solicitud.getEstado());

        Equipo equipoEncontrado = equipoService.obtenerEquipo(equipo.getId());
        assertFalse(equipoEncontrado.getMiembros().contains(jugador));
    }

    @Test
    public void testResponderSolicitudPermissionException() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador_error");
        User jugador = createUser("jugador_error");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo Error");

        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());

        // el creador (que no es el decisor en la propuesta) intenta responderla
        assertThrows(PermissionException.class,
                () -> equipoService.responderSolicitud(creador.getId(), solicitud.getId(), true));
    }

    // CU09: Abandonar equipo
    @Test
    public void testAbandonarEquipo() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("creador5");
        User miembro = createUser("miembro5");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "Equipo 5");

        Solicitud solicitud = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), miembro.getId());
        equipoService.responderSolicitud(miembro.getId(), solicitud.getId(), true);

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

    // CU10: Disolver equipo
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