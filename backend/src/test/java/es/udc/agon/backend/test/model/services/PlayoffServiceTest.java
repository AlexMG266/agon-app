package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstadoTorneo;
import es.udc.agon.backend.model.entities.Grupo;
import es.udc.agon.backend.model.entities.GrupoDao;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.InscripcionDao;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.JornadaDao;
import es.udc.agon.backend.model.entities.SetEntity;
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
import es.udc.agon.backend.model.services.IEncuentroService;
import es.udc.agon.backend.model.services.TorneoService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PlayoffServiceTest {

    @Autowired
    private TorneoService torneoService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private IEncuentroService encuentroService;

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

    private Torneo configurarConPlayoffStrategy(Torneo torneo, String tipoTorneo,
            int numGrupos, int equiposPorGrupo, boolean tienePlayoff, boolean idaVueltaPlayoff,
            String estrategiaPlayoff, Integer diasEntrePlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, estrategiaPlayoff, diasEntrePlayoff, null);
    }

    private Torneo configurarConRonda(Torneo torneo, String tipoTorneo,
            int numGrupos, int equiposPorGrupo, boolean tienePlayoff, boolean idaVueltaPlayoff,
            String rondaInicioPlayoff)
            throws InstanceNotFoundException {
        return torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), tipoTorneo, numGrupos, equiposPorGrupo,
                tienePlayoff, idaVueltaPlayoff, null, null, null, rondaInicioPlayoff);
    }

    private List<SetEntity> victoriaLocal() {
        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 25, 20));
        return sets;
    }

    private void jugarLiga(Long torneoId) throws InstanceNotFoundException, PermissionException {
        for (Jornada jornada : jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId)) {
            if (jornada.getTipoFase() == TipoFase.LIGA_GRUPO) {
                for (Encuentro encuentro : jornada.getEncuentros()) {
                    Long capitan = encuentro.getLocal().getMiembros().iterator().next().getId();
                    encuentroService.registrarResultado(capitan, encuentro.getId(), victoriaLocal());
                }
            }
        }
    }

    private List<Jornada> eliminatoriasDe(List<Jornada> jornadas) {
        return jornadas.stream()
                .filter(j -> j.getTipoFase() == TipoFase.ELIMINATORIA)
                .sorted(Comparator.comparingInt(Jornada::getNumeroJornada))
                .toList();
    }

    private void asignarPuntosPorGrupo(Long torneoId, List<Integer> puntos) {
        for (Grupo grupo : grupoDao.findByTorneoId(torneoId)) {
            List<Inscripcion> inscripciones = inscripcionDao.findByGrupoId(grupo.getId());
            inscripciones.sort(Comparator.comparingLong(Inscripcion::getId));
            for (int i = 0; i < inscripciones.size(); i++) {
                inscripciones.get(i).setPuntosLiga(puntos.get(i));
                inscripcionDao.save(inscripciones.get(i));
            }
        }
    }

    // tests de generarPlayoffs

    @Test
    public void testGenerarPlayoffsSinPlayoffConfigurado()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "SIN_PO");
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "LIGA_UNICA", 1, 4, false, false, null, null, null);

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarPlayoffs(torneo.getId()));
    }

    @Test
    public void testGenerarPlayoffsGeneraFinalConDosClasificados()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "FINAL2");
        configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "RAPIDO", null);

        asignarPuntosPorGrupo(torneo.getId(), List.of(8, 6, 4, 2));
        List<Jornada> jornadas = torneoService.generarPlayoffs(torneo.getId());

        List<Jornada> eliminatorias = eliminatoriasDe(jornadas);
        assertEquals(1, eliminatorias.size());
        assertEquals(1, eliminatorias.get(0).getEncuentros().size());

        Torneo actualizado = torneoDao.findById(torneo.getId()).get();
        assertEquals(EstadoTorneo.PLAYOFF, actualizado.getEstado());
    }

    @Test
    public void testGenerarPlayoffsAutoAlCompletarFaseDeGrupos()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "AUTO_PO");
        configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "RAPIDO", null);

        jugarLiga(torneo.getId());

        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertTrue(jornadas.stream().anyMatch(j -> j.getTipoFase() == TipoFase.ELIMINATORIA),
                "al completar la liga deben generarse los playoffs automaticamente");
        assertEquals(EstadoTorneo.PLAYOFF, torneoDao.findById(torneo.getId()).get().getEstado());
    }

    @Test
    public void testGenerarPlayoffsNoAutoSiLaLigaIncompleta()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "INCOMPL");
        configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "RAPIDO", null);

        // jugar solo el primer encuentro de la liga
        Jornada primera = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId()).get(0);
        Encuentro primero = primera.getEncuentros().get(0);
        Long capitan = primero.getLocal().getMiembros().iterator().next().getId();
        encuentroService.registrarResultado(capitan, primero.getId(), victoriaLocal());

        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        assertTrue(jornadas.stream().noneMatch(j -> j.getTipoFase() == TipoFase.ELIMINATORIA));
    }

    @Test
    public void testGenerarPlayoffsRechazaSegundaLlamada()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "DUP_PO");
        configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "RAPIDO", null);

        asignarPuntosPorGrupo(torneo.getId(), List.of(8, 6, 4, 2));
        torneoService.generarPlayoffs(torneo.getId());

        assertThrows(IllegalArgumentException.class,
                () -> torneoService.generarPlayoffs(torneo.getId()));
    }

    @Test
    public void testGenerarPlayoffsConRondaDeInicioCalibrada()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(8, "CUARTOS");
        configurarConRonda(torneo, "GRUPOS_PLAYOFF", 2, 4, true, false, "CUARTOS");
        asignarPuntosPorGrupo(torneo.getId(), List.of(8, 6, 4, 2));

        List<Jornada> jornadas = torneoService.generarPlayoffs(torneo.getId());

        // la primera llamada materializa solo la ronda inicial (cuartos con 8 equipos);
        // las rondas posteriores quedan pendientes de los ganadores
        List<Jornada> eliminatorias = eliminatoriasDe(jornadas);
        assertEquals(1, eliminatorias.size());
        assertEquals(4, eliminatorias.get(0).getEncuentros().size(), "cuartos con 8 equipos");
        assertEquals(EstadoTorneo.PLAYOFF, torneoDao.findById(torneo.getId()).get().getEstado());
    }

    @Test
    public void testGenerarPlayoffsIdaVuelta()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(8, "CUARTOS_IV");
        configurarConRonda(torneo, "GRUPOS_PLAYOFF", 2, 4, true, true, "CUARTOS");
        asignarPuntosPorGrupo(torneo.getId(), List.of(8, 6, 4, 2));

        List<Jornada> jornadas = torneoService.generarPlayoffs(torneo.getId());

        List<Jornada> eliminatorias = jornadas.stream()
                .filter(j -> j.getTipoFase() == TipoFase.ELIMINATORIA)
                .sorted(Comparator.comparingInt(Jornada::getNumeroJornada))
                .toList();
        assertEquals(8, eliminatorias.get(0).getEncuentros().size(), "4 de ida + 4 de vuelta");
    }

    @Test
    public void testConfigurarRondaInvalidaConGruposNoPotenciaDeDos()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(6, "3GRUPOS");

        assertThrows(IllegalArgumentException.class,
                () -> configurarConRonda(torneo, "GRUPOS_PLAYOFF", 3, 2, true, false, "CUARTOS"));
    }

    @Test
    public void testGenerarPlayoffsTorneoNoExistente() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.generarPlayoffs(999999L));
    }

    @Test
    public void testEliminatoriasUsanFormatoPlayoff()
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = prepararTorneoConEquipos(4, "FORMATO");
        configurarConPlayoffStrategy(torneo, "GRUPOS_PLAYOFF", 1, 4, true, false, "RAPIDO", null);

        asignarPuntosPorGrupo(torneo.getId(), List.of(8, 6, 4, 2));
        List<Jornada> jornadas = torneoService.generarPlayoffs(torneo.getId());

        Jornada eliminatoria = jornadas.stream()
                .filter(j -> j.getTipoFase() == TipoFase.ELIMINATORIA)
                .findFirst().get();
        assertEquals(TipoJornada.PLAYOFF_BEST_OF_5, eliminatoria.getFormatoJornada());
        assertNotNull(eliminatoria.getEncuentros().get(0).getFechaRealizacion());
    }

    // tests de obtenerSolicitud

    @Test
    public void testObtenerSolicitudExistente()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_sol");
        User cap = createUser("cap_sol");
        Torneo torneo = createTorneo(org, "Torneo Solicitud");
        Equipo equipo = equipoService.crearEquipo(cap.getId(), "EquipoSol", "Desc");

        Solicitud solicitud = torneoService.solicitarInscripcion(
                cap.getId(), torneo.getId(), equipo.getId(), null);
        Solicitud obtenida = torneoService.obtenerSolicitud(solicitud.getId());

        assertNotNull(obtenida);
        assertEquals(solicitud.getId(), obtenida.getId());
    }

    @Test
    public void testObtenerSolicitudNoExistente() {
        assertThrows(InstanceNotFoundException.class,
                () -> torneoService.obtenerSolicitud(999999L));
    }
}
