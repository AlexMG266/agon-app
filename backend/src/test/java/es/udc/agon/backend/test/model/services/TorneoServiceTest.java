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
    private Torneo configurar(Torneo torneo, String tipoTorneo, int numGrupos, int equiposPorGrupo,
                               boolean tienePlayoff, boolean idaVueltaPlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, null, null, null);
    }

    /**
     * Helper con todos los parámetros incluyendo estrategiaPlayoff.
     */
    private Torneo configurarConPlayoffStrategy(Torneo torneo, String tipoTorneo,
                                                  int numGrupos, int equiposPorGrupo,
                                                  boolean tienePlayoff, boolean idaVueltaPlayoff,
                                                  String estrategiaPlayoff, Integer diasEntrePlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, estrategiaPlayoff, diasEntrePlayoff, null);
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
        Torneo configurado = configurar(torneo, "GRUPOS_PLAYOFF", 1, 2, false, false);
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
                () -> configurar(torneo, "GRUPOS_PLAYOFF", 1, 2, false, false));
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
        configurar(torneo, "GRUPOS_PLAYOFF", 1, 2, false, false);
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, "GRUPOS_PLAYOFF", 1, 2, false, false));
    }

    @Test
    public void testConfigurarEstructuraCapacidadInsuficiente() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "capacidad");
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, "LIGA_UNICA", 1, 2, false, false));
    }

    // ---- Tests de escala: 2 equipos, 1 grupo, LIGA_UNICA ----
    // 2 equipos → N par=2 → N-1 = 1 ronda

    @Test
    public void testCalendario2EquiposLigaUnica() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(2, "2E_LU");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1));
        torneo.setFechaFin(LocalDate.of(2026, 5, 30));
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 2, false, false);
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
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 6, false, false);
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
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 3, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size(), "3 equipos (impar) => 3 rondas");
        for (Jornada j : jornadas) {
            // Con 3 equipos, cada ronda tiene 1 partido (el 3er equipo descansa)
            assertTrue(j.getEncuentros().size() >= 1, "Cada ronda debe tener al menos 1 partido");
        }
    }

    // ---- Tests de distribución: RAPIDO, JORNADAS, UNIFORME ----

    @Test
    public void testDistribucionJornadas() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "DIST_JOR");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L");
        torneoDao.save(torneo);
        configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
    public void testDistribucionUniforme() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "DIST_UNI");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4)); // lunes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion("UNIFORME");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(3, jornadas.size());
        // UNIFORME: también días consecutivos (como RAPIDO)
        for (int i = 0; i < jornadas.size(); i++) {
            assertEquals(LocalDate.of(2026, 5, 4).plusDays(i), jornadas.get(i).getFechaInicio());
        }
    }

    // ---- Tests de calendario con restricciones (días específicos) ----

    @Test
    public void testCalendarioSoloMartesJueves() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "SOLO_MJ");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 1)); // viernes
        torneo.setFechaFin(LocalDate.of(2026, 6, 30));
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("M,J"); // solo martes y jueves
        torneoDao.save(torneo);
        configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        // Excluir el 5, 6 y 7 de mayo
        torneo.setFechasExcluidas("2026-05-05,2026-05-06,2026-05-07");
        torneoDao.save(torneo);
        configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 2, 2, true, false, "RAPIDO", null);
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
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 2, 4, false, false, null, null);
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
        torneo.setEstrategiaDistribucion("JORNADAS");
        torneo.setDiasEntreJornadas(7);
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        assertThrows(IllegalArgumentException.class,
                () -> configurar(torneo, "LIGA_UNICA", 1, 6, false, false));
    }

    @Test
    public void testCalendarioJustoCabe() throws InstanceNotFoundException, PermissionException {
        // 2 equipos, 1 ronda, 1 día. Con RAPIDO y fechaInicio=fechaFin cabe justo
        Torneo torneo = prepararTorneoConEquipos(2, "JUSTO");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 5, 4));
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 2, false, false);
        assertEquals(EstadoTorneo.FASE_GRUPOS, result.getEstado());
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertEquals(1, jornadas.size());
    }

    @Test
    public void testCalendarioSinFechaFinUsaDefault() throws InstanceNotFoundException, PermissionException {
        // Sin fechaFin, el default es now+365 -> debe caber siempre
        Torneo torneo = prepararTorneoConEquipos(4, "SINFIN");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "RAPIDO", null);
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
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "JORNADAS", 7);
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
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "LIGA_UNICA", 1, 4, false, false);
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
        torneo.setEstrategiaDistribucion("RAPIDO");
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, true, "RAPIDO", null);
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
        configurar(torneo, "GRUPOS_PLAYOFF", 1, 2, false, false);
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
        configurar(torneo, "GRUPOS_PLAYOFF", 1, 2, false, false);
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
        configurar(torneo, "GRUPOS_PLAYOFF", 1, 4, false, false);
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
        Torneo result = configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4,
                true, false, "JORNADAS", 3);
        assertEquals("JORNADAS", result.getEstrategiaPlayoff());
        assertEquals(Integer.valueOf(3), result.getDiasEntrePlayoff());
    }

    @Test
    public void testEstrategiaPlayoffNullBackwardsCompatible() throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "NULL_COMPAT");
        torneo.setFechaInicio(LocalDate.of(2026, 5, 4));
        torneo.setFechaFin(LocalDate.of(2026, 7, 30));
        torneo.setDiasDisponibles("L,M,X,J,V,S,D");
        torneoDao.save(torneo);
        Torneo result = configurar(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false);
        assertNull(result.getEstrategiaPlayoff(), "Backwards compatible: null por defecto");
        assertNull(result.getDiasEntrePlayoff(), "Backwards compatible: null por defecto");
    }
}
