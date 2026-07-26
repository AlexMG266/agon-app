package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
import es.udc.agon.backend.model.entities.EstadoInscripcion;
import es.udc.agon.backend.model.entities.EstadoJornada;
import es.udc.agon.backend.model.entities.EstadoSolicitud;
import es.udc.agon.backend.model.entities.EstadoTorneo;
import es.udc.agon.backend.model.entities.Grupo;
import es.udc.agon.backend.model.entities.GrupoDao;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.InscripcionDao;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.JornadaDao;
import es.udc.agon.backend.model.entities.SeguimientoTorneoDao;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.TipoFase;
import es.udc.agon.backend.model.entities.TipoJornada;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.entities.TorneoDao;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.Block;
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

    @Autowired
    private SeguimientoTorneoDao seguimientoTorneoDao;

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

    @Test
    public void testBuscarTorneosSinFiltro() throws InstanceNotFoundException {
        User org = createUser("org_buscar1");
        Torneo tA = createTorneo(org, "Torneo A");
        Torneo tB = createTorneo(org, "Torneo B");
        Block<Torneo> resultados = torneoService.buscarTorneos(null, null, 0, 100);
        assertTrue(resultados.getItems().stream().anyMatch(t -> t.getId().equals(tA.getId())));
        assertTrue(resultados.getItems().stream().anyMatch(t -> t.getId().equals(tB.getId())));
    }

    @Test
    public void testBuscarTorneosConFiltro() throws InstanceNotFoundException {
        User org = createUser("org_buscar2");
        createTorneo(org, "Campeonato Regional");
        createTorneo(org, "Liga Nacional");
        assertEquals(1, torneoService.buscarTorneos("Regional", null, 0, 100).getItems().size());
        assertEquals(1, torneoService.buscarTorneos("Liga", null, 0, 100).getItems().size());
        assertEquals(0, torneoService.buscarTorneos("Inexistente", null, 0, 100).getItems().size());
    }

    @Test
    public void testBuscarTorneosFiltroCaseInsensitive() throws InstanceNotFoundException {
        User org = createUser("org_buscar3");
        createTorneo(org, "Torneo de Verano");
        assertEquals(1, torneoService.buscarTorneos("verano", null, 0, 100).getItems().size());
        assertEquals(1, torneoService.buscarTorneos("VERANO", null, 0, 100).getItems().size());
    }

    @Test
    public void testBuscarTorneosConFiltroEstado() throws InstanceNotFoundException {
        User org = createUser("org_buscar_estado");
        Torneo t1 = createTorneo(org, "Torneo Abierto");
        Torneo t2 = createTorneo(org, "Torneo Cerrado");
        t2.setEstado(EstadoTorneo.INSCRIPCION_CERRADA);
        torneoDao.save(t2);
        Block<Torneo> reclutando = torneoService.buscarTorneos(null, "RECLUTANDO", 0, 100);
        assertTrue(reclutando.getItems().stream().anyMatch(t -> t.getId().equals(t1.getId())));
        Block<Torneo> enJuego = torneoService.buscarTorneos(null, "EN_JUEGO", 0, 100);
        assertTrue(enJuego.getItems().stream().anyMatch(t -> t.getId().equals(t2.getId())));
    }

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
        assertTrue(grupoDao.findByTorneoId(creado.getId()).isEmpty());
    }

    @Test
    public void testCrearTorneoOrganizadorNotFound() {
        Torneo torneo = new Torneo(null, "Torneo Sin Org", false, "T99-XXXX");
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.crearTorneo(999L, torneo, false));
    }

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
        inscribirEquipo(capitan, torneo, equipo1);
        inscribirEquipo(otroCap, torneo, equipo2);
        torneoService.cerrarInscripciones(torneo.getId());
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
        assertTrue(inscripcionDao.findByTorneoId(torneo.getId()).isEmpty());
    }

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
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());
        assertEquals(TipoFase.LIGA_GRUPO, jornadas.get(0).getTipoFase());
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
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.configurarEstructuraYGenerarCalendario(
                        torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false));
    }

    @Test
    public void testGenerarCalendario() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_gen_cal");
        Torneo torneo = createTorneo(org, "Torneo Generar Calendario");
        User cap1 = createUser("cap_gen1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoGen1", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);
        User cap2 = createUser("cap_gen2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoGen2", "Desc");
        inscribirEquipo(cap2, torneo, equipo2);
        torneoService.cerrarInscripciones(torneo.getId());
        // configurar estructura manualmente (sin generar calendario)
        torneo.setTipoTorneo("LIGA_UNICA");
        torneo.setNumGrupos(1);
        torneo.setEquiposPorGrupo(2);
        torneo.setTienePlayoff(false);
        torneo.setIdaVueltaPlayoff(false);
        torneo.setEstado(EstadoTorneo.FASE_GRUPOS);
        torneoDao.save(torneo);
        Grupo grupo = new Grupo(torneo, "Grupo 1");
        grupoDao.save(grupo);
        for (Inscripcion ins : inscripcionDao.findByTorneoId(torneo.getId())) {
            ins.setGrupo(grupo);
            inscripcionDao.save(ins);
        }
        torneoService.generarCalendario(torneo.getId());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());
    }

    @Test
    public void testGenerarCodigoQR() throws InstanceNotFoundException {
        User org = createUser("org_qr");
        Torneo torneo = createTorneo(org, "Torneo QR");
        String qrCode = torneoService.generarCodigoQR(torneo.getId());
        assertNotNull(qrCode);
        assertTrue(qrCode.startsWith("TORNEO-"));
        assertEquals(23, qrCode.length());
    }

    @Test
    public void testGenerarCodigoQRInstanceNotFoundException() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.generarCodigoQR(999L));
    }

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
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
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

    @Test
    public void testObtenerTorneosOrganizador() throws InstanceNotFoundException {
        User org = createUser("org_listar");
        Torneo t1 = createTorneo(org, "Torneo Org 1");
        Torneo t2 = createTorneo(org, "Torneo Org 2");
        List<Torneo> torneos = torneoService.obtenerTorneosOrganizador(org.getId());
        assertEquals(2, torneos.size());
        assertTrue(torneos.stream().anyMatch(t -> t.getId().equals(t1.getId())));
        assertTrue(torneos.stream().anyMatch(t -> t.getId().equals(t2.getId())));
    }

    @Test
    public void testObtenerTorneosOrganizadorSinTorneos() {
        User org = createUser("org_sin_torneos");
        List<Torneo> torneos = torneoService.obtenerTorneosOrganizador(org.getId());
        assertTrue(torneos.isEmpty());
    }

    @Test
    public void testSeguirTorneo() throws InstanceNotFoundException {
        User org = createUser("org_seguir");
        User seguidor = createUser("seguidor");
        Torneo torneo = createTorneo(org, "Torneo Seguir");
        torneoService.seguirTorneo(seguidor.getId(), torneo.getId());
        assertTrue(seguimientoTorneoDao.findByUsuarioId(seguidor.getId()).stream()
                .anyMatch(st -> st.getTorneo().getId().equals(torneo.getId())));
    }

    @Test
    public void testSeguirTorneoDuplicado() throws InstanceNotFoundException {
        User org = createUser("org_seguir_dup");
        User seguidor = createUser("seguidor_dup");
        Torneo torneo = createTorneo(org, "Torneo Seguir Dup");
        torneoService.seguirTorneo(seguidor.getId(), torneo.getId());
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.seguirTorneo(seguidor.getId(), torneo.getId()));
    }

    @Test
    public void testDejarDeSeguirTorneo() throws InstanceNotFoundException {
        User org = createUser("org_dejar_seguir");
        User seguidor = createUser("dejar_seguir");
        Torneo torneo = createTorneo(org, "Torneo Dejar Seguir");
        torneoService.seguirTorneo(seguidor.getId(), torneo.getId());
        torneoService.dejarDeSeguirTorneo(seguidor.getId(), torneo.getId());
        assertTrue(seguimientoTorneoDao.findByUsuarioId(seguidor.getId()).stream()
                .noneMatch(st -> st.getTorneo().getId().equals(torneo.getId())));
    }

    @Test
    public void testObtenerTorneosSeguidos() throws InstanceNotFoundException {
        User org = createUser("org_seguidos");
        User seguidor = createUser("seguidos_user");
        Torneo t1 = createTorneo(org, "Torneo Seguido 1");
        Torneo t2 = createTorneo(org, "Torneo Seguido 2");
        torneoService.seguirTorneo(seguidor.getId(), t1.getId());
        torneoService.seguirTorneo(seguidor.getId(), t2.getId());
        List<Torneo> seguidos = torneoService.obtenerTorneosSeguidos(seguidor.getId());
        assertEquals(2, seguidos.size());
    }

    @Test
    public void testObtenerTorneosInscritos() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_inscritos");
        User cap1 = createUser("cap_inscrito1");
        User cap2 = createUser("cap_inscrito2");
        Torneo torneo = createTorneo(org, "Torneo Inscritos");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoIns1", "Desc");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoIns2", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);
        inscribirEquipo(cap2, torneo, equipo2);
        List<Torneo> inscritos = torneoService.obtenerTorneosInscritos(cap1.getId());
        assertEquals(1, inscritos.size());
        assertEquals(torneo.getId(), inscritos.get(0).getId());
    }

    @Test
    public void testBuscarPorCodigo() throws InstanceNotFoundException {
        User org = createUser("org_codigo");
        Torneo torneo = createTorneo(org, "Torneo Codigo");
        Torneo encontrado = torneoService.buscarPorCodigo(torneo.getCodigoTorneo());
        assertNotNull(encontrado);
        assertEquals(torneo.getId(), encontrado.getId());
    }

    @Test
    public void testBuscarPorCodigoInstanceNotFoundException() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.buscarPorCodigo("CODIGO-INEXISTENTE"));
    }

    @Test
    public void testObtenerSolicitudesPendientes() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_solic_pend");
        User cap1 = createUser("cap_solic1");
        Torneo torneo = createTorneo(org, "Torneo Solicitudes Pendientes");
        Equipo equipo = equipoService.crearEquipo(cap1.getId(), "EquipoSolic", "Desc");
        torneoService.solicitarInscripcion(cap1.getId(), torneo.getId(), equipo.getId(), null);
        List<Solicitud> pendientes = torneoService.obtenerSolicitudesPendientes(torneo.getId());
        assertEquals(1, pendientes.size());
    }

    @Test
    public void testObtenerSolicitudesPendientesSinSolicitudes() throws InstanceNotFoundException {
        User org = createUser("org_solic_vacias");
        Torneo torneo = createTorneo(org, "Torneo Sin Solicitudes");
        List<Solicitud> pendientes = torneoService.obtenerSolicitudesPendientes(torneo.getId());
        assertTrue(pendientes.isEmpty());
    }

    @Test
    public void testActualizarTorneo() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_actualizar");
        Torneo torneo = createTorneo(org, "Torneo Original");
        Torneo datos = new Torneo(org, "Torneo Actualizado", false, "T99-XXXX");
        Torneo actualizado = torneoService.actualizarTorneo(org.getId(), torneo.getId(), datos);
        assertEquals("Torneo Actualizado", actualizado.getNombre());
    }

    @Test
    public void testActualizarTorneoPermissionException() throws InstanceNotFoundException {
        User org = createUser("org_act_permiso");
        User otro = createUser("otro_act_permiso");
        Torneo torneo = createTorneo(org, "Torneo Ajeno");
        Torneo datos = new Torneo(otro, "Torneo Modificado", false, "T99-XXXX");
        assertThrows(PermissionException.class,
                () -> torneoService.actualizarTorneo(otro.getId(), torneo.getId(), datos));
    }

    @Test
    public void testObtenerJornadas() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_obt_jorn");
        Torneo torneo = createTorneo(org, "Torneo Obtener Jornadas");
        User cap1 = createUser("cap_obt_jorn1");
        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoOJ1", "Desc");
        inscribirEquipo(cap1, torneo, equipo1);
        User cap2 = createUser("cap_obt_jorn2");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoOJ2", "Desc");
        inscribirEquipo(cap2, torneo, equipo2);
        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "GRUPOS_PLAYOFF", 1, 2, false, false);
        List<Jornada> jornadas = torneoService.obtenerJornadas(torneo.getId());
        assertEquals(1, jornadas.size());
        assertEquals(1, jornadas.get(0).getNumeroJornada());
        assertEquals(TipoFase.LIGA_GRUPO, jornadas.get(0).getTipoFase());
        assertNotNull(jornadas.get(0).getEncuentros());
        assertEquals(1, jornadas.get(0).getEncuentros().size());
    }

    @Test
    public void testObtenerJornadasTorneoSinConfigurar() throws InstanceNotFoundException {
        User org = createUser("org_obt_jorn_sin_conf");
        Torneo torneo = createTorneo(org, "Torneo Sin Configurar");
        List<Jornada> jornadas = torneoService.obtenerJornadas(torneo.getId());
        assertTrue(jornadas.isEmpty());
    }

    @Test
    public void testObtenerJornadasOrdenadas() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_jorn_orden");
        Torneo torneo = createTorneo(org, "Torneo Jornadas Orden");
        User cap1 = createUser("cap_jorn_ord1");
        User cap2 = createUser("cap_jorn_ord2");
        User cap3 = createUser("cap_jorn_ord3");
        User cap4 = createUser("cap_jorn_ord4");
        Equipo e1 = equipoService.crearEquipo(cap1.getId(), "EquipoJO1", "Desc");
        Equipo e2 = equipoService.crearEquipo(cap2.getId(), "EquipoJO2", "Desc");
        Equipo e3 = equipoService.crearEquipo(cap3.getId(), "EquipoJO3", "Desc");
        Equipo e4 = equipoService.crearEquipo(cap4.getId(), "EquipoJO4", "Desc");
        inscribirEquipo(cap1, torneo, e1);
        inscribirEquipo(cap2, torneo, e2);
        inscribirEquipo(cap3, torneo, e3);
        inscribirEquipo(cap4, torneo, e4);
        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "GRUPOS_PLAYOFF", 1, 4, false, false);
        List<Jornada> jornadas = torneoService.obtenerJornadas(torneo.getId());
        for (int i = 1; i < jornadas.size(); i++) {
            assertTrue(jornadas.get(i - 1).getNumeroJornada() < jornadas.get(i).getNumeroJornada());
        }
    }
}
