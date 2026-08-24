package es.udc.agon.backend.test.rest.dtos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.EstrategiaDistribucion;
import es.udc.agon.backend.model.entities.EstrategiaPlayoff;
import es.udc.agon.backend.model.entities.EstadoEncuentro;
import es.udc.agon.backend.model.entities.EstadoEquipo;
import es.udc.agon.backend.model.entities.EstadoSolicitud;
import es.udc.agon.backend.model.entities.Grupo;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.RondaPlayoff;
import es.udc.agon.backend.model.entities.SetEntity;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.TipoFase;
import es.udc.agon.backend.model.entities.TipoJornada;
import es.udc.agon.backend.model.entities.TipoSolicitud;
import es.udc.agon.backend.model.entities.TipoTorneo;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.services.Block;
import es.udc.agon.backend.rest.dtos.BlockDto;
import es.udc.agon.backend.rest.dtos.EncuentroDto;
import es.udc.agon.backend.rest.dtos.EquipoConversor;
import es.udc.agon.backend.rest.dtos.EquipoDto;
import es.udc.agon.backend.rest.dtos.FechaEncuentrosDto;
import es.udc.agon.backend.rest.dtos.InscripcionDto;
import es.udc.agon.backend.rest.dtos.NotificationConversor;
import es.udc.agon.backend.rest.dtos.NotificationDto;
import es.udc.agon.backend.rest.dtos.JornadaDto;
import es.udc.agon.backend.rest.dtos.SetDto;
import es.udc.agon.backend.rest.dtos.SolicitudDto;
import es.udc.agon.backend.rest.dtos.TorneoConversor;
import es.udc.agon.backend.rest.dtos.TorneoDto;
import es.udc.agon.backend.rest.dtos.UserConversor;
import es.udc.agon.backend.rest.dtos.UserDto;

public class ConversorTest {

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
    public void toUserDtoCompleto() {
        User user = buildUser(7L, "jugador");
        UserDto dto = UserConversor.toUserDto(user);
        assertEquals(7L, dto.getId());
        assertEquals(1500, dto.getElo());
        assertEquals("jugador", dto.getNombre());
        assertEquals("jugador@mail.com", dto.getEmail());
        assertEquals("img.png", dto.getImagenPerfil());
        assertEquals(LocalDate.of(2000, 1, 1), dto.getFechaNacimiento());
        assertTrue(dto.isEloProvisional());
    }

    @Test
    public void toUserDesdeDto() {
        UserDto dto = new UserDto(1L, 1200, "nuevo", "nuevo@mail.com", "foto.png",
                LocalDate.of(1999, 5, 5), false);
        dto.setPassword("pass");
        dto.setNotificacionesPartidos(true);
        dto.setDiasAntelacionPartidos(3);
        User user = UserConversor.toUser(dto);
        assertEquals("nuevo", user.getNombre());
        assertEquals(1200, user.getElo());
        assertEquals("nuevo@mail.com", user.getEmail());
        assertTrue(user.isNotificacionesPartidos());
        assertEquals(3, user.getDiasAntelacionPartidos());
    }

    @Test
    public void toTorneoDtoConInscripciones() {
        User org = buildUser(1L, "organizador");
        Equipo equipo = buildEquipo(2L, org);
        Torneo torneo = buildTorneo(3L, org);
        torneo.setNumGrupos(2);
        torneo.setEquiposPorGrupo(4);
        torneo.setTienePlayoff(true);
        torneo.setTipoTorneo(TipoTorneo.GRUPOS_PLAYOFF);
        torneo.setIdaVueltaPlayoff(true);
        torneo.setDiasDisponibles("LUNES,MIERCOLES");
        torneo.setFechasExcluidas("2026-08-01,2026-08-15");
        torneo.setFechaInicio(LocalDate.of(2026, 8, 1));
        torneo.setFechaFin(LocalDate.of(2026, 9, 30));
        torneo.setPuntosVictoria(3);
        torneo.setPuntosEmpate(1);
        torneo.setPuntosDerrota(0);
        torneo.setFormatoPartidos("MEJOR_DE_3");
        torneo.setHoraInicio("10:00");
        torneo.setHoraFin("20:00");
        torneo.setDuracionPartido(60);
        torneo.setEstrategiaDistribucion(EstrategiaDistribucion.JORNADAS);
        torneo.setDiasEntreJornadas(3);
        torneo.setEstrategiaPlayoff(EstrategiaPlayoff.RAPIDO);
        torneo.setDiasEntrePlayoff(1);
        torneo.setRondaInicioPlayoff(RondaPlayoff.CUARTOS);

        Grupo grupo = new Grupo(torneo, "Grupo A");
        grupo.setId(9L);
        Inscripcion inscripcion = new Inscripcion(torneo, equipo, grupo);
        inscripcion.setId(5L);
        inscripcion.setPartidosJugados(3);
        inscripcion.setPartidosGanados(2);
        inscripcion.setPartidosEmpatados(1);
        inscripcion.setPartidosPerdidos(0);
        inscripcion.setSetsGanados(6);
        inscripcion.setSetsPerdidos(3);
        inscripcion.setPuntosLiga(7);
        List<Inscripcion> inscripciones = new ArrayList<>();
        inscripciones.add(inscripcion);
        torneo.setInscripciones(inscripciones);

        TorneoDto dto = TorneoConversor.toTorneoDto(torneo);
        assertEquals(3L, dto.getId());
        assertEquals("Torneo 3", dto.getNombre());
        assertEquals(2, dto.getNumGrupos());
        assertEquals(4, dto.getEquiposPorGrupo());
        assertTrue(dto.isTienePlayoff());
        assertEquals("RECLUTANDO", dto.getEstado());
        assertEquals(1L, dto.getOrganizadorId());
        assertTrue(dto.isIdaVueltaPlayoff());
        assertEquals(1, dto.getNumEquiposInscritos());
        assertEquals(Arrays.asList("LUNES", "MIERCOLES"), dto.getDiasDisponibles());
        assertEquals(Arrays.asList("2026-08-01", "2026-08-15"), dto.getFechasExcluidas());
        assertEquals(LocalDate.of(2026, 8, 1), dto.getFechaInicio());
        assertEquals(LocalDate.of(2026, 9, 30), dto.getFechaFin());
        assertEquals(3, dto.getPuntosVictoria());
        assertEquals("MEJOR_DE_3", dto.getFormatoPartidos());
        assertEquals("CUARTOS", dto.getRondaInicioPlayoff());

        assertNotNull(dto.getInscripciones());
        InscripcionDto insDto = dto.getInscripciones().get(0);
        assertEquals(2L, insDto.getEquipoId());
        assertEquals("Equipo 2", insDto.getNombreEquipo());
        assertEquals(1L, insDto.getCreadorId());
        assertEquals(9L, insDto.getGrupoId());
        assertEquals("Grupo A", insDto.getGrupoNombre());
        assertEquals(3, insDto.getPartidosJugados());
        assertEquals(2, insDto.getPartidosGanados());
        assertEquals(1, insDto.getPartidosEmpatados());
        assertEquals(0, insDto.getPartidosPerdidos());
        assertEquals(6, insDto.getSetsGanados());
        assertEquals(3, insDto.getSetsPerdidos());
        assertEquals(3, insDto.getDiferenciaSets());
        assertEquals(7, insDto.getPuntosLiga());
        assertEquals(1, insDto.getMiembros().size());
    }

    @Test
    public void toTorneoDtoSinInscripcionesYConNulos() {
        User org = buildUser(1L, "organizador");
        Torneo torneo = buildTorneo(3L, org);
        TorneoDto dto = TorneoConversor.toTorneoDto(torneo);
        assertEquals(0, dto.getNumGrupos());
        assertEquals(0, dto.getEquiposPorGrupo());
        assertFalse(dto.isTienePlayoff());
        assertFalse(dto.isIdaVueltaPlayoff());
        assertFalse(dto.isPrivado());
        assertEquals(0, dto.getNumEquiposInscritos());
        assertTrue(dto.getInscripciones().isEmpty());
        assertNull(dto.getDiasDisponibles());
        assertNull(dto.getFechasExcluidas());
    }

    @Test
    public void toTorneoDtosYBlock() {
        User org = buildUser(1L, "organizador");
        List<Torneo> torneos = new ArrayList<>();
        torneos.add(buildTorneo(1L, org));
        torneos.add(buildTorneo(2L, org));
        List<TorneoDto> dtos = TorneoConversor.toTorneoDtos(torneos);
        assertEquals(2, dtos.size());

        Block<Torneo> block = new Block<>(torneos, true);
        BlockDto<TorneoDto> blockDto = TorneoConversor.toBlockTorneoDtos(block);
        assertEquals(2, blockDto.getItems().size());
        assertTrue(blockDto.getExistMoreItems());
    }

    @Test
    public void toJornadaDtoConEncuentros() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Torneo torneo = buildTorneo(4L, org);
        Jornada jornada = new Jornada(torneo, 1, TipoFase.LIGA_GRUPO, TipoJornada.LIGA_4_SETS,
                LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 10));
        jornada.setId(5L);

        Encuentro enc = new Encuentro(jornada, local, visitante, LocalDateTime.of(2026, 8, 10, 10, 0));
        enc.setId(6L);
        enc.setEstadoEncuentro(EstadoEncuentro.JUGADO);
        SetEntity set1 = new SetEntity(enc, 1, 25, 20);
        SetEntity set2 = new SetEntity(enc, 2, 25, 18);
        SetEntity set3 = new SetEntity(enc, 3, 25, 20);
        enc.setSets(new ArrayList<>(Arrays.asList(set1, set2, set3)));
        jornada.setEncuentros(new ArrayList<>(Arrays.asList(enc)));

        JornadaDto dto = TorneoConversor.toJornadaDto(jornada);
        assertEquals(5L, dto.getId());
        assertEquals(1, dto.getNumeroJornada());
        assertEquals("LIGA_GRUPO", dto.getTipoFase());
        assertEquals(LocalDate.of(2026, 8, 10), dto.getFechaInicio());
        assertEquals(1, dto.getEncuentros().size());

        EncuentroDto encDto = dto.getEncuentros().get(0);
        assertEquals(6L, encDto.getId());
        assertEquals(2L, encDto.getEquipoLocalId());
        assertEquals("Equipo 2", encDto.getEquipoLocalNombre());
        assertEquals(3L, encDto.getEquipoVisitanteId());
        assertEquals("JUGADO", encDto.getEstado());
        assertEquals(2L, encDto.getGanadorId());
        assertEquals("3-0", encDto.getResultado());
        assertEquals(3, encDto.getSets().size());
        assertEquals(25, encDto.getSets().get(0).getGolesLocal());
    }

    @Test
    public void toJornadaDtoSinEncuentrosYFaseNula() {
        User org = buildUser(1L, "org");
        Torneo torneo = buildTorneo(2L, org);
        Jornada jornada = new Jornada(torneo, 1, TipoFase.LIGA_GRUPO, TipoJornada.LIGA_4_SETS, null, null);
        jornada.setId(3L);
        JornadaDto dto = TorneoConversor.toJornadaDto(jornada);
        assertEquals("LIGA_GRUPO", dto.getTipoFase());
        assertNull(dto.getFechaInicio());
        assertTrue(dto.getEncuentros().isEmpty());
    }

    @Test
    public void toJornadaDtosLista() {
        User org = buildUser(1L, "org");
        Torneo torneo = buildTorneo(2L, org);
        List<Jornada> jornadas = new ArrayList<>();
        jornadas.add(new Jornada(torneo, 1, TipoFase.LIGA_GRUPO, TipoJornada.LIGA_4_SETS, null, null));
        jornadas.add(new Jornada(torneo, 2, TipoFase.LIGA_GRUPO, TipoJornada.PLAYOFF_BEST_OF_5, null, null));
        List<JornadaDto> dtos = TorneoConversor.toJornadaDtos(jornadas);
        assertEquals(2, dtos.size());
    }

    @Test
    public void toFechaEncuentrosDtosAgrupados() {
        User org = buildUser(1L, "org");
        Equipo local = buildEquipo(2L, org);
        Equipo visitante = buildEquipo(3L, org);
        Torneo torneo = buildTorneo(4L, org);
        Jornada jornada = new Jornada(torneo, 1, TipoFase.LIGA_GRUPO, TipoJornada.LIGA_4_SETS, null, null);

        Encuentro enc1 = new Encuentro(jornada, local, visitante,
                LocalDateTime.of(2026, 8, 5, 10, 0));
        Encuentro enc2 = new Encuentro(jornada, visitante, local,
                LocalDateTime.of(2026, 8, 5, 12, 0));
        Encuentro enc3 = new Encuentro(jornada, local, visitante,
                LocalDateTime.of(2026, 8, 7, 10, 0));
        Encuentro encSinFecha = new Encuentro(jornada, local, visitante, null);

        List<Encuentro> encuentros = new ArrayList<>();
        encuentros.add(enc3);
        encuentros.add(enc1);
        encuentros.add(encSinFecha);
        encuentros.add(enc2);

        List<FechaEncuentrosDto> resultado = TorneoConversor.toFechaEncuentrosDtos(encuentros);
        // 3 fechas: 2026-08-07, 2026-08-05 y null
        assertEquals(3, resultado.size());
        assertEquals(LocalDate.of(2026, 8, 7), resultado.get(0).getFecha());
        assertEquals(1, resultado.get(0).getEncuentros().size());
        assertEquals(LocalDate.of(2026, 8, 5), resultado.get(1).getFecha());
        assertEquals(2, resultado.get(1).getEncuentros().size());
        assertNull(resultado.get(2).getFecha());
        assertEquals(1, resultado.get(2).getEncuentros().size());
    }

    @Test
    public void toFechaEncuentrosDtosVaciaONula() {
        assertTrue(TorneoConversor.toFechaEncuentrosDtos(null).isEmpty());
        assertTrue(TorneoConversor.toFechaEncuentrosDtos(new ArrayList<>()).isEmpty());
    }

    @Test
    public void toEquipoDtoCompleto() {
        User creador = buildUser(1L, "creador");
        Equipo equipo = buildEquipo(2L, creador);
        equipo.setEstado(EstadoEquipo.ACTIVO);
        EquipoDto dto = EquipoConversor.toEquipoDto(equipo);
        assertEquals(2L, dto.getId());
        assertEquals("Equipo 2", dto.getNombreEquipo());
        assertEquals("Desc", dto.getDescripcion());
        assertEquals("ACTIVO", dto.getEstado());
        assertEquals(1L, dto.getCreadorId());
        assertEquals(equipo.getCodigoEquipo(), dto.getCodigoEquipo());
        assertEquals(1, dto.getMiembros().size());
        assertNotNull(dto.getFechaCreacion());
        assertEquals(0L, dto.getNumPartidas());
    }

    @Test
    public void toEquipoDtoConNumPartidas() {
        User creador = buildUser(1L, "creador");
        Equipo equipo = buildEquipo(2L, creador);
        EquipoDto dto = EquipoConversor.toEquipoDto(equipo, 7);
        assertEquals(2L, dto.getId());
        assertEquals(7L, dto.getNumPartidas());
    }

    @Test
    public void toEquipoDtosLista() {
        User creador = buildUser(1L, "creador");
        List<Equipo> equipos = new ArrayList<>();
        equipos.add(buildEquipo(1L, creador));
        equipos.add(buildEquipo(2L, creador));
        assertEquals(2, EquipoConversor.toEquipoDtos(equipos).size());
    }

    @Test
    public void toSolicitudDto() {
        User candidato = buildUser(1L, "candidato");
        User decisor = buildUser(2L, "decisor");
        Equipo equipo = buildEquipo(3L, decisor);
        Torneo torneo = buildTorneo(4L, decisor);
        Solicitud solicitud = new Solicitud(candidato, decisor, equipo, torneo, TipoSolicitud.SOLICITUD_INSCRIPCION);
        solicitud.setId(5L);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setFechaCreacion(LocalDateTime.of(2026, 8, 2, 12, 0));
        SolicitudDto dto = EquipoConversor.toSolicitudDto(solicitud);
        assertEquals(5L, dto.getId());
        assertEquals(1L, dto.getCandidatoId());
        assertEquals(2L, dto.getDecisorId());
        assertEquals(3L, dto.getEquipoId());
        assertEquals("PENDIENTE", dto.getEstado());
        assertEquals("SOLICITUD_INSCRIPCION", dto.getTipoSolicitud());
        assertNotNull(dto.getFechaCreacion());
    }

    @Test
    public void setDtosBasicos() {
        SetDto setDto = new SetDto(1, 25, 20);
        assertEquals(1, setDto.getNumeroSet());
        assertEquals(25, setDto.getGolesLocal());
        assertEquals(20, setDto.getGolesVisitante());

        SetEntity set = new SetEntity(null, 2, 21, 25);
        assertEquals(21, set.getGolesLocal());
        assertEquals(25, set.getGolesVisitante());
    }

    @Test
    public void toNotificationDtoCompleto() {
        User usuario = buildUser(1L, "usuario");
        Notification notif = new Notification(usuario, "Asunto", "Cuerpo", true, true, 9L,
                Notification.TipoNotificacion.INVITACION);
        notif.setId(7L);
        notif.setFechaCreacion(LocalDateTime.of(2026, 8, 2, 12, 0));

        NotificationDto dto = NotificationConversor.toNotificationDto(notif);
        assertEquals(7L, dto.getId());
        assertEquals("Asunto", dto.getAsunto());
        assertEquals("Cuerpo", dto.getCuerpo());
        assertTrue(dto.isLeido());
        assertTrue(dto.isPendienteDeAccion());
        assertEquals(9L, dto.getReferenciaId());
        assertEquals("INVITACION", dto.getTipo());
        assertNotNull(dto.getFechaCreacion());
    }

    @Test
    public void toNotificationDtosLista() {
        User usuario = buildUser(1L, "usuario");
        List<Notification> notificaciones = new ArrayList<>();
        notificaciones.add(new Notification(usuario, "A1", "C1", Notification.TipoNotificacion.SYSTEM));
        notificaciones.add(new Notification(usuario, "A2", "C2", Notification.TipoNotificacion.SYSTEM));
        List<NotificationDto> dtos = NotificationConversor.toNotificationDtos(notificaciones);
        assertEquals(2, dtos.size());
        assertEquals("A1", dtos.get(0).getAsunto());
    }
}
