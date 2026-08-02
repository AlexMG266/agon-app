package es.udc.agon.backend.test.model.entities;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import org.junit.jupiter.api.Test;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstadoEncuentro;
import es.udc.agon.backend.model.entities.EstadoEquipo;
import es.udc.agon.backend.model.entities.EstadoInscripcion;
import es.udc.agon.backend.model.entities.EstadoSolicitud;
import es.udc.agon.backend.model.entities.EstadoTorneo;
import es.udc.agon.backend.model.entities.Grupo;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.SeguimientoTorneo;
import es.udc.agon.backend.model.entities.SetEntity;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.SolicitudAplazamiento;
import es.udc.agon.backend.model.entities.TipoFase;
import es.udc.agon.backend.model.entities.TipoJornada;
import es.udc.agon.backend.model.entities.TipoSolicitud;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.services.Block;

public class EntityTest {

    private User buildUser(Long id, String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        user.setId(id);
        return user;
    }

    private Equipo buildEquipo(Long id, User creador) {
        Equipo equipo = new Equipo("Equipo " + id, "Desc", creador);
        equipo.setId(id);
        return equipo;
    }

    private Torneo buildTorneo(Long id, User org) {
        Torneo torneo = new Torneo(org, "Torneo " + id, false, "T99-XXXX");
        torneo.setId(id);
        return torneo;
    }

    @Test
    public void inscripcionActualizarEstadisticasVictoria() {
        User org = buildUser(1L, "org");
        Equipo equipo = buildEquipo(2L, org);
        Torneo torneo = buildTorneo(3L, org);
        torneo.setPuntosVictoria(4);
        torneo.setPuntosEmpate(2);
        torneo.setPuntosDerrota(1);
        Inscripcion insc = new Inscripcion(torneo, equipo);
        insc.actualizarEstadisticas(3, 1);
        assertEquals(1, insc.getPartidosJugados());
        assertEquals(1, insc.getPartidosGanados());
        assertEquals(0, insc.getPartidosEmpatados());
        assertEquals(0, insc.getPartidosPerdidos());
        assertEquals(3, insc.getSetsGanados());
        assertEquals(1, insc.getSetsPerdidos());
        assertEquals(4, insc.getPuntosLiga());
    }

    @Test
    public void inscripcionActualizarEstadisticasEmpate() {
        User org = buildUser(1L, "org");
        Equipo equipo = buildEquipo(2L, org);
        Torneo torneo = buildTorneo(3L, org);
        torneo.setPuntosVictoria(4);
        torneo.setPuntosEmpate(2);
        torneo.setPuntosDerrota(1);
        Inscripcion insc = new Inscripcion(torneo, equipo);
        insc.actualizarEstadisticas(2, 2);
        assertEquals(1, insc.getPartidosJugados());
        assertEquals(0, insc.getPartidosGanados());
        assertEquals(1, insc.getPartidosEmpatados());
        assertEquals(0, insc.getPartidosPerdidos());
        assertEquals(2, insc.getPuntosLiga());
    }

    @Test
    public void inscripcionActualizarEstadisticasDerrota() {
        User org = buildUser(1L, "org");
        Equipo equipo = buildEquipo(2L, org);
        Torneo torneo = buildTorneo(3L, org);
        torneo.setPuntosVictoria(4);
        torneo.setPuntosEmpate(2);
        torneo.setPuntosDerrota(1);
        Inscripcion insc = new Inscripcion(torneo, equipo);
        insc.actualizarEstadisticas(1, 3);
        assertEquals(1, insc.getPartidosJugados());
        assertEquals(0, insc.getPartidosGanados());
        assertEquals(0, insc.getPartidosEmpatados());
        assertEquals(1, insc.getPartidosPerdidos());
        assertEquals(1, insc.getPuntosLiga());
    }

    @Test
    public void inscripcionActualizarEstadisticasSinTorneoUsaDefaults() {
        Equipo equipo = buildEquipo(2L, buildUser(1L, "org"));
        Inscripcion insc = new Inscripcion(null, equipo);
        insc.actualizarEstadisticas(3, 0);
        assertEquals(3, insc.getPuntosLiga());
        assertEquals(1, insc.getPartidosGanados());
        insc.actualizarEstadisticas(2, 2);
        assertEquals(4, insc.getPuntosLiga());
        assertEquals(1, insc.getPartidosEmpatados());
        insc.actualizarEstadisticas(0, 3);
        assertEquals(4, insc.getPuntosLiga());
        assertEquals(1, insc.getPartidosPerdidos());
        assertEquals(3, insc.getPartidosJugados());
    }

    @Test
    public void inscripcionConstructores() {
        User org = buildUser(1L, "org");
        Equipo equipo = buildEquipo(2L, org);
        Torneo torneo = buildTorneo(3L, org);
        Grupo grupo = new Grupo(torneo, "Grupo A");
        Inscripcion conGrupo = new Inscripcion(torneo, equipo, grupo);
        assertEquals(grupo, conGrupo.getGrupo());
        assertEquals(EstadoInscripcion.ACTIVA, conGrupo.getEstadoInscripcion());
        assertEquals(0, conGrupo.getPartidosJugados());
        Inscripcion sinGrupo = new Inscripcion(torneo, equipo);
        assertNull(sinGrupo.getGrupo());
        assertEquals(EstadoInscripcion.ACTIVA, sinGrupo.getEstadoInscripcion());
    }

    @Test
    public void encuentroGanadorNoJugadoDevuelveNull() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Encuentro enc = new Encuentro(null, local, visitante, LocalDateTime.now());
        assertNull(enc.getGanador());
    }

    @Test
    public void encuentroGanadorSinSetsDevuelveNull() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Encuentro enc = new Encuentro(null, local, visitante, LocalDateTime.now());
        enc.setEstadoEncuentro(EstadoEncuentro.JUGADO);
        assertNull(enc.getGanador());
    }

    @Test
    public void encuentroGanadorLocal() {
        Encuentro enc = encuentroJugadoConSets(3, 1);
        assertEquals(enc.getLocal(), enc.getGanador());
    }

    @Test
    public void encuentroGanadorVisitante() {
        Encuentro enc = encuentroJugadoConSets(1, 3);
        assertEquals(enc.getVisitante(), enc.getGanador());
    }

    @Test
    public void encuentroGanadorEmpateDevuelveNull() {
        Encuentro enc = encuentroJugadoConSets(2, 2);
        assertNull(enc.getGanador());
    }

    private Encuentro encuentroJugadoConSets(int setsLocal, int setsVisitante) {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Encuentro enc = new Encuentro(null, local, visitante, LocalDateTime.now());
        enc.setEstadoEncuentro(EstadoEncuentro.JUGADO);
        List<SetEntity> sets = new ArrayList<>();
        for (int i = 0; i < setsLocal; i++) {
            sets.add(new SetEntity(enc, i + 1, 25, 20));
        }
        for (int i = 0; i < setsVisitante; i++) {
            sets.add(new SetEntity(enc, setsLocal + i + 1, 20, 25));
        }
        enc.setSets(sets);
        return enc;
    }

    @Test
    public void encuentroPuntosLocalYVisitante() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Encuentro enc = new Encuentro(null, local, visitante, LocalDateTime.now());
        List<SetEntity> sets = new ArrayList<>();
        sets.add(new SetEntity(enc, 1, 25, 20));
        sets.add(new SetEntity(enc, 2, 20, 25));
        sets.add(new SetEntity(enc, 3, 25, 23));
        enc.setSets(sets);
        assertEquals(5, enc.getPuntosLocal());
        assertEquals(4, enc.getPuntosVisitante());
    }

    @Test
    public void encuentroConstructorFijaEstadoPendiente() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        LocalDateTime fecha = LocalDateTime.of(2026, 8, 5, 18, 0);
        Encuentro enc = new Encuentro(null, local, visitante, fecha);
        assertEquals(EstadoEncuentro.PENDIENTE, enc.getEstadoEncuentro());
        assertEquals(fecha, enc.getFechaRealizacion());
        assertTrue(enc.getSets().isEmpty());
        assertTrue(enc.getSolicitudesAplazamiento().isEmpty());
    }

    @Test
    public void grupoEstaLleno() {
        User org = buildUser(1L, "org");
        Torneo torneo = buildTorneo(2L, org);
        torneo.setEquiposPorGrupo(2);
        Grupo grupo = new Grupo(torneo, "Grupo A");
        assertFalse(grupo.estaLleno());
        grupo.getInscripciones().add(new Inscripcion(torneo, buildEquipo(3L, org), grupo));
        assertFalse(grupo.estaLleno());
        grupo.getInscripciones().add(new Inscripcion(torneo, buildEquipo(4L, org), grupo));
        assertTrue(grupo.estaLleno());
    }

    @Test
    public void solicitudAceptarYRechazar() {
        User candidato = buildUser(1L, "candidato");
        User decisor = buildUser(2L, "decisor");
        Equipo equipo = buildEquipo(3L, decisor);
        Solicitud solicitud = new Solicitud(candidato, decisor, equipo, TipoSolicitud.PETICION);
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertNotNull(solicitud.getFechaCreacion());
        solicitud.aceptar();
        assertEquals(EstadoSolicitud.ACEPTADO, solicitud.getEstado());
        solicitud.rechazar();
        assertEquals(EstadoSolicitud.RECHAZADO, solicitud.getEstado());
    }

    @Test
    public void solicitudConTorneo() {
        User candidato = buildUser(1L, "candidato");
        User decisor = buildUser(2L, "decisor");
        Equipo equipo = buildEquipo(3L, decisor);
        Torneo torneo = buildTorneo(4L, decisor);
        Solicitud solicitud = new Solicitud(candidato, decisor, equipo, torneo, TipoSolicitud.SOLICITUD_INSCRIPCION);
        assertEquals(torneo, solicitud.getTorneo());
        assertEquals(TipoSolicitud.SOLICITUD_INSCRIPCION, solicitud.getTipoSolicitud());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
    }

    @Test
    public void solicitudAplazamientoAceptarYCancelar() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Encuentro enc = new Encuentro(null, local, visitante, LocalDateTime.now());
        LocalDateTime fechaSolicitada = LocalDateTime.of(2026, 8, 10, 20, 0);
        SolicitudAplazamiento sol = new SolicitudAplazamiento(enc, local, fechaSolicitada);
        assertEquals(EstadoSolicitud.PENDIENTE, sol.getEstado());
        assertEquals(fechaSolicitada, sol.getFechaSolicitada());
        sol.aceptarSolicitud();
        assertEquals(EstadoSolicitud.ACEPTADO, sol.getEstado());
        sol.cancelarSolicitud();
        assertEquals(EstadoSolicitud.RECHAZADO, sol.getEstado());
    }

    @Test
    public void blockEqualsYHashCode() {
        Block<String> b1 = new Block<>(Arrays.asList("a", "b"), true);
        Block<String> b2 = new Block<>(Arrays.asList("a", "b"), true);
        Block<String> b3 = new Block<>(Arrays.asList("a", "c"), true);
        Block<String> b4 = new Block<>(Arrays.asList("a", "b"), false);
        assertEquals(b1, b1);
        assertEquals(b1, b2);
        assertEquals(b1.hashCode(), b2.hashCode());
        assertNotEquals(b1, b3);
        assertNotEquals(b1, b4);
        assertNotEquals(b1, null);
        assertNotEquals(b1, "cadena");
        Block<String> nulo = new Block<>(null, true);
        Block<String> otroNulo = new Block<>(null, true);
        assertEquals(nulo, otroNulo);
        assertNotEquals(nulo, b1);
        assertNotEquals(b1, nulo);
        assertNotEquals(nulo, new Block<>(null, false));
    }

    @Test
    public void equipoConstructorYMiembros() {
        User creador = buildUser(1L, "creador");
        Equipo equipo = new Equipo("Los Mejores", "desc", creador);
        assertEquals(EstadoEquipo.ACTIVO, equipo.getEstado());
        assertEquals(8, equipo.getCodigoEquipo().length());
        assertNotNull(equipo.getFechaCreacion());
        assertTrue(equipo.getMiembros().contains(creador));
        User otro = buildUser(2L, "otro");
        equipo.addMiembro(otro);
        assertTrue(equipo.getMiembros().contains(otro));
        equipo.removeMiembro(otro);
        assertFalse(equipo.getMiembros().contains(otro));
    }

    @Test
    public void userConstructoresYDefaults() {
        User completo = new User(2000, "nombre", "email@mail.com", "img.png", "pass",
                LocalDate.of(1999, 5, 5), false);
        assertEquals(2000, completo.getElo());
        assertEquals("email@mail.com", completo.getEmail());
        assertFalse(completo.isEloProvisional());
        assertEquals("USER", completo.getRole());
        assertTrue(completo.isNotificacionesPartidos());
        assertEquals(1, completo.getDiasAntelacionPartidos());
        User corto = new User("nombre", "email@mail.com", "img.png");
        assertEquals(1500, corto.getElo());
        assertTrue(corto.isEloProvisional());
        User conPassword = new User("nombre", "email@mail.com", "img.png", "pass", LocalDate.of(2001, 1, 1));
        assertEquals("pass", conPassword.getPassword());
        assertNotNull(conPassword.getFechaNacimiento());
    }

    @Test
    public void seguimientoTorneoConstructor() {
        User usuario = buildUser(1L, "usuario");
        Torneo torneo = buildTorneo(2L, usuario);
        SeguimientoTorneo seguimiento = new SeguimientoTorneo(usuario, torneo);
        assertEquals(usuario, seguimiento.getUsuario());
        assertEquals(torneo, seguimiento.getTorneo());
        assertNotNull(seguimiento.getFechaCreacion());
    }

    @Test
    public void torneoConstructorDefaults() {
        User org = buildUser(1L, "org");
        Torneo torneo = new Torneo(org, "Torneo", null, "T99-0001");
        assertFalse(torneo.getPrivado());
        assertEquals(EstadoTorneo.RECLUTANDO, torneo.getEstado());
        assertNull(torneo.getNumGrupos());
        assertNull(torneo.getEquiposPorGrupo());
        assertTrue(torneo.getGrupos().isEmpty());
        assertTrue(torneo.getJornadas().isEmpty());
        assertTrue(torneo.getInscripciones().isEmpty());
        Torneo privado = new Torneo(org, "Torneo Privado", true, "T99-0002");
        assertTrue(privado.getPrivado());
    }

    @Test
    public void notificationConstructoresYDefaults() {
        User usuario = buildUser(1L, "usuario");
        Notification simple = new Notification(usuario, "Asunto", "Cuerpo", Notification.TipoNotificacion.SYSTEM);
        assertFalse(simple.isLeido());
        assertFalse(simple.isPendienteDeAccion());
        assertNull(simple.getReferenciaId());
        assertNotNull(simple.getFechaCreacion());
        assertEquals(Notification.TipoNotificacion.SYSTEM, simple.getTipo());
        Notification completa = new Notification(usuario, "Asunto", "Cuerpo", true, true, 9L,
                Notification.TipoNotificacion.INVITACION);
        assertTrue(completa.isLeido());
        assertTrue(completa.isPendienteDeAccion());
        assertEquals(9L, completa.getReferenciaId());
    }

    @Test
    public void jornadaConstructorYEncuentros() {
        User org = buildUser(1L, "org");
        Torneo torneo = buildTorneo(2L, org);
        LocalDate fechaInicio = LocalDate.of(2026, 8, 10);
        Jornada jornada = new Jornada(torneo, 1, TipoFase.LIGA_GRUPO, TipoJornada.LIGA_4_SETS, fechaInicio, null);
        assertEquals(1, jornada.getNumeroJornada());
        assertEquals(TipoFase.LIGA_GRUPO, jornada.getTipoFase());
        assertEquals(fechaInicio, jornada.getFechaInicio());
        assertNull(jornada.getFechaFin());
        assertTrue(jornada.getEncuentros().isEmpty());
    }
}
