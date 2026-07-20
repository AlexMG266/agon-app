package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import es.udc.agon.backend.model.entities.EstadoInscripcion;
import es.udc.agon.backend.model.entities.EstadoJornada;
import es.udc.agon.backend.model.entities.EstadoTorneo;
import es.udc.agon.backend.model.entities.GrupoDao;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.InscripcionDao;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.JornadaDao;
import es.udc.agon.backend.model.entities.TipoFase;
import es.udc.agon.backend.model.entities.TipoJornada;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.entities.TorneoDao;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.model.services.ITorneoService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TorneoServiceTest {

    @Autowired
    private ITorneoService torneoService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TorneoDao torneoDao;

    @Autowired
    private GrupoDao grupoDao;

    @Autowired
    private JornadaDao jornadaDao;

    @Autowired
    private InscripcionDao inscripcionDao;

    private User createUser(String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    private Torneo createTorneo(User organizador, String nombre, int numGrupos, int equiposPorGrupo)
            throws InstanceNotFoundException {
        Torneo torneo = new Torneo(organizador, nombre, numGrupos, equiposPorGrupo, false);
        return torneoService.crearTorneo(organizador.getId(), torneo);
    }


    // cu11: buscar torneos

    @Test
    public void testBuscarTorneosSinFiltro() throws InstanceNotFoundException {
        User org = createUser("org_buscar1");
        createTorneo(org, "Torneo A", 2, 4);
        createTorneo(org, "Torneo B", 1, 4);

        assertEquals(2, torneoService.buscarTorneos(null).size());
        assertEquals(2, torneoService.buscarTorneos("").size());
    }

    @Test
    public void testBuscarTorneosConFiltro() throws InstanceNotFoundException {
        User org = createUser("org_buscar2");
        createTorneo(org, "Campeonato Regional", 2, 4);
        createTorneo(org, "Liga Nacional", 1, 4);

        assertEquals(1, torneoService.buscarTorneos("Regional").size());
        assertEquals(1, torneoService.buscarTorneos("Liga").size());
        assertEquals(0, torneoService.buscarTorneos("Inexistente").size());
    }

    @Test
    public void testBuscarTorneosFiltroCaseInsensitive() throws InstanceNotFoundException {
        User org = createUser("org_buscar3");
        createTorneo(org, "Torneo de Verano", 2, 4);

        assertEquals(1, torneoService.buscarTorneos("verano").size());
        assertEquals(1, torneoService.buscarTorneos("VERANO").size());
    }


    // cu12: consultar torneo

    @Test
    public void testConsultarTorneo() throws InstanceNotFoundException {
        User org = createUser("org_consultar");
        Torneo torneo = createTorneo(org, "Torneo Consulta", 2, 4);

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
        Torneo torneo = new Torneo(org, "Torneo Nuevo", 3, 4, true);
        Torneo creado = torneoService.crearTorneo(org.getId(), torneo);

        assertNotNull(creado.getId());
        assertEquals("Torneo Nuevo", creado.getNombre());
        assertEquals(EstadoTorneo.RECLUTANDO, creado.getEstado());
        assertEquals(org.getId(), creado.getOrganizador().getId());
        assertEquals(3, creado.getNumGrupos());
        assertEquals(4, creado.getEquiposPorGrupo());
        assertTrue(creado.isTienePlayoff());

        // verificar que se crearon los grupos via dao
        assertEquals(3, grupoDao.findByTorneoId(creado.getId()).size());
    }

    @Test
    public void testCrearTorneoOrganizadorNotFound() {
        Torneo torneo = new Torneo(null, "Torneo Sin Org", 2, 4, false);
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.crearTorneo(999L, torneo));
    }


    // cu14: inscribir equipo + cu15: validar equipos (include)

    @Test
    public void testInscribirYValidarEquipo() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscribir");
        User capitan = createUser("capitan_inscribir");
        Torneo torneo = createTorneo(org, "Torneo Inscripcion", 2, 4);
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Inscrito", "Descripcion");

        Inscripcion inscripcion = torneoService.inscribirYValidarEquipo(capitan.getId(), torneo.getId(), equipo.getId());

        assertNotNull(inscripcion.getId());
        assertEquals(torneo.getId(), inscripcion.getTorneo().getId());
        assertEquals(equipo.getId(), inscripcion.getEquipo().getId());
        assertNotNull(inscripcion.getGrupo());
        assertEquals("ACTIVA", inscripcion.getEstadoInscripcion().name());
        assertEquals(0, inscripcion.getPuntosLiga());
    }

    @Test
    public void testInscribirYValidarEquipoYaInscrito() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscribir2");
        User capitan = createUser("capitan_inscribir2");
        Torneo torneo = createTorneo(org, "Torneo Duplicado", 2, 4);
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Duplicado", "Descripcion");

        torneoService.inscribirYValidarEquipo(capitan.getId(), torneo.getId(), equipo.getId());

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.inscribirYValidarEquipo(capitan.getId(), torneo.getId(), equipo.getId()));
    }

    @Test
    public void testInscribirYValidarEquipoTorneoNoReclutando() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscribir3");
        User capitan = createUser("capitan_inscribir3");
        Torneo torneo = createTorneo(org, "Torneo Cerrado", 1, 2);
        Equipo equipo1 = equipoService.crearEquipo(capitan.getId(), "EquipoC1", "Descripcion");
        User otroCap = createUser("otro_cap");
        Equipo equipo2 = equipoService.crearEquipo(otroCap.getId(), "EquipoC2", "Descripcion");

        // inscribir 2 equipos y cerrar
        torneoService.inscribirYValidarEquipo(capitan.getId(), torneo.getId(), equipo1.getId());
        torneoService.inscribirYValidarEquipo(otroCap.getId(), torneo.getId(), equipo2.getId());
        torneoService.cerrarInscripciones(torneo.getId());

        // ahora intentar inscribir otro equipo
        User cap3 = createUser("cap3");
        Equipo equipo3 = equipoService.crearEquipo(cap3.getId(), "EquipoC3", "Descripcion");
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.inscribirYValidarEquipo(cap3.getId(), torneo.getId(), equipo3.getId()));
    }

    @Test
    public void testInscribirYValidarEquipoPermissionException() throws InstanceNotFoundException {
        User org = createUser("org_permiso");
        User capitan = createUser("capitan_permiso");
        User otroUser = createUser("otro_permiso");
        Torneo torneo = createTorneo(org, "Torneo Permiso", 2, 4);
        Equipo equipo = equipoService.crearEquipo(capitan.getId(), "Equipo Permiso", "Descripcion");

        assertThrows(PermissionException.class,
                () -> torneoService.inscribirYValidarEquipo(otroUser.getId(), torneo.getId(), equipo.getId()));
    }

    @Test
    public void testInscribirYValidarEquipoMaxEquipos() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_max");
        Torneo torneo = createTorneo(org, "Torneo Max", 1, 2); // max 2 equipos

        User cap1 = createUser("cap_max1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoMax1", "Desc");
        torneoService.inscribirYValidarEquipo(cap1.getId(), torneo.getId(), equipo1.getId());

        User cap2 = createUser("cap_max2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoMax2", "Desc");
        torneoService.inscribirYValidarEquipo(cap2.getId(), torneo.getId(), equipo2.getId());

        User cap3 = createUser("cap_max3");
        Equipo equipo3 = equipoService.crearEquipo(cap3.getId(), "EquipoMax3", "Desc");
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.inscribirYValidarEquipo(cap3.getId(), torneo.getId(), equipo3.getId()));
    }


    // cu16: cerrar inscripciones

    @Test
    public void testCerrarInscripciones() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_cerrar");
        Torneo torneo = createTorneo(org, "Torneo Cerrar", 1, 2);

        User cap1 = createUser("cap_cerrar1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoCerrar1", "Desc");
        torneoService.inscribirYValidarEquipo(cap1.getId(), torneo.getId(), equipo1.getId());

        User cap2 = createUser("cap_cerrar2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoCerrar2", "Desc");
        torneoService.inscribirYValidarEquipo(cap2.getId(), torneo.getId(), equipo2.getId());

        torneoService.cerrarInscripciones(torneo.getId());

        Torneo torneoActualizado = torneoService.consultarTorneo(torneo.getId());
        assertEquals(EstadoTorneo.FASE_GRUPOS, torneoActualizado.getEstado());
    }

    @Test
    public void testCerrarInscripcionesNoReclutando() throws InstanceNotFoundException {
        User org = createUser("org_cerrar2");
        Torneo torneo = createTorneo(org, "Torneo Cerrar No Reclutando", 1, 2);
        torneo.setEstado(EstadoTorneo.FASE_GRUPOS);
        torneoDao.save(torneo);

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.cerrarInscripciones(torneo.getId()));
    }

    @Test
    public void testCerrarInscripcionesNoSuficientesEquipos() throws InstanceNotFoundException {
        User org = createUser("org_cerrar3");
        Torneo torneo = createTorneo(org, "Torneo Sin Equipos", 2, 4); // necesita al menos 4 equipos

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.cerrarInscripciones(torneo.getId()));
    }


    // cu17: generar calendario

    @Test
    public void testGenerarCalendario() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_calendario");
        Torneo torneo = createTorneo(org, "Torneo Calendario", 1, 2);

        User cap1 = createUser("cap_cal1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoCal1", "Desc");
        torneoService.inscribirYValidarEquipo(cap1.getId(), torneo.getId(), equipo1.getId());

        User cap2 = createUser("cap_cal2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoCal2", "Desc");
        torneoService.inscribirYValidarEquipo(cap2.getId(), torneo.getId(), equipo2.getId());

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.generarCalendario(torneo.getId());

        // verificar que se crearon las jornadas (1 grupo con 2 equipos = 1 jornada)
        java.util.List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());
        assertEquals(TipoFase.LIGA_GRUPO, jornadas.get(0).getTipoFase());
    }

    @Test
    public void testGenerarCalendarioNoFaseGrupos() throws InstanceNotFoundException {
        User org = createUser("org_cal2");
        Torneo torneo = createTorneo(org, "Torneo Sin Cerrar", 1, 2);

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarCalendario(torneo.getId()));
    }

    @Test
    public void testGenerarCalendarioYaGenerado() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_cal3");
        Torneo torneo = createTorneo(org, "Torneo Cal Ya", 1, 2);

        User cap1 = createUser("cap_cal3_1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoCal3_1", "Desc");
        torneoService.inscribirYValidarEquipo(cap1.getId(), torneo.getId(), equipo1.getId());

        User cap2 = createUser("cap_cal3_2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoCal3_2", "Desc");
        torneoService.inscribirYValidarEquipo(cap2.getId(), torneo.getId(), equipo2.getId());

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.generarCalendario(torneo.getId());

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarCalendario(torneo.getId()));
    }


    // cu18: generar codigo qr

    @Test
    public void testGenerarCodigoQR() throws InstanceNotFoundException {
        User org = createUser("org_qr");
        Torneo torneo = createTorneo(org, "Torneo QR", 2, 4);

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
        Torneo torneo = createTorneo(org, "Torneo Jornada", 1, 2);

        User cap1 = createUser("cap_jorn1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoJorn1", "Desc");
        torneoService.inscribirYValidarEquipo(cap1.getId(), torneo.getId(), equipo1.getId());

        User cap2 = createUser("cap_jorn2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoJorn2", "Desc");
        torneoService.inscribirYValidarEquipo(cap2.getId(), torneo.getId(), equipo2.getId());

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.generarCalendario(torneo.getId());

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
        Torneo torneo1 = createTorneo(org, "Torneo J1", 1, 2);
        Torneo torneo2 = createTorneo(org, "Torneo J2", 1, 2);

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
