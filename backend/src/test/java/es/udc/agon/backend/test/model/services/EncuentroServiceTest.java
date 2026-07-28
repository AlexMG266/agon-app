package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.EncuentroDao;
import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstadoEncuentro;
import es.udc.agon.backend.model.entities.EstadoSolicitud;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.InscripcionDao;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.JornadaDao;
import es.udc.agon.backend.model.entities.SetEntity;
import es.udc.agon.backend.model.entities.SolicitudAplazamiento;
import es.udc.agon.backend.model.entities.SolicitudAplazamientoDao;
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
public class EncuentroServiceTest {

    @Autowired
    private IEncuentroService encuentroService;

    @Autowired
    private TorneoService torneoService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TorneoDao torneoDao;

    @Autowired
    private JornadaDao jornadaDao;

    @Autowired
    private EncuentroDao encuentroDao;

    @Autowired
    private InscripcionDao inscripcionDao;

    @Autowired
    private SolicitudAplazamientoDao solicitudAplazamientoDao;

    private User createUser(String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    /**
     * metodo auxiliar: solicita inscripcion y la aprueba inmediatamente.
     */
    private Inscripcion inscribirEquipo(User capitan, Torneo torneo, Equipo equipo)
            throws InstanceNotFoundException, PermissionException {
        Solicitud solicitud = torneoService.solicitarInscripcion(
                capitan.getId(), torneo.getId(), equipo.getId(), null);
        return torneoService.aprobarInscripcion(
                torneo.getOrganizador().getId(), solicitud.getId());
    }

    /**
     * metodo auxiliar: crea un torneo, inscribe 2 equipos, cierra inscripciones,
     * configura estructura (1 grupo, 2 equipos, sin playoff), genera calendario
     * y devuelve el encuentro generado entre los dos equipos.
     */
    private Encuentro setupEncuentro(User org, User cap1, User cap2)
            throws InstanceNotFoundException, PermissionException {

        Torneo torneo = new Torneo(org, "Torneo Encuentro Test", false, "T99-XXXX");
        torneo = torneoService.crearTorneo(org.getId(), torneo, false);

        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoLocal", "Equipo Local");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoVisitante", "Equipo Visitante");

        inscribirEquipo(cap1, torneo, equipo1);
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "LIGA_UNICA", 1, 2, false, false, null, null, null);

        // obtener la primera jornada y su encuentro generado
        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        Jornada jornada = jornadas.get(0);

        return jornada.getEncuentros().get(0);
    }


    // tests de consultarEncuentrosPropios

    @Test
    public void testConsultarEncuentrosPropios() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_enc_propios");
        User cap1 = createUser("cap_propios1");
        User cap2 = createUser("cap_propios2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        List<Encuentro> encuentrosCap1 = encuentroService.consultarEncuentrosPropios(cap1.getId());
        assertEquals(1, encuentrosCap1.size());
        assertEquals(encuentro.getId(), encuentrosCap1.get(0).getId());
        assertEquals(EstadoEncuentro.PENDIENTE, encuentrosCap1.get(0).getEstadoEncuentro());
    }

    @Test
    public void testConsultarEncuentrosPropiosSinParticipacion() throws InstanceNotFoundException {
        User org = createUser("org_propios2");
        User userSinEquipo = createUser("sin_equipo");

        List<Encuentro> encuentros = encuentroService.consultarEncuentrosPropios(userSinEquipo.getId());
        assertTrue(encuentros.isEmpty());
    }


    // tests de registrarResultado

    @Test
    public void testRegistrarResultado() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_resultado");
        User cap1 = createUser("cap_resultado1");
        User cap2 = createUser("cap_resultado2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        // local gana 3-1
        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 20, 25));
        sets.add(new SetEntity(null, 4, 25, 22));

        encuentroService.registrarResultado(encuentro.getId(), sets);

        Encuentro actualizado = encuentroDao.findById(encuentro.getId()).get();
        assertEquals(EstadoEncuentro.JUGADO, actualizado.getEstadoEncuentro());
        assertEquals(4, actualizado.getSets().size());

        // verificar ganador es el equipo local
        assertEquals(encuentro.getLocal().getId(), actualizado.getGanador().getId());
    }

    @Test
    public void testRegistrarResultadoVisitanteGana() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_resultado2");
        User cap1 = createUser("cap_resultado2_1");
        User cap2 = createUser("cap_resultado2_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        // visitante gana 1-3
        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 20, 25));
        sets.add(new SetEntity(null, 2, 25, 22));
        sets.add(new SetEntity(null, 3, 18, 25));
        sets.add(new SetEntity(null, 4, 22, 25));

        encuentroService.registrarResultado(encuentro.getId(), sets);

        Encuentro actualizado = encuentroDao.findById(encuentro.getId()).get();
        assertEquals(EstadoEncuentro.JUGADO, actualizado.getEstadoEncuentro());
        assertEquals(encuentro.getVisitante().getId(), actualizado.getGanador().getId());
    }

    @Test
    public void testRegistrarResultadoYaJugado() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_resultado3");
        User cap1 = createUser("cap_res3_1");
        User cap2 = createUser("cap_res3_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 25, 20));

        encuentroService.registrarResultado(encuentro.getId(), sets);

        // intentar registrar de nuevo
        assertThrows(IllegalArgumentException.class,
                () -> encuentroService.registrarResultado(encuentro.getId(), sets));
    }

    @Test
    public void testRegistrarResultadoSetsVacios() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_resultado4");
        User cap1 = createUser("cap_res4_1");
        User cap2 = createUser("cap_res4_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        assertThrows(IllegalArgumentException.class,
                () -> encuentroService.registrarResultado(encuentro.getId(), new ArrayList<>()));
    }

    @Test
    public void testRegistrarResultadoSetsGolesNegativos() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_resultado5");
        User cap1 = createUser("cap_res5_1");
        User cap2 = createUser("cap_res5_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, -5, 25));

        assertThrows(IllegalArgumentException.class,
                () -> encuentroService.registrarResultado(encuentro.getId(), sets));
    }

    @Test
    public void testRegistrarResultadoSetEmpate() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_resultado6");
        User cap1 = createUser("cap_res6_1");
        User cap2 = createUser("cap_res6_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 25));

        assertThrows(IllegalArgumentException.class,
                () -> encuentroService.registrarResultado(encuentro.getId(), sets));
    }

    @Test
    public void testRegistrarResultadoActualizaEstadisticasInscripcion()
            throws InstanceNotFoundException, PermissionException {

        User org = createUser("org_resultado_stats");
        User cap1 = createUser("cap_stats1");
        User cap2 = createUser("cap_stats2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        // local gana 3-1
        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 20, 25));
        sets.add(new SetEntity(null, 4, 25, 22));

        encuentroService.registrarResultado(encuentro.getId(), sets);

        // Find inscripciones for both equipos in the torneo
        Long torneoId = encuentro.getJornada().getTorneo().getId();
        Inscripcion inscLocal = inscripcionDao
                .findByEquipoIdAndTorneoId(encuentro.getLocal().getId(), torneoId).get();
        Inscripcion inscVisitante = inscripcionDao
                .findByEquipoIdAndTorneoId(encuentro.getVisitante().getId(), torneoId).get();

        // Local: 3 sets ganados, 1 perdido. Ganó el partido => 2 puntos
        // Visitante: 1 set ganado, 3 perdidos. Perdió el partido => 1 punto
        assertEquals(3, inscLocal.getSetsGanados());
        assertEquals(1, inscLocal.getSetsPerdidos());
        assertEquals(2, inscLocal.getPuntosLiga()); // Ganó el partido
        assertEquals(1, inscLocal.getPartidosJugados());

        assertEquals(1, inscVisitante.getSetsGanados());
        assertEquals(3, inscVisitante.getSetsPerdidos());
        assertEquals(1, inscVisitante.getPuntosLiga()); // Perdió el partido
        assertEquals(1, inscVisitante.getPartidosJugados());
    }

    @Test
    public void testRegistrarResultadoInstanceNotFoundException() {
        assertThrows(InstanceNotFoundException.class,
                () -> encuentroService.registrarResultado(999L, new ArrayList<>()));
    }


    // tests de solicitarAplazamiento

    @Test
    public void testSolicitarAplazamiento() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aplazar");
        User cap1 = createUser("cap_aplazar1");
        User cap2 = createUser("cap_aplazar2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);
        LocalDateTime nuevaFecha = LocalDateTime.now().plusDays(14);

        encuentroService.solicitarAplazamiento(cap1.getId(), encuentro.getId(), nuevaFecha, "Motivo de prueba");

        // verificar que el estado del encuentro cambio
        Encuentro actualizado = encuentroDao.findById(encuentro.getId()).get();
        assertEquals(EstadoEncuentro.SOLICITADO_APLAZAMIENTO, actualizado.getEstadoEncuentro());

        // verificar que se creo la solicitud
        List<SolicitudAplazamiento> solicitudes = solicitudAplazamientoDao.findByEncuentroId(encuentro.getId());
        assertEquals(1, solicitudes.size());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitudes.get(0).getEstado());
        assertEquals(encuentro.getLocal().getId(), solicitudes.get(0).getEquipoSolicitante().getId());
        assertEquals(nuevaFecha, solicitudes.get(0).getFechaSolicitada());
    }

    @Test
    public void testSolicitarAplazamientoComoVisitante() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aplazar2");
        User cap1 = createUser("cap_aplazar2_1");
        User cap2 = createUser("cap_aplazar2_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);
        LocalDateTime nuevaFecha = LocalDateTime.now().plusDays(10);

        encuentroService.solicitarAplazamiento(cap2.getId(), encuentro.getId(), nuevaFecha, "Motivo visitante");

        List<SolicitudAplazamiento> solicitudes = solicitudAplazamientoDao.findByEncuentroId(encuentro.getId());
        assertEquals(1, solicitudes.size());
        assertEquals(encuentro.getVisitante().getId(), solicitudes.get(0).getEquipoSolicitante().getId());
    }

    @Test
    public void testSolicitarAplazamientoPermissionException() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aplazar3");
        User cap1 = createUser("cap_aplazar3_1");
        User cap2 = createUser("cap_aplazar3_2");
        User otroUser = createUser("otro_aplazar");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        assertThrows(PermissionException.class,
                () -> encuentroService.solicitarAplazamiento(otroUser.getId(), encuentro.getId(),
                        LocalDateTime.now().plusDays(5), "Sin permiso"));
    }

    @Test
    public void testSolicitarAplazamientoEncuentroYaJugado() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aplazar4");
        User cap1 = createUser("cap_aplazar4_1");
        User cap2 = createUser("cap_aplazar4_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        // registrar resultado primero
        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 25, 20));
        encuentroService.registrarResultado(encuentro.getId(), sets);

        // ahora intentar aplazar
        assertThrows(IllegalArgumentException.class,
                () -> encuentroService.solicitarAplazamiento(cap1.getId(), encuentro.getId(),
                        LocalDateTime.now().plusDays(5), "Ya jugado"));
    }

    @Test
    public void testSolicitarAplazamientoFechaPasada() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_aplazar5");
        User cap1 = createUser("cap_aplazar5_1");
        User cap2 = createUser("cap_aplazar5_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        assertThrows(IllegalArgumentException.class,
                () -> encuentroService.solicitarAplazamiento(cap1.getId(), encuentro.getId(),
                        LocalDateTime.now().minusDays(1), "Fecha pasada"));
    }

    @Test
    public void testSolicitarAplazamientoEncuentroNotFound() throws InstanceNotFoundException {
        User user = createUser("user_aplazar");
        assertThrows(InstanceNotFoundException.class,
                () -> encuentroService.solicitarAplazamiento(user.getId(), 999L,
                        LocalDateTime.now().plusDays(5), "NotFound"));
    }

    // tests de actualizar ELO (CU23)

    @Test
    public void testRegistrarResultadoActualizaEloJugadorGanador() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_elo1");
        User cap1 = createUser("cap_elo1_1");
        User cap2 = createUser("cap_elo1_2");

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        int eloAntes = cap1.getElo();

        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 25, 20));

        encuentroService.registrarResultado(encuentro.getId(), sets);

        User cap1Actualizado = userDao.findById(cap1.getId()).get();
        User cap2Actualizado = userDao.findById(cap2.getId()).get();

        // El ganador (cap1, equipo local) debe subir ELO, el perdedor debe bajar
        assertTrue(cap1Actualizado.getElo() > eloAntes, "El ELO del ganador deberia aumentar");
        assertTrue(cap2Actualizado.getElo() < 1500, "El ELO del perdedor deberia disminuir");
        assertEquals(1, cap1Actualizado.getPartidosJugados());
    }

    @Test
    public void testRegistrarResultadoEloProvisionalFalseDespuesDe20Partidos() throws Exception {
        User org = createUser("org_elo20");
        User cap1 = createUser("cap_elo20_1");
        User cap2 = createUser("cap_elo20_2");

        // Simular que cap1 ya ha jugado 19 partidos
        cap1.setPartidosJugados(19);
        userDao.save(cap1);

        Encuentro encuentro = setupEncuentro(org, cap1, cap2);

        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 25, 20));

        encuentroService.registrarResultado(encuentro.getId(), sets);

        User cap1Actualizado = userDao.findById(cap1.getId()).get();
        assertEquals(20, cap1Actualizado.getPartidosJugados());
        assertFalse(cap1Actualizado.isEloProvisional(), "ELO deberia dejar de ser provisional tras 20 partidos");
    }
}
