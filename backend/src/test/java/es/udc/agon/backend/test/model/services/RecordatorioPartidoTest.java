package es.udc.agon.backend.test.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.EncuentroDao;
import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.JornadaDao;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.entities.SetEntity;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.TipoTorneo;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.model.services.IEncuentroService;
import es.udc.agon.backend.model.services.TorneoService;

@SpringBootTest(properties = "spring.main.allow-bean-definition-overriding=true")
@ActiveProfiles("test")
@Transactional
public class RecordatorioPartidoTest {

    @TestConfiguration
    static class FixedClockConfig {

        @Bean
        @Primary
        public Clock clock() {
            return Clock.fixed(
                    LocalDate.of(2025, 6, 10).atStartOfDay(ZoneId.systemDefault()).toInstant(),
                    ZoneId.systemDefault());
        }
    }

    @Autowired
    private IEncuentroService encuentroService;

    @Autowired
    private TorneoService torneoService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private EncuentroDao encuentroDao;

    @Autowired
    private JornadaDao jornadaDao;

    @Autowired
    private NotificationDao notificationDao;

    private User createUser(String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    private Inscripcion inscribirEquipo(User capitan, Torneo torneo, Equipo equipo)
            throws InstanceNotFoundException, PermissionException {
        Solicitud solicitud = torneoService.solicitarInscripcion(
                capitan.getId(), torneo.getId(), equipo.getId(), null);
        return torneoService.aprobarInscripcion(
                torneo.getOrganizador().getId(), solicitud.getId());
    }

    private Encuentro crearEncuentro(User org, User cap1, User cap2, String suffix)
            throws InstanceNotFoundException, PermissionException {
        Torneo torneo = new Torneo(org, "Torneo Recordatorio " + suffix, false, "T99-" + suffix);
        torneo.setPuntosVictoria(3);
        torneo.setPuntosEmpate(1);
        torneo.setPuntosDerrota(0);
        torneo = torneoService.crearTorneo(org.getId(), torneo, false);

        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoLocal" + suffix, "equipo local");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoVisitante" + suffix, "equipo visitante");

        inscribirEquipo(cap1, torneo, equipo1);
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), TipoTorneo.LIGA_UNICA, 1, 2, false, false, null, null, null);

        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        return jornadas.get(0).getEncuentros().get(0);
    }

    private void fijarFecha(Encuentro encuentro, LocalDateTime fecha) {
        encuentro.setFechaRealizacion(fecha);
        encuentroDao.save(encuentro);
    }

    private boolean existeRecordatorio(Long userId, Long encuentroId) {
        return notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                userId, encuentroId, Notification.TipoNotificacion.RECORDATORIO_PARTIDO).isPresent();
    }

    // tests de generarRecordatoriosPartidos

    @Test
    public void testGeneraRecordatorioParaPartidoDentroDeLaAntelacion()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec1");
        User cap1 = createUser("cap_rec1_1");
        User cap2 = createUser("cap_rec1_2");

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "A");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 11, 18, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertTrue(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testNoGeneraRecordatorioSiNotificacionesDesactivadas()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec2");
        User cap1 = createUser("cap_rec2_1");
        User cap2 = createUser("cap_rec2_2");

        cap1.setNotificacionesPartidos(false);
        userDao.save(cap1);

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "B");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 11, 18, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertFalse(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testRecordatorioIdempotente() throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec3");
        User cap1 = createUser("cap_rec3_1");
        User cap2 = createUser("cap_rec3_2");

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "C");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 11, 18, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());
        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        List<Notification> recordatorios = notificationDao.findByUsuarioId(cap1.getId(),
                PageRequest.of(0, 10)).getContent().stream()
                .filter(n -> n.getTipo() == Notification.TipoNotificacion.RECORDATORIO_PARTIDO)
                .filter(n -> n.getReferenciaId().equals(encuentro.getId()))
                .toList();
        assertEquals(1, recordatorios.size());
    }

    @Test
    public void testNoGeneraRecordatorioSiLaFechaNoCoincide()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec4");
        User cap1 = createUser("cap_rec4_1");
        User cap2 = createUser("cap_rec4_2");

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "D");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 12, 18, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertFalse(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testNoGeneraRecordatorioSiElPartidoYaJugado()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec5");
        User cap1 = createUser("cap_rec5_1");
        User cap2 = createUser("cap_rec5_2");

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "E");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 11, 18, 0));

        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(null, 1, 25, 20));
        sets.add(new SetEntity(null, 2, 25, 18));
        sets.add(new SetEntity(null, 3, 25, 20));
        encuentroService.registrarResultado(cap1.getId(), encuentro.getId(), sets);

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertFalse(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testGeneraRecordatorioConAntelacionConfigurable()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec6");
        User cap1 = createUser("cap_rec6_1");
        User cap2 = createUser("cap_rec6_2");

        cap1.setDiasAntelacionPartidos(3);
        userDao.save(cap1);

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "F");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 13, 18, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertTrue(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testGeneraRecordatorioConAntelacionCero()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec7");
        User cap1 = createUser("cap_rec7_1");
        User cap2 = createUser("cap_rec7_2");

        cap1.setDiasAntelacionPartidos(0);
        userDao.save(cap1);

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "G");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 10, 20, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertTrue(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testAntelacionNegativaTratadaComoCero()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec8");
        User cap1 = createUser("cap_rec8_1");
        User cap2 = createUser("cap_rec8_2");

        cap1.setDiasAntelacionPartidos(-5);
        userDao.save(cap1);

        Encuentro encuentro = crearEncuentro(org, cap1, cap2, "H");
        fijarFecha(encuentro, LocalDateTime.of(2025, 6, 10, 20, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertTrue(existeRecordatorio(cap1.getId(), encuentro.getId()));
    }

    @Test
    public void testGeneraUnRecordatorioPorCadaEncuentro()
            throws InstanceNotFoundException, PermissionException {
        User org = createUser("org_rec9");
        User cap1 = createUser("cap_rec9_1");
        User cap2 = createUser("cap_rec9_2");
        User cap3 = createUser("cap_rec9_3");

        Encuentro enc1 = crearEncuentro(org, cap1, cap2, "I");
        Encuentro enc2 = crearEncuentro(org, cap1, cap3, "J");
        fijarFecha(enc1, LocalDateTime.of(2025, 6, 11, 18, 0));
        fijarFecha(enc2, LocalDateTime.of(2025, 6, 11, 19, 0));

        encuentroService.generarRecordatoriosPartidos(cap1.getId());

        assertTrue(existeRecordatorio(cap1.getId(), enc1.getId()));
        assertTrue(existeRecordatorio(cap1.getId(), enc2.getId()));
    }

    @Test
    public void testUsuarioNoExistente() {
        assertThrows(InstanceNotFoundException.class,
                () -> encuentroService.generarRecordatoriosPartidos(999999L));
    }
}
