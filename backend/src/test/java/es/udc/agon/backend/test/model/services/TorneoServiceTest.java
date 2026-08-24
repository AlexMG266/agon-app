package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstrategiaDistribucion;
import es.udc.agon.backend.model.entities.EstrategiaPlayoff;
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
import es.udc.agon.backend.model.entities.RondaPlayoff;
import es.udc.agon.backend.model.entities.SeguimientoTorneoDao;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.SolicitudDao;
import es.udc.agon.backend.model.entities.TipoFase;
import es.udc.agon.backend.model.entities.TipoSolicitud;
import es.udc.agon.backend.model.entities.TipoJornada;
import es.udc.agon.backend.model.entities.TipoTorneo;
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

    @Autowired
    private SolicitudDao solicitudDao;

    @Autowired
    private EntityManager entityManager;

    // ---- Helper methods ----

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

    /**
     * Prepara un torneo con N equipos inscritos y en estado INSCRIPCION_CERRADA.
     */
    private Torneo prepararTorneoConEquipos(int numEquipos, String baseName)
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_" + baseName);
        Torneo torneo = createTorneo(org, "Torneo " + baseName);
        for (int i = 1; i <= numEquipos; i++) {
            User cap = createUser("cap_" + baseName + "_" + i);
            Equipo eq = equipoService.crearEquipo(cap.getId(), "Equipo_" + baseName + "_" + i, "Desc");
            inscribirEquipo(cap, torneo, eq);
        }
        torneoService.cerrarInscripciones(torneo.getId());
        return torneo;
    }

    /**
     * Helper para llamar a configurarEstructuraYGenerarCalendario con los 8 parámetros,
     * usando valores por defecto para los dos nuevos (null, null).
     */
    private Torneo configurar(Torneo torneo, TipoTorneo tipoTorneo, int numGrupos, int equiposPorGrupo,
                               boolean tienePlayoff, boolean idaVueltaPlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, null, null, null);
    }

    /**
     * Helper con todos los parámetros incluyendo estrategiaPlayoff.
     */
    private Torneo configurarConPlayoffStrategy(Torneo torneo, TipoTorneo tipoTorneo,
                                                  int numGrupos, int equiposPorGrupo,
                                                  boolean tienePlayoff, boolean idaVueltaPlayoff,
                                                  EstrategiaPlayoff estrategiaPlayoff, Integer diasEntrePlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, estrategiaPlayoff, diasEntrePlayoff, null);
    }

    /**
     * Helper con todos los parámetros incluyendo la ronda de inicio del playoff.
     */
    private Torneo configurarConRonda(Torneo torneo, TipoTorneo tipoTorneo,
                                       int numGrupos, int equiposPorGrupo,
                                       boolean tienePlayoff, boolean idaVueltaPlayoff,
                                       RondaPlayoff rondaInicioPlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, null, null, null, rondaInicioPlayoff);
    }

    // ---- Tests de búsqueda ----

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
        // Contamos solo los torneos creados por el organizador del test para no
        // acoplarnos a los nombres de los torneos del seed (p.ej. "Liga + Playoff 2026").
        long regionales = torneoService.buscarTorneos("Regional", null, 0, 100).getItems().stream()
                .filter(t -> t.getOrganizador().getId().equals(org.getId())).count();
        long ligas = torneoService.buscarTorneos("Liga", null, 0, 100).getItems().stream()
                .filter(t -> t.getOrganizador().getId().equals(org.getId())).count();
        long inexistentes = torneoService.buscarTorneos("Inexistente", null, 0, 100).getItems().stream()
                .filter(t -> t.getOrganizador().getId().equals(org.getId())).count();
        assertEquals(1, regionales);
        assertEquals(1, ligas);
        assertEquals(0, inexistentes);
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

    // ---- Tests de creación ----

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

    // ---- Tests de inscripciones ----

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

    // ---- Tests de calendario básicos ----

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
        Torneo configurado = configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 2, false, false);
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
                () -> configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 2, false, false));
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
        configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 2, false, false);
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 2, false, false));
    }

    @Test
    public void testConfigurarEstructuraCapacidadInsuficiente() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "capacidad");
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 2, false, false));
    }

    // ---- Tests de escala: 2 equipos, 1 grupo, LIGA_UNICA ----
    // 2 equipos → N par=2 → N-1 = 1 ronda

    @Test
    public void testCalendario2EquiposLigaUnica() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(2, "2E_LU");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1));
        torneo.setFechaFin(LocalDate.of(2026, 5, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 2, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size(), "2 equipos => 1 ronda");
        assertEquals(1, jornadas.get(0).getEncuentros().size(), "1 partido por ronda");
    }

    // 4 equipos, 1 grupo → N=4 → N-1 = 3 rondas
    @Test
    public void testCalendario4Equipos1GrupoLigaUnica() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "4E_LU");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1));
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size(), "4 equipos => 3 rondas");
        for (Jornada j : jornadas) {
            assertEquals(2, j.getEncuentros().size(), "Cada ronda: 2 partidos (4 equipos/2)");
        }
    }

    // 6 equipos, 1 grupo → N=6 → N-1 = 5 rondas
    @Test
    public void testCalendario6Equipos1Grupo() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(6, "6E_1G");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1));
        torneo.setFechaFin(LocalDate.of(2026, 8, 1));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 6, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(5, jornadas.size(), "6 equipos => 5 rondas");
        for (Jornada j : jornadas) {
            assertEquals(3, j.getEncuentros().size(), "Cada ronda: 3 partidos");
        }
        // Verificar que cada equipo juega exactamente una vez por ronda (round-robin)
        for (int rondaIdx = 0; rondaIdx < jornadas.size(); rondaIdx++) {
            Set<String> locales = new HashSet<>();
            Set<String> visitantes = new HashSet<>();
            for (var enc : jornadas.get(rondaIdx).getEncuentros()) {
                assertTrue(locales.add(enc.getLocal().getNombreEquipo()), "Local duplicado en ronda " + rondaIdx);
                assertTrue(visitantes.add(enc.getVisitante().getNombreEquipo()), "Visitante duplicado en ronda " + rondaIdx);
            }
        }
    }

    // 3 equipos, 1 grupo → N impar=3 → N=3 rondas (1 bye cada ronda)
    @Test
    public void testCalendario3EquiposImpares() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(3, "3E_IMP");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1));
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 3, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size(), "3 equipos (impar) => 3 rondas");
        for (Jornada j : jornadas) {
            // Con 3 equipos, cada ronda tiene 1 partido (el 3er equipo descansa)
            assertTrue(j.getEncuentros().size() >= 1, "Cada ronda debe tener al menos 1 partido");
        }
    }

    // ---- Tests de distribución: RAPIDO, JORNADAS ----

    @Test
    public void testDistribucionJornadas() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "DIST_JOR");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L");
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // Cada jornada debe caer en lunes, separadas por 7 días
        for (int i = 0; i < jornadas.size(); i++) {
            LocalDate expected = LocalDate.of(2026, 5, 4).plusDays(i * 7L);
            assertEquals(expected, jornadas.get(i).getFechaInicio(),
                    "Jornada " + (i+1) + " debe caer en " + expected);
        }
    }

    @Test
    public void testDistribucionRapido() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "DIST_RAP");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 5, 10));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // RAPIDO: días consecutivos
        for (int i = 0; i < jornadas.size(); i++) {
            LocalDate expected = LocalDate.of(2026, 5, 4).plusDays(i);
            assertEquals(expected, jornadas.get(i).getFechaInicio(),
                    "Jornada " + (i+1) + " debe caer en " + expected + " (día consecutivo)");
        }
    }

    @Test
    public void testDistribucionUniformeTratadaComoRapido() throws InstanceNotFoundException, PermissionException {
        // La estrategia 'UNIFORME' fue eliminada; los torneos existentes con ese valor
        // se tratan como 'RAPIDO' (días consecutivos) por compatibilidad.
        Torneo torneo = prepararTorneoConEquipos(4, "DIST_UNI");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.UNIFORME);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // UNIFORME se normaliza a RAPIDO: días consecutivos
        for (int i = 0; i < jornadas.size(); i++) {
            assertEquals(LocalDate.of(2026, 5, 4).plusDays(i), jornadas.get(i).getFechaInicio());
        }
        // El valor normalizado debe quedar persistido como RAPIDO
        Torneo actualizado = torneoDao.findById(torneo.getId()).orElse(null);
        assertNotNull(actualizado);
        assertEquals(EstrategiaDistribucion.RAPIDO, actualizado.getEstrategiaDistribucion());
    }

    // ---- Tests de calendario con restricciones (días específicos) ----

    @Test
    public void testCalendarioSoloMartesJueves() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "SOLO_MJ");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1)); // viernes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("M,J"); // solo martes y jueves
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        for (Jornada j : jornadas) {
            java.time.DayOfWeek dow = j.getFechaInicio().getDayOfWeek();
            assertTrue(dow == java.time.DayOfWeek.TUESDAY || dow == java.time.DayOfWeek.THURSDAY,
                    "Jornada debe caer en martes o jueves, pero cayó en " + dow);
        }
    }

    @Test
    public void testCalendarioConFechasExcluidasSaltaDias() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "EXCLUIDAS");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 5, 20));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        // Excluir el 5, 6 y 7 de mayo
        torneo.setFechasExcluidas("2026-05-05,2026-05-06,2026-05-07");
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // J1 = 4 may; J2 salta 5,6,7 → 8 may; J3 = 9 may
        assertEquals(LocalDate.of(2026, 5, 4), jornadas.get(0).getFechaInicio());
        assertEquals(LocalDate.of(2026, 5, 8), jornadas.get(1).getFechaInicio());
        assertEquals(LocalDate.of(2026, 5, 9), jornadas.get(2).getFechaInicio());
    }

    // ---- Tests de grupos múltiples ----

    @Test
    public void testCalendario2Grupos4Equipos() throws InstanceNotFoundException, PermissionException {
        // 2 grupos, 2 equipos cada uno, liguilla + playoff
        Torneo torneo = prepararTorneoConEquipos(4, "2G_4E");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 2, 2, true, false, EstrategiaPlayoff.RAPIDO, null);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Grupo> grupos = grupoDao.findByTorneoId(torneo.getId());
        assertEquals(2, grupos.size());
        // Cada grupo con 2 equipos → 1 ronda cada uno, comparten jornada global
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size(), "2 grupos de 2 equipos => 1 ronda global");
    }

    @Test
    public void testCalendario2Grupos4Equipos4Rondas() throws InstanceNotFoundException, PermissionException {
        // 2 grupos, 4 equipos cada uno → N=4 => 3 rondas c/u
        Torneo torneo = prepararTorneoConEquipos(8, "2G_8E");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 2, 4, false, false, null, null);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Grupo> grupos = grupoDao.findByTorneoId(torneo.getId());
        assertEquals(2, grupos.size());
        // 4 equipos/grupo → N=4 → N-1 = 3 rondas
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size(), "2 grupos de 4 => 3 rondas globales");
        // Cada jornada debe tener 4 partidos (2 por grupo)
        for (Jornada j : jornadas) {
            assertEquals(4, j.getEncuentros().size(), "4 partidos por jornada (2 por grupo)");
        }
    }

    // ---- Tests de límite de fechas (no caben las jornadas) ----
    
    @Test
    public void testCalendarioNoCabenJornadasLanzaExcepcion() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(6, "NOCABE");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 5, 5)); // solo 2 días
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 6, false, false));
    }

    @Test
    public void testCalendarioJustoCabe() throws InstanceNotFoundException, PermissionException {
        // 2 equipos, 1 ronda, 1 día. Con RAPIDO y fechaInicio=fechaFin cabe justo
        Torneo torneo = prepararTorneoConEquipos(2, "JUSTO");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 5, 4));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 2, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());
    }

    @Test
    public void testCalendarioSinFechaFinUsaDefault() throws InstanceNotFoundException, PermissionException {
        // Sin fechaFin, el default es now+365 -> debe caber siempre
        Torneo torneo = prepararTorneoConEquipos(4, "SINFIN");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
    }

    // ---- Tests de playoff con distintas estrategias ----

    @Test
    public void testCalendarioConPlayoffYReservaRapido() throws InstanceNotFoundException, PermissionException {
        // 4 equipos, 1 grupo, liga + playoff RAPIDO
        // Liga: 3 rondas (1 día c/u). Playoff: 3 rondas (1 día c/u). Total: 6 días
        Torneo torneo = prepararTorneoConEquipos(4, "PLAY_RAP");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 5, 20));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4, true, false, EstrategiaPlayoff.RAPIDO, null);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size(), "Deben generarse 3 jornadas de liga");
        // Playoff RAPIDO: reserva 3 días al final (3 rondas * 1 día)
        // Las ligas deberían caber antes del 20 - 3 = 17 de mayo
        assertTrue(jornadas.get(2).getFechaInicio().isBefore(LocalDate.of(2026, 5, 17)),
                "La última jornada de liga debe ser antes del límite de reserva de playoff");
    }

    @Test
    public void testCalendarioConPlayoffYReservaJornadas() throws InstanceNotFoundException, PermissionException {
        // 4 equipos, 1 grupo, liga + playoff JORNADAS (diasEntrePlayoff=7)
        // Liga: 3 rondas (1 día c/u). Playoff: 3 rondas * 7 días = 21 días de reserva
        Torneo torneo = prepararTorneoConEquipos(4, "PLAY_JOR");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4, true, false, EstrategiaPlayoff.JORNADAS, 7);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // Playoff JORNADAS con 7 días: reserva = 3 * 7 = 21 días
        // Límite liga = 30 jun - 21 = 9 jun
        LocalDate limiteEsperado = LocalDate.of(2026, 6, 9);
        assertTrue(jornadas.get(2).getFechaInicio().isBefore(limiteEsperado) ||
                   jornadas.get(2).getFechaInicio().isEqual(limiteEsperado),
                "Última jornada debe ser antes o el " + limiteEsperado);
    }

    @Test
    public void testCalendarioSinPlayoffNoReserva() throws InstanceNotFoundException, PermissionException {
        // Sin playoff, debe usar fechaFin completa, sin reserva
        Torneo torneo = prepararTorneoConEquipos(4, "SINPLAY");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 5, 10));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // Sin playoff: la última jornada debería poder usar hasta el 10 de mayo
        assertEquals(LocalDate.of(2026, 5, 6), jornadas.get(2).getFechaInicio());
    }

    @Test
    public void testPlayoffIdaVueltaReservaMasDias() throws InstanceNotFoundException, PermissionException {
        // Ida/vuelta en playoff = 6 rondas en lugar de 3
        // Con RAPIDO: reserva = 6 días
        Torneo torneo = prepararTorneoConEquipos(4, "PLAY_IV");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 5, 20));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4, true, true, EstrategiaPlayoff.RAPIDO, null);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        // Ida/vuelta: 6 rondas * 1 día = 6 días de reserva
        // Límite = 20 may - 6 = 14 may
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertTrue(jornadas.get(2).getFechaInicio().isBefore(LocalDate.of(2026, 5, 14)),
                "Última liga antes del límite por ida/vuelta");
    }

    // ---- Tests de JornadaDao ----

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
        torneo.setTipoTorneo(TipoTorneo.LIGA_UNICA);
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
        configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 2, false, false);
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
        configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 2, false, false);
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
        configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4, false, false);
        List<Jornada> jornadas = torneoService.obtenerJornadas(torneo.getId());
        for (int i = 1; i < jornadas.size(); i++) {
            assertTrue(jornadas.get(i - 1).getNumeroJornada() < jornadas.get(i).getNumeroJornada());
        }
    }

    // ---- Tests de estrategiaPlayoff ----

    @Test
    public void testEstrategiaPlayoffPersistida() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "ESTR_PERSIST");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4,
                true, false, EstrategiaPlayoff.JORNADAS, 3);
        assertEquals(EstrategiaPlayoff.JORNADAS, result.getEstrategiaPlayoff());
        assertEquals(Integer.valueOf(3), result.getDiasEntrePlayoff());
    }

    @Test
    public void testEstrategiaPlayoffNullBackwardsCompatible() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "NULL_COMPAT");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4, true, false);
        assertNull(result.getEstrategiaPlayoff(), "Backwards compatible: null por defecto");
        assertNull(result.getDiasEntrePlayoff(), "Backwards compatible: null por defecto");
    }

    // ---- Tests de calibración de eliminatorias (rondaInicioPlayoff) ----

    @Test
    public void testRondaInicioPlayoffPersistida() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(8, "RONDA_PERSIST");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        // 4 grupos x 2 equipos, eliminatoria desde CUARTOS (8 equipos => 2 por grupo)
        Torneo result = configurarConRonda(torneo, TipoTorneo.GRUPOS_PLAYOFF, 4, 2,
                true, false, RondaPlayoff.CUARTOS);
        assertEquals(RondaPlayoff.CUARTOS, result.getRondaInicioPlayoff());
    }

    @Test
    public void testRondaInicioPlayoffRechazaNumGruposNoPotenciaDeDos()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(6, "RONDA_3GRUPOS");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        // 3 grupos no es potencia de 2 -> debe lanzar IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> configurarConRonda(
                torneo, TipoTorneo.GRUPOS_PLAYOFF, 3, 2, true, false, RondaPlayoff.OCTAVOS));
    }

    @Test
    public void testRondaInicioPlayoffRechazaDivisionNoExacta()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(8, "RONDA_DIV");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        // 4 grupos con CUARTOS (8 equipos) => 2 por grupo OK, pero SEMIFINALES (4)
        // no divide 4 grupos -> 1 equipo por grupo entraría en playoffs (ronda de 4 en 4 grupos)
        // 4 % 4 == 0 => 1 por grupo, permitido; usar en su lugar 3 grupos no potencia.
        // Aquí comprobamos OCTAVOS con 4 grupos: 16 % 4 == 0 pero 4 por grupo supera
        // el tamaño del grupo (2). Debe rechazarse por exceder equiposPorGrupo.
        assertThrows(IllegalArgumentException.class, () -> configurarConRonda(
                torneo, TipoTorneo.GRUPOS_PLAYOFF, 4, 2, true, false, RondaPlayoff.OCTAVOS));
    }

    @Test
    public void testRondaInicioPlayoffNullBackwardsCompatible() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(8, "RONDA_NULL");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        // Sin ronda configurada: comportamiento histórico (2 por grupo) y ronda auto-resuelta.
        Torneo result = configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 4, 2, true, false);
        // 4 grupos x 2 = 8 equipos -> CUARTOS auto-resuelto
        assertEquals(RondaPlayoff.CUARTOS, result.getRondaInicioPlayoff());
    }

    // ---- Tests de casos de error no cubiertos (ampliacion de cobertura) ----

    @Test
    public void testBuscarTorneosEstadoFINALIZADO() throws InstanceNotFoundException {
        User org = createUser("org_buscar_fin");
        Torneo torneo = createTorneo(org, "Torneo Finalizado");
        torneo.setEstado(EstadoTorneo.FINALIZADO);
        torneoDao.save(torneo);
        Block<Torneo> finalizados = torneoService.buscarTorneos(null, "FINALIZADO", 0, 100);
        assertTrue(finalizados.getItems().stream()
                .filter(t -> t.getOrganizador().getId().equals(org.getId()))
                .anyMatch(t -> t.getId().equals(torneo.getId())));
    }

    @Test
    public void testBuscarTorneosConFiltroYEstado() throws InstanceNotFoundException {
        User org = createUser("org_buscar_filtro_estado");
        Torneo torneo = createTorneo(org, "Torneo Especial Regional");
        Block<Torneo> resultados = torneoService.buscarTorneos("Especial", "RECLUTANDO", 0, 100);
        assertTrue(resultados.getItems().stream()
                .filter(t -> t.getOrganizador().getId().equals(org.getId()))
                .anyMatch(t -> t.getId().equals(torneo.getId())));
    }

    @Test
    public void testConsultarTorneoConInscripciones() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_consultar_ins");
        User cap = createUser("cap_consultar_ins");
        Torneo torneo = createTorneo(org, "Torneo Con Inscritos");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoConsultar", "Desc");
        inscribirEquipo(cap, torneo, equipo);
        // limpia el contexto para que consultarTorneo recargue el torneo y fuerce
        // la inicializacion lazy de inscripciones y miembros
        entityManager.clear();
        Torneo encontrado = torneoService.consultarTorneo(torneo.getId());
        assertEquals(1, encontrado.getInscripciones().size());
    }

    @Test
    public void testSolicitarInscripcionEquipoYaInscrito() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_ya_inscrito");
        User cap = createUser("cap_ya_inscrito");
        Torneo torneo = createTorneo(org, "Torneo Ya Inscrito");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoYaInscrito", "Desc");
        inscribirEquipo(cap, torneo, equipo);
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), equipo.getId(), null));
    }

    @Test
    public void testSolicitarInscripcionUsuarioYaTieneEquipo() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_otro_equipo");
        User cap = createUser("cap_otro_equipo");
        Torneo torneo = createTorneo(org, "Torneo Un Equipo Por User");
        Equipo e1 = equipoService.crearEquipo(cap.getId(), "Equipo1Cap", "Desc");
        inscribirEquipo(cap, torneo, e1);
        Equipo e2 = equipoService.crearEquipo(cap.getId(), "Equipo2Cap", "Desc");
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), e2.getId(), null));
    }

    @Test
    public void testSolicitarInscripcionMaxEquipos() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_max_eq");
        User cap1 = createUser("cap_max1");
        User cap2 = createUser("cap_max2");
        Torneo torneo = createTorneo(org, "Torneo Capacidad 1");
        torneo.setNumGrupos(1);
        torneo.setEquiposPorGrupo(1);
        torneoDao.save(torneo);
        Equipo e1 = equipoService.crearEquipo(cap1.getId(), "EquipoMax1", "Desc");
        inscribirEquipo(cap1, torneo, e1);
        Equipo e2 = equipoService.crearEquipo(cap2.getId(), "EquipoMax2", "Desc");
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.solicitarInscripcion(cap2.getId(), torneo.getId(), e2.getId(), null));
    }

    @Test
    public void testAprobarInscripcionSolicitudNoPendiente() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aprob_no_pend");
        User cap = createUser("cap_aprob_no_pend");
        Torneo torneo = createTorneo(org, "Torneo No Pendiente");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoNoPend", "Desc");
        Solicitud solicitud = torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), equipo.getId(), null);
        torneoService.rechazarInscripcion(org.getId(), solicitud.getId());
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.aprobarInscripcion(org.getId(), solicitud.getId()));
    }

    @Test
    public void testAprobarInscripcionTipoIncorrecto() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("org_tipo_inc");
        User jugador = createUser("jug_tipo_inc");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "EquipoTipoInc", "Desc");
        Solicitud propuesta = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.aprobarInscripcion(creador.getId(), propuesta.getId()));
    }

    @Test
    public void testAprobarInscripcionPermissionException() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aprob_permiso");
        User cap = createUser("cap_aprob_permiso");
        User otro = createUser("otro_aprob_permiso");
        Torneo torneo = createTorneo(org, "Torneo Aprob Permiso");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoAprobPerm", "Desc");
        Solicitud solicitud = torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), equipo.getId(), null);
        assertThrows(PermissionException.class,
                () -> torneoService.aprobarInscripcion(otro.getId(), solicitud.getId()));
    }

    @Test
    public void testAprobarInscripcionTorneoNoReclutando() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aprob_cerrado");
        User cap = createUser("cap_aprob_cerrado");
        Torneo torneo = createTorneo(org, "Torneo Aprob Cerrado");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoAprobCer", "Desc");
        Solicitud solicitud = torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), equipo.getId(), null);
        torneo.setEstado(EstadoTorneo.INSCRIPCION_CERRADA);
        torneoDao.save(torneo);
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.aprobarInscripcion(org.getId(), solicitud.getId()));
    }

    @Test
    public void testAprobarInscripcionEquipoYaInscrito() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aprob_dup");
        User cap = createUser("cap_aprob_dup");
        Torneo torneo = createTorneo(org, "Torneo Aprob Duplicado");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoAprobDup", "Desc");
        inscribirEquipo(cap, torneo, equipo);
        Solicitud solicitud = new Solicitud(cap, org, equipo, torneo, TipoSolicitud.SOLICITUD_INSCRIPCION);
        solicitudDao.save(solicitud);
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.aprobarInscripcion(org.getId(), solicitud.getId()));
        assertEquals(EstadoSolicitud.RECHAZADO, solicitud.getEstado());
    }

    @Test
    public void testAprobarInscripcionMaxEquipos() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aprob_max");
        User cap1 = createUser("cap_aprob_max1");
        User cap2 = createUser("cap_aprob_max2");
        Torneo torneo = createTorneo(org, "Torneo Aprob Max");
        torneo.setNumGrupos(1);
        torneo.setEquiposPorGrupo(1);
        torneoDao.save(torneo);
        Equipo e1 = equipoService.crearEquipo(cap1.getId(), "EquipoAMax1", "Desc");
        inscribirEquipo(cap1, torneo, e1);
        Equipo e2 = equipoService.crearEquipo(cap2.getId(), "EquipoAMax2", "Desc");
        Solicitud solicitud = new Solicitud(cap2, org, e2, torneo, TipoSolicitud.SOLICITUD_INSCRIPCION);
        solicitudDao.save(solicitud);
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.aprobarInscripcion(org.getId(), solicitud.getId()));
    }

    /**
     * Verifica la red de seguridad a nivel de BD (solución C): el constraint UNIQUE
     * (idTorneo, idEquipo) impide que un mismo equipo quede inscrito dos veces en el
     * mismo torneo incluso si el check del servicio fallase por concurrencia.
     */
    @Test
    public void testConstraintUnicoEquipoTorneo() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_uniq");
        User cap = createUser("cap_uniq");
        Torneo torneo = createTorneo(org, "Torneo Unique");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoUnique", "Desc");
        inscribirEquipo(cap, torneo, equipo);

        // Insertar directamente una segunda inscripcion del mismo equipo/torneo.
        Inscripcion duplicada = new Inscripcion(torneo, equipo);
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class, () -> {
            inscripcionDao.save(duplicada);
            entityManager.flush();
        });
    }

    @Test
    public void testRechazarInscripcionSolicitudNoPendiente() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rech_no_pend");
        User cap = createUser("cap_rech_no_pend");
        Torneo torneo = createTorneo(org, "Torneo Rech No Pend");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoRechNoPend", "Desc");
        Solicitud solicitud = torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), equipo.getId(), null);
        torneoService.rechazarInscripcion(org.getId(), solicitud.getId());
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.rechazarInscripcion(org.getId(), solicitud.getId()));
    }

    @Test
    public void testRechazarInscripcionTipoIncorrecto() throws InstanceNotFoundException, PermissionException {
        User creador = createUser("org_rech_tipo");
        User jugador = createUser("jug_rech_tipo");
        Equipo equipo = equipoService.crearEquipo(creador.getId(), "EquipoRechTipo", "Desc");
        Solicitud propuesta = equipoService.crearPropuestaDeUnion(creador.getId(), equipo.getId(), jugador.getId());
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.rechazarInscripcion(creador.getId(), propuesta.getId()));
    }

    @Test
    public void testRechazarInscripcionPermissionException() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rech_perm");
        User cap = createUser("cap_rech_perm");
        User otro = createUser("otro_rech_perm");
        Torneo torneo = createTorneo(org, "Torneo Rech Perm");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoRechPerm", "Desc");
        Solicitud solicitud = torneoService.solicitarInscripcion(cap.getId(), torneo.getId(), equipo.getId(), null);
        assertThrows(PermissionException.class,
                () -> torneoService.rechazarInscripcion(otro.getId(), solicitud.getId()));
    }

    @Test
    public void testConfigurarEstructuraSinInscripciones() throws InstanceNotFoundException {
        User org = createUser("org_sin_insc");
        Torneo torneo = createTorneo(org, "Torneo Sin Inscripciones");
        torneo.setEstado(EstadoTorneo.INSCRIPCION_CERRADA);
        torneoDao.save(torneo);
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 2, false, false));
    }

    @Test
    public void testConfigurarEstructuraFechaFin() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(2, "FECHAFIN");
        LocalDate fechaFin = LocalDate.now().plusDays(30);
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), TipoTorneo.LIGA_UNICA, 1, 2, false, false, null, null, fechaFin.toString());
        Torneo actualizado = torneoDao.findById(torneo.getId()).get();
        assertEquals(fechaFin, actualizado.getFechaFin());
    }

    @Test
    public void testConfigurarEstructuraEstrategiaPlayoffUniformeComoRapido()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "PO_UNIFORME");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, TipoTorneo.GRUPOS_PLAYOFF, 1, 4,
                true, false, EstrategiaPlayoff.UNIFORME, null);
        assertEquals(EstrategiaPlayoff.RAPIDO, result.getEstrategiaPlayoff());
    }

    @Test
    public void testConfigurarConHorasYDuracion() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "HORAS");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneo.setHoraInicio("10:00");
        torneo.setHoraFin("22:00");
        torneo.setDuracionPartido(60);
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        Encuentro primero = jornadas.get(0).getEncuentros().get(0);
        Encuentro segundo = jornadas.get(0).getEncuentros().get(1);
        assertEquals(10, primero.getFechaRealizacion().getHour());
        assertEquals(11, segundo.getFechaRealizacion().getHour());
    }

    @Test
    public void testConfigurarMinutosReinicianCuandoNoCaben() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "HORAS_RESET");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneo.setHoraInicio("10:00");
        torneo.setHoraFin("10:30");
        torneo.setDuracionPartido(60);
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        for (Encuentro enc : jornadas.get(0).getEncuentros()) {
            assertEquals(10, enc.getFechaRealizacion().getHour());
        }
    }

    @Test
    public void testConfigurarGruposDeDistintoTamano() throws InstanceNotFoundException, PermissionException {
        // 5 equipos en 2 grupos: A=3 (3 rondas), B=2 (1 ronda). Las rondas 1 y 2 de B se saltan.
        Torneo torneo = prepararTorneoConEquipos(5, "GRUPOS_DESIGUALES");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.RAPIDO);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 2, 3, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        assertEquals(2, jornadas.get(0).getEncuentros().size());
        assertEquals(1, jornadas.get(1).getEncuentros().size());
        assertEquals(1, jornadas.get(2).getEncuentros().size());
    }

    @Test
    public void testGenerarCalendarioEstadoIncorrecto() throws InstanceNotFoundException {
        User org = createUser("org_gen_estado");
        Torneo torneo = createTorneo(org, "Torneo Gen Estado");
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarCalendario(torneo.getId()));
    }

    @Test
    public void testGenerarCalendarioYaTieneCalendario() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(2, "GEN_YA");
        configurar(torneo, TipoTorneo.LIGA_UNICA, 1, 2, false, false);
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarCalendario(torneo.getId()));
    }

    @Test
    public void testActualizarTorneoTodosLosCampos() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_act_campos");
        Torneo torneo = createTorneo(org, "Torneo Campos");
        Torneo datos = new Torneo(org, "Torneo Campos Actualizado", false, "T99-XXXX");
        datos.setFechaInicio(LocalDate.of(2026, 6, 1));
        datos.setFechaFin(LocalDate.of(2026, 7, 1));
        datos.setFechaLimiteInscripcion(LocalDate.of(2026, 5, 15));
        datos.setPuntosVictoria(3);
        datos.setPuntosEmpate(1);
        datos.setPuntosDerrota(0);
        datos.setFormatoPartidos("MEJOR_DE_5");
        datos.setDiasDisponibles("L,X,V");
        datos.setHoraInicio("17:00");
        datos.setHoraFin("21:00");
        datos.setDuracionPartido(75);
        datos.setFechasExcluidas("2026-06-10");
        datos.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        Torneo actualizado = torneoService.actualizarTorneo(org.getId(), torneo.getId(), datos);
        assertEquals("Torneo Campos Actualizado", actualizado.getNombre());
        assertEquals(LocalDate.of(2026, 6, 1), actualizado.getFechaInicio());
        assertEquals(LocalDate.of(2026, 7, 1), actualizado.getFechaFin());
        assertEquals(LocalDate.of(2026, 5, 15), actualizado.getFechaLimiteInscripcion());
        assertEquals(Integer.valueOf(3), actualizado.getPuntosVictoria());
        assertEquals(Integer.valueOf(1), actualizado.getPuntosEmpate());
        assertEquals(Integer.valueOf(0), actualizado.getPuntosDerrota());
        assertEquals("MEJOR_DE_5", actualizado.getFormatoPartidos());
        assertEquals("L,X,V", actualizado.getDiasDisponibles());
        assertEquals("17:00", actualizado.getHoraInicio());
        assertEquals("21:00", actualizado.getHoraFin());
        assertEquals(Integer.valueOf(75), actualizado.getDuracionPartido());
        assertEquals("2026-06-10", actualizado.getFechasExcluidas());
        assertEquals(EstrategiaDistribucion.JORNADAS, actualizado.getEstrategiaDistribucion());
    }

    @Test
    public void testConfigurarRondaDieciseisavos() throws InstanceNotFoundException, PermissionException {
        // 16 grupos x 2 = 32 equipos: la ronda mas alta es DIECISEISAVOS
        Torneo torneo = prepararTorneoConEquipos(4, "DIECISEISAVOS");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConRonda(torneo, TipoTorneo.GRUPOS_PLAYOFF, 16, 2,
                true, false, RondaPlayoff.DIECISEISAVOS);
        assertEquals(RondaPlayoff.DIECISEISAVOS, result.getRondaInicioPlayoff());
    }

    @Test
    public void testConfigurarRondaAutoResuelveDieciseisavos() throws InstanceNotFoundException, PermissionException {
        // ronda null con 16 grupos -> auto: 2*16=32 -> nombreRonda(32)=DIECISEISAVOS
        Torneo torneo = prepararTorneoConEquipos(4, "AUTO_16G");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, TipoTorneo.GRUPOS_PLAYOFF, 16, 2, true, false);
        assertEquals(RondaPlayoff.DIECISEISAVOS, result.getRondaInicioPlayoff());
    }

    @Test
    public void testConfigurarRondaNoConfiguradaSeAutoResuelve() throws InstanceNotFoundException, PermissionException {
        // ronda null con 2 grupos -> auto -> 2*2=4 equipos -> fromEquipos(4)=SEMIFINALES
        Torneo torneo = prepararTorneoConEquipos(4, "RONDA_DESC");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConRonda(torneo, TipoTorneo.GRUPOS_PLAYOFF, 2, 2,
                true, false, null);
        // ronda null -> auto -> 2*2=4 -> SEMIFINALES
        assertEquals(RondaPlayoff.SEMIFINALES, result.getRondaInicioPlayoff());
    }

    @Test
    public void testGenerarPlayoffsSinEquiposClasificados() throws InstanceNotFoundException, PermissionException {
        // torneo con playoff pero sin grupos creados (configuracion manual incompleta)
        Torneo torneo = prepararTorneoConEquipos(2, "PO_SIN_CLAS");
        torneo.setTipoTorneo(TipoTorneo.GRUPOS_PLAYOFF);
        torneo.setTienePlayoff(true);
        torneo.setIdaVueltaPlayoff(false);
        torneo.setEstado(EstadoTorneo.FASE_GRUPOS);
        torneoDao.save(torneo);
        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarPlayoffs(torneo.getId()));
    }

    @Test
    public void testGenerarPlayoffsConByes() throws InstanceNotFoundException, PermissionException {
        // 6 equipos en 2 grupos (3 c/u) con ronda CUARTOS (8): solo 6 clasificados -> byes hasta 8
        Torneo torneo = prepararTorneoConEquipos(6, "PO_BYES");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        configurarConRonda(torneo, TipoTorneo.GRUPOS_PLAYOFF, 2, 4, true, false, RondaPlayoff.CUARTOS);
        for (Grupo grupo : grupoDao.findByTorneoId(torneo.getId())) {
            List<Inscripcion> insc = inscripcionDao.findByGrupoId(grupo.getId());
            for (int i = 0; i < insc.size(); i++) {
                insc.get(i).setPuntosLiga(10 - i * 2);
                inscripcionDao.save(insc.get(i));
            }
        }
        List<Jornada> jornadas = torneoService.generarPlayoffs(torneo.getId());
        List<Jornada> eliminatorias = jornadas.stream()
                .filter(j -> j.getTipoFase() == TipoFase.ELIMINATORIA)
                .collect(Collectors.toList());
        assertEquals(1, eliminatorias.size());
        assertEquals(3, eliminatorias.get(0).getEncuentros().size(),
                "3 partidos en cuartos con 6 clasificados y 2 byes");
    }

    @Test
    public void testGenerarPlayoffsConFechaFinYHoras() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "PO_FECHAFIN");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneo.setHoraInicio("09:00");
        torneo.setHoraFin("14:00");
        torneoDao.save(torneo);
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), TipoTorneo.GRUPOS_PLAYOFF, 1, 4, true, false, EstrategiaPlayoff.JORNADAS, 7, "2026-08-01");
        for (Grupo grupo : grupoDao.findByTorneoId(torneo.getId())) {
            List<Inscripcion> insc = inscripcionDao.findByGrupoId(grupo.getId());
            for (int i = 0; i < insc.size(); i++) {
                insc.get(i).setPuntosLiga(10 - i * 2);
                inscripcionDao.save(insc.get(i));
            }
        }
        List<Jornada> jornadas = torneoService.generarPlayoffs(torneo.getId());
        Jornada eliminatoria = jornadas.stream()
                .filter(j -> j.getTipoFase() == TipoFase.ELIMINATORIA)
                .findFirst().get();
        // fechaBase = fechaFin de la ultima jornada de liga
        List<Jornada> liga = jornadas.stream()
                .filter(j -> j.getTipoFase() == TipoFase.LIGA_GRUPO)
                .collect(Collectors.toList());
        LocalDate fechaEsperada = liga.get(liga.size() - 1).getFechaFin();
        assertEquals(fechaEsperada, eliminatoria.getFechaInicio());
        assertEquals(9, eliminatoria.getEncuentros().get(0).getFechaRealizacion().getHour());
    }
}
