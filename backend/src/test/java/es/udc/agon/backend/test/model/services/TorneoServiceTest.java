package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstadoInscripcion;
import es.udc.agon.backend.model.entities.EstadoJornada;
import es.udc.agon.backend.model.entities.EstadoSolicitud;
import es.udc.agon.backend.model.entities.EstadoTorneo;
import es.udc.agon.backend.model.entities.GrupoDao;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.InscripcionDao;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.JornadaDao;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.TipoFase;
import es.udc.agon.backend.model.entities.TipoJornada;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.entities.TorneoDao;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.model.services.TorneoService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TorneoServiceTest {

    @Autowired
    private TorneoService torneoService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TorneoDao torneoDao;

    @Autowired
    private GrupoDao grupoDao;

    @Autowired
    private InscripcionDao inscripcionDao;

    @Autowired
    private JornadaDao jornadaDao;

    private User createUser(String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    private Torneo createTorneo(User organizador, String nombre)
            throws InstanceNotFoundException {
        Torneo torneo = new Torneo(organizador, nombre, false, "T99-XXXX");
        return torneoService.crearTorneo(organizador.getId(), torneo, false);
    }

    private Inscripcion inscribirEquipo(User capitan, Torneo torneo, Equipo equipo)
            throws InstanceNotFoundException, PermissionException {
        Solicitud solicitud = torneoService.solicitarInscripcion(
                capitan.getId(), torneo.getId(), equipo.getId(), null);
        return torneoService.aprobarInscripcion(
                torneo.getOrganizador().getId(), solicitud.getId());
    }


    // cu11: buscar torneos

    @Test
    public void testBuscarTorneosSinFiltro() throws InstanceNotFoundException {
        User org = createUser("org_buscar1");
        createTorneo(org, "Torneo A");
        createTorneo(org, "Torneo B");

        assertEquals(2, torneoService.buscarTorneos(null).size());
        assertEquals(2, torneoService.buscarTorneos("").size());
    }

    @Test
    public void testBuscarTorneosConFiltro() throws InstanceNotFoundException {
        User org = createUser("org_buscar2");
        createTorneo(org, "Campeonato Regional");
        createTorneo(org, "Liga Nacional");

        assertEquals(1, torneoService.buscarTorneos("Regional").size());
        assertEquals(1, torneoService.buscarTorneos("Liga").size());
        assertEquals(0, torneoService.buscarTorneos("Inexistente").size());
    }

    @Test
    public void testBuscarTorneosFiltroCaseInsensitive() throws InstanceNotFoundException {
        User org = createUser("org_buscar3");
        createTorneo(org, "Torneo de Verano");

        assertEquals(1, torneoService.buscarTorneos("verano").size());
        assertEquals(1, torneoService.buscarTorneos("VERANO").size());
    }


    // cu12: consultar torneo

    @Test
    public void testConsultarTorneo() throws InstanceNotFoundException {
        User org = createUser("org_consultar");
        Torneo torneo = createTorneo(org, "Torneo Consulta");

        Torneo encontrado = torneoService.consultarTorneo(torneo.getId());
        assertEquals(torneo.getId(), encontrado.getId());
        assertEquals("Torneo Consulta", encontrado.getNombre());
        assertEquals(org.getId(), encontrado.getOrganizador().getId());
    }

    @Test
    public void testConsultarTorneoInstanceNotFoundException() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.consultarTorneo(999L));
    }


    // cu13: crear torneo

    @Test
    public void testCrearTorneo() throws InstanceNotFoundException {
        User org = createUser("org_crear");
        Torneo torneo = new Torneo(org, "Torneo Nuevo", false, "T99-XXXX");
        Torneo creado = torneoService.crearTorneo(org.getId(), torneo, false);

        assertNotNull(creado.getId());
        assertEquals("Torneo Nuevo", creado.getNombre());
        assertEquals(EstadoTorneo.RECLUTANDO, creado.getEstado());
        assertEquals(org.getId(), creado.getOrganizador().getId());
        assertNull(creado.getNumGrupos());
        assertNull(creado.getEquiposPorGrupo());
        assertNull(creado.getTienePlayoff());

        // verificar que NO se crearon grupos en la creacion
        assertTrue(grupoDao.findByTorneoId(creado.getId()).isEmpty());
    }

    @Test
    public void testCrearTorneoOrganizadorNotFound() {
        Torneo torneo = new Torneo(null, "Torneo Sin Org", false, "T99-XXXX");
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.crearTorneo(999L, torneo, false));
    }


    // cu14: solicitar inscripcion + aprobar inscripcion

    @Test
    public void testSolicitarYAprobarInscripcion() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscribir");
        User capitan = createUser("capitan_inscribir");
        Torneo torneo = createTorneo(org, "Torneo Inscripcion");
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Inscrito", "Descripcion");

        Solicitud solicitud = torneoService.solicitarInscripcion(
                capitan.getId(), torneo.getId(), equipo.getId(), null);

        assertNotNull(solicitud.getId());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertEquals(torneo.getId(), solicitud.getTorneo().getId());
        assertEquals(equipo.getId(), solicitud.getEquipo().getId());

        // aprobar
        Inscripcion inscripcion = torneoService.aprobarInscripcion(org.getId(), solicitud.getId());

        assertNotNull(inscripcion.getId());
        assertEquals(torneo.getId(), inscripcion.getTorneo().getId());
        assertEquals(equipo.getId(), inscripcion.getEquipo().getId());
        assertNull(inscripcion.getGrupo());
        assertEquals(EstadoInscripcion.ACTIVA, inscripcion.getEstadoInscripcion());
        assertEquals(0, inscripcion.getPuntosLiga());
    }

    @Test
    public void testSolicitarInscripcionDuplicada() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscribir2");
        User capitan = createUser("capitan_inscribir2");
        Torneo torneo = createTorneo(org, "Torneo Duplicado");
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Duplicado", "Descripcion");

        torneoService.solicitarInscripcion(capitan.getId(), torneo.getId(), equipo.getId(), null);

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.solicitarInscripcion(capitan.getId(), torneo.getId(), equipo.getId(), null));
    }

    @Test
    public void testSolicitarInscripcionTorneoNoReclutando() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscribir3");
        User capitan = createUser("capitan_inscribir3");
        Torneo torneo = createTorneo(org, "Torneo Cerrado");
        Equipo equipo1 = equipoService.crearEquipo(capitan.getId(), "EquipoC1", "Descripcion");
        User otroCap = createUser("otro_cap");
        Equipo equipo2 = equipoService.crearEquipo(otroCap.getId(), "EquipoC2", "Descripcion");

        // inscribir 2 equipos y cerrar
        inscribirEquipo(capitan, torneo, equipo1);
        inscribirEquipo(otroCap, torneo, equipo2);
        torneoService.cerrarInscripciones(torneo.getId());

        // ahora intentar solicitar inscripcion de otro equipo
        User cap3 = createUser("cap3");
        Equipo equipo3 = equipoService.crearEquipo(cap3.getId(), "EquipoC3", "Descripcion");
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.solicitarInscripcion(cap3.getId(), torneo.getId(), equipo3.getId(), null));
    }

    @Test
    public void testSolicitarInscripcionPermissionException() throws InstanceNotFoundException {
        User org = createUser("org_permiso");
        User capitan = createUser("capitan_permiso");
        User otroUser = createUser("otro_permiso");
        Torneo torneo = createTorneo(org, "Torneo Permiso");
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Permiso", "Descripcion");

        assertThrows(PermissionException.class,
                () -> torneoService.solicitarInscripcion(otroUser.getId(), torneo.getId(), equipo.getId(), null));
    }

    @Test
    public void testRechazarInscripcion() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rechazar");
        User capitan = createUser("cap_rechazar");
        Torneo torneo = createTorneo(org, "Torneo Rechazar");
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Rechazado", "Desc");

        Solicitud solicitud = torneoService.solicitarInscripcion(
                capitan.getId(), torneo.getId(), equipo.getId(), null);
        torneoService.rechazarInscripcion(org.getId(), solicitud.getId());

        // Verificar que no se creo una inscripcion
        assertTrue(inscripcionDao.findByTorneoId(torneo.getId()).isEmpty());
    }


    // cu16: cerrar inscripciones

    @Test
    public void testCerrarInscripciones() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_cerrar");
        Torneo torneo = createTorneo(org, "Torneo Cerrar");

        User cap1 = createUser("cap_cerrar1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoCerrar1", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);

        User cap2 = createUser("cap_cerrar2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoCerrar2", "Desc");
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());

        Torneo torneoActualizado = torneoService.consultarTorneo(torneo.getId());
        assertEquals(EstadoTorneo.INSCRIPCION_CERRADA, torneoActualizado.getEstado());
    }

    @Test
    public void testCerrarInscripcionesNoReclutando() throws InstanceNotFoundException {
        User org = createUser("org_cerrar2");
        Torneo torneo = createTorneo(org, "Torneo Cerrar No Reclutando");
        torneo.setEstado(EstadoTorneo.FASE_GRUPOS);
        torneoDao.save(torneo);

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.cerrarInscripciones(torneo.getId()));
    }

    @Test
    public void testCerrarInscripcionesNoSuficientesEquipos() throws InstanceNotFoundException {
        User org = createUser("org_cerrar3");
        Torneo torneo = createTorneo(org, "Torneo Sin Equipos");

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.cerrarInscripciones(torneo.getId()));
    }


    // cu17: configurar estructura y generar calendario

    @Test
    public void testConfigurarEstructuraYGenerarCalendario() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_calendario");
        Torneo torneo = createTorneo(org, "Torneo Calendario");

        User cap1 = createUser("cap_cal1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoCal1", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);

        User cap2 = createUser("cap_cal2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoCal2", "Desc");
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());
        Torneo configurado = torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false);

        assertEquals(EstadoTorneo.FASE_GRUPOS, configurado.getEstado());
        assertEquals(Integer.valueOf(1), configurado.getNumGrupos());
        assertEquals(Integer.valueOf(2), configurado.getEquiposPorGrupo());

        // verificar que se crearon las jornadas (1 grupo con 2 equipos = 1 jornada)
        java.util.List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());
        assertEquals(TipoFase.LIGA_GRUPO, jornadas.get(0).getTipoFase());

        // verificar que se crearon los grupos
        assertEquals(1, grupoDao.findByTorneoId(torneo.getId()).size());
    }

    @Test
    public void testConfigurarEstructuraEstadoIncorrecto() throws InstanceNotFoundException {
        User org = createUser("org_cal2");
        Torneo torneo = createTorneo(org, "Torneo Sin Cerrar");

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.configurarEstructuraYGenerarCalendario(
                        torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false));
    }

    @Test
    public void testConfigurarEstructuraYaConfigurado() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_cal3");
        Torneo torneo = createTorneo(org, "Torneo Cal Ya");

        User cap1 = createUser("cap_cal3_1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoCal3_1", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);

        User cap2 = createUser("cap_cal3_2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoCal3_2", "Desc");
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false);

        // ahora el torneo esta en FASE_GRUPOS, llamar de nuevo debe fallar
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.configurarEstructuraYGenerarCalendario(
                        torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false));
    }


    // cu18: generar codigo qr

    @Test
    public void testGenerarCodigoQR() throws InstanceNotFoundException {
        User org = createUser("org_qr");
        Torneo torneo = createTorneo(org, "Torneo QR");

        String qrCode = torneoService.generarCodigoQR(torneo.getId());
        assertNotNull(qrCode);
        assertTrue(qrCode.startsWith("TORNEO-"));
        assertEquals(23, qrCode.length()); // "TORNEO-" + 16 chars
    }

    @Test
    public void testGenerarCodigoQRInstanceNotFoundException() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.generarCodigoQR(999L));
    }


    // cu19: gestionar jornadas

    @Test
    public void testGestionarJornadas() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_jornada");
        Torneo torneo = createTorneo(org, "Torneo Jornada");

        User cap1 = createUser("cap_jorn1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoJorn1", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);

        User cap2 = createUser("cap_jorn2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoJorn2", "Desc");
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false);

        java.util.List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());

        Jornada jornada = jornadas.get(0);
        assertEquals(EstadoJornada.ACTIVA, jornada.getEstado());

        torneoService.gestionarJornadas(torneo.getId(), jornada.getId(), EstadoJornada.APLAZADA);

        Jornada jornadaActualizada = jornadaDao.findById(jornada.getId()).get();
        assertEquals(EstadoJornada.APLAZADA, jornadaActualizada.getEstado());
    }

    @Test
    public void testGestionarJornadasJornadaNoPertenece() throws InstanceNotFoundException {
        User org = createUser("org_jorn2");
        Torneo torneo1 = createTorneo(org, "Torneo J1");
        Torneo torneo2 = createTorneo(org, "Torneo J2");

        // Create a basic jornada manually for torneo2
        Jornada jornada = new Jornada(torneo2, 1, TipoFase.LIGA_GRUPO, TipoJornada.LIGA_4_SETS,
                LocalDate.now(), LocalDate.now().plusDays(7));
        jornadaDao.save(jornada);

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.gestionarJornadas(torneo1.getId(), jornada.getId(), EstadoJornada.APLAZADA));
    }

    @Test
    public void testGestionarJornadasTorneoNotFound() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.gestionarJornadas(999L, 1L, EstadoJornada.APLAZADA));
    }
}
