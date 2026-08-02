package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class EncuentroServiceImpl implements IEncuentroService {

    @Autowired
    private Clock clock;

    @Autowired
    private EncuentroDao encuentroDao;

    @Autowired
    private InscripcionDao inscripcionDao;

    @Autowired
    private SolicitudAplazamientoDao solicitudAplazamientoDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private EquipoDao equipoDao;

    @Autowired
    private NotificationDispatcher notificationDispatcher;

    @Autowired
    private NotificationDao notificationDao;

    @Override
    @Transactional(readOnly = true)
    public List<Encuentro> consultarEncuentrosPropios(Long userId) {
        // obtener todos los equipos del usuario
        List<Equipo> equipos = equipoDao.findByMiembrosId(userId);
        List<Encuentro> encuentros = new ArrayList<>();
        for (Equipo equipo : equipos) {
            encuentros.addAll(encuentroDao.findByEquipoId(equipo.getId()));
        }
        return encuentros;
    }

    @Override
    public void generarRecordatoriosPartidos(Long userId) throws InstanceNotFoundException {

        User user = permissionChecker.checkUser(userId);

        // si el usuario ha desactivado las notificaciones de partidos no se genera nada
        if (!user.isNotificacionesPartidos()) {
            return;
        }

        int diasAntelacion = Math.max(0, user.getDiasAntelacionPartidos());

        LocalDate hoy = LocalDate.now(clock);
        LocalDate fechaRecordatorio = hoy.plusDays(diasAntelacion);

        // solo recordatorios para partidos aún no jugados
        List<Encuentro> encuentros = consultarEncuentrosPropios(userId).stream()
                .filter(enc -> enc.getFechaRealizacion() != null)
                .filter(enc -> enc.getFechaRealizacion().toLocalDate().equals(fechaRecordatorio))
                .filter(enc -> enc.getEstadoEncuentro() != EstadoEncuentro.JUGADO)
                .toList();

        Set<Long> yaRecordados = new HashSet<>();
        for (Encuentro encuentro : encuentros) {
            Long encuentroId = encuentro.getId();
            if (yaRecordados.contains(encuentroId)) {
                continue;
            }
            // idempotencia: si ya existe un recordatorio para este encuentro no se duplica
            if (notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                    userId, encuentroId, Notification.TipoNotificacion.RECORDATORIO_PARTIDO).isPresent()) {
                yaRecordados.add(encuentroId);
                continue;
            }
            notificationDispatcher.recordatorioPartido(user, encuentro);
            yaRecordados.add(encuentroId);
        }
    }

    @Autowired
    private TorneoService torneoService;

    @Override
    public void registrarResultado(Long capitanId, Long encuentroId, List<SetEntity> sets)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        permissionChecker.checkUser(capitanId);
        Encuentro encuentro = encuentroDao.findById(encuentroId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.encuentro", encuentroId));

        // verificar que el capitan pertenece (como miembro) a uno de los equipos del encuentro
        boolean esCapitanLocal = encuentro.getLocal().getMiembros().stream()
                .anyMatch(miembro -> miembro.getId().equals(capitanId));
        boolean esCapitanVisitante = encuentro.getVisitante().getMiembros().stream()
                .anyMatch(miembro -> miembro.getId().equals(capitanId));

        if (!esCapitanLocal && !esCapitanVisitante) {
            throw new PermissionException();
        }

        if (encuentro.getEstadoEncuentro() == EstadoEncuentro.JUGADO) {
            throw new IllegalArgumentException("El encuentro ya tiene un resultado registrado");
        }

        if (sets == null || sets.isEmpty()) {
            throw new IllegalArgumentException("Debe proporcionar al menos un set");
        }

        // validar que los sets tengan valores coherentes
        for (SetEntity set : sets) {
            if (set.getGolesLocal() < 0 || set.getGolesVisitante() < 0) {
                throw new IllegalArgumentException("Los goles no pueden ser negativos");
            }
            if (set.getGolesLocal() == set.getGolesVisitante()) {
                throw new IllegalArgumentException("Un set no puede terminar en empate");
            }
        }

        // limpiar sets anteriores y asignar los nuevos
        encuentro.getSets().clear();
        int numeroSet = 1;
        for (SetEntity set : sets) {
            set.setEncuentro(encuentro);
            set.setNumeroSet(numeroSet++);
            encuentro.getSets().add(set);
        }

        encuentro.setEstadoEncuentro(EstadoEncuentro.JUGADO);
        encuentroDao.save(encuentro);

        // actualizar estadisticas de inscripciones
        // (el empate es posible: sets iguales, p.ej. 2-2, no hay ganador)
        // buscar la inscripcion del torneo asociada a cada equipo
        Jornada jornada = encuentro.getJornada();
        if (jornada != null && jornada.getTorneo() != null) {
            Long torneoId = jornada.getTorneo().getId();

            inscripcionDao.findByEquipoIdAndTorneoId(encuentro.getLocal().getId(), torneoId)
                    .ifPresent(insc -> {
                        int setsGanadosLocal = 0;
                        int setsPerdidosLocal = 0;
                        for (SetEntity set : sets) {
                            if (set.getGolesLocal() > set.getGolesVisitante()) {
                                setsGanadosLocal++;
                            } else {
                                setsPerdidosLocal++;
                            }
                        }
                        insc.actualizarEstadisticas(setsGanadosLocal, setsPerdidosLocal);
                        inscripcionDao.save(insc);
                    });

            inscripcionDao.findByEquipoIdAndTorneoId(encuentro.getVisitante().getId(), torneoId)
                    .ifPresent(insc -> {
                        int setsGanadosVisitante = 0;
                        int setsPerdidosVisitante = 0;
                        for (SetEntity set : sets) {
                            if (set.getGolesVisitante() > set.getGolesLocal()) {
                                setsGanadosVisitante++;
                            } else {
                                setsPerdidosVisitante++;
                            }
                        }
                        insc.actualizarEstadisticas(setsGanadosVisitante, setsPerdidosVisitante);
                        inscripcionDao.save(insc);
                    });
        }

        // si el torneo tiene playoffs y la fase de grupos esta completa, generar los playoffs automaticamente
        if (jornada != null && jornada.getTorneo() != null
                && Boolean.TRUE.equals(jornada.getTorneo().getTienePlayoff())) {
            Long torneoId = jornada.getTorneo().getId();
            List<Jornada> jornadasTorneo = torneoService.obtenerJornadas(torneoId);
            boolean faseGruposCompleta = true;
            boolean hayPlayoffsGenerados = false;
            for (Jornada j : jornadasTorneo) {
                if (j.getTipoFase() == TipoFase.ELIMINATORIA) {
                    hayPlayoffsGenerados = true;
                }
                if (j.getTipoFase() == TipoFase.LIGA_GRUPO) {
                    for (Encuentro e : j.getEncuentros()) {
                        if (e.getEstadoEncuentro() != EstadoEncuentro.JUGADO) {
                            faseGruposCompleta = false;
                            break;
                        }
                    }
                }
                if (!faseGruposCompleta) {
                    break;
                }
            }
            if (faseGruposCompleta && !hayPlayoffsGenerados) {
                torneoService.generarPlayoffs(torneoId);
            }
        }
    }

    @Override
    public void solicitarAplazamiento(Long capitanId, Long encuentroId, LocalDateTime fecha, String motivo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        User capitan = permissionChecker.checkUser(capitanId);
        Encuentro encuentro = encuentroDao.findById(encuentroId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.encuentro", encuentroId));

        // verificar que el capitan pertenece (como miembro) a uno de los equipos del encuentro
        boolean esCapitanLocal = encuentro.getLocal().getMiembros().stream()
                .anyMatch(miembro -> miembro.getId().equals(capitanId));
        boolean esCapitanVisitante = encuentro.getVisitante().getMiembros().stream()
                .anyMatch(miembro -> miembro.getId().equals(capitanId));

        if (!esCapitanLocal && !esCapitanVisitante) {
            throw new PermissionException();
        }

        if (encuentro.getEstadoEncuentro() == EstadoEncuentro.JUGADO) {
            throw new IllegalArgumentException("El encuentro ya ha sido jugado");
        }

        if (encuentro.getEstadoEncuentro() == EstadoEncuentro.SOLICITADO_APLAZAMIENTO) {
            throw new IllegalArgumentException("Ya hay una solicitud de aplazamiento pendiente");
        }

        if (fecha == null || fecha.isBefore(LocalDateTime.now(clock))) {
            throw new IllegalArgumentException("La fecha de aplazamiento debe ser futura");
        }

        // validar la fecha propuesta contra el horario del torneo
        validarFechaAplazamiento(encuentro, fecha);

        Equipo equipoSolicitante = esCapitanLocal ? encuentro.getLocal() : encuentro.getVisitante();
        Equipo equipoContrario = esCapitanLocal ? encuentro.getVisitante() : encuentro.getLocal();

        SolicitudAplazamiento solicitud = new SolicitudAplazamiento(encuentro, equipoSolicitante, fecha);
        solicitudAplazamientoDao.save(solicitud);

        encuentro.setEstadoEncuentro(EstadoEncuentro.SOLICITADO_APLAZAMIENTO);
        encuentroDao.save(encuentro);

        // notificar al capitan del equipo contrario para que acepte o rechace
        String fechaStr = fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        notificationDispatcher.notificacionAplazamientoSolicitada(
                equipoContrario.getCreador(),
                encuentro.getLocal() != null ? encuentro.getLocal().getNombreEquipo() : "?",
                encuentro.getVisitante() != null ? encuentro.getVisitante().getNombreEquipo() : "?",
                fechaStr,
                solicitud.getId());
    }

    @Override
    public void responderAplazamiento(Long capitanId, Long solicitudId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        permissionChecker.checkUser(capitanId);
        SolicitudAplazamiento solicitud = solicitudAplazamientoDao.findById(solicitudId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.solicitud", solicitudId));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new IllegalArgumentException("La solicitud ya no esta pendiente");
        }

        Encuentro encuentro = solicitud.getEncuentro();
        Equipo equipoSolicitante = solicitud.getEquipoSolicitante();
        Equipo equipoContrario = encuentro.getLocal().getId().equals(equipoSolicitante.getId())
                ? encuentro.getVisitante() : encuentro.getLocal();

        // solo el capitan del equipo contrario puede responder
        boolean esCapitanContrario = equipoContrario.getMiembros().stream()
                .anyMatch(miembro -> miembro.getId().equals(capitanId));
        if (!esCapitanContrario) {
            throw new PermissionException();
        }

        User capitanSolicitante = equipoSolicitante.getCreador();

        if (aceptar) {
            solicitud.aceptarSolicitud();
            solicitudAplazamientoDao.save(solicitud);

            encuentro.setFechaRealizacion(solicitud.getFechaSolicitada());
            encuentro.setEstadoEncuentro(EstadoEncuentro.APLAZADO);
            recalcularJornada(encuentro);
            encuentroDao.save(encuentro);

            String fechaStr = solicitud.getFechaSolicitada().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            notificationDispatcher.notificacionAplazamientoAceptada(
                    capitanSolicitante,
                    encuentro.getLocal() != null ? encuentro.getLocal().getNombreEquipo() : "?",
                    encuentro.getVisitante() != null ? encuentro.getVisitante().getNombreEquipo() : "?",
                    fechaStr);
        } else {
            solicitud.cancelarSolicitud();
            solicitudAplazamientoDao.save(solicitud);

            encuentro.setEstadoEncuentro(EstadoEncuentro.PENDIENTE);
            encuentroDao.save(encuentro);

            notificationDispatcher.notificacionAplazamientoRechazada(
                    capitanSolicitante,
                    encuentro.getLocal() != null ? encuentro.getLocal().getNombreEquipo() : "?",
                    encuentro.getVisitante() != null ? encuentro.getVisitante().getNombreEquipo() : "?");
        }

        // marcar la notificacion pendiente como procesada
        notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                capitanId, solicitudId, Notification.TipoNotificacion.SOLICITUD_APLAZAMIENTO)
                .ifPresent(notification -> {
                    notification.setLeido(true);
                    notification.setPendienteDeAccion(false);
                    notificationDao.save(notification);
                });
    }

    // comprueba que la fecha propuesta respeta el horario del torneo y no pisa otro encuentro
    private void validarFechaAplazamiento(Encuentro encuentro, LocalDateTime fecha) {
        Jornada jornada = encuentro.getJornada();
        Torneo torneo = jornada != null ? jornada.getTorneo() : null;
        if (torneo == null) {
            return;
        }

        // rango del torneo
        if (torneo.getFechaInicio() != null && fecha.toLocalDate().isBefore(torneo.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha propuesta esta fuera del rango del torneo");
        }
        if (torneo.getFechaFin() != null && fecha.toLocalDate().isAfter(torneo.getFechaFin())) {
            throw new IllegalArgumentException("La fecha propuesta esta fuera del rango del torneo");
        }

        // dia de la semana disponible
        Set<String> diasSet = torneo.getDiasDisponibles() != null && !torneo.getDiasDisponibles().isBlank()
                ? new HashSet<>(Arrays.asList(torneo.getDiasDisponibles().split(",")))
                : new HashSet<>(Arrays.asList("L", "M", "X", "J", "V", "S", "D"));
        Map<String, DayOfWeek> dayMap = new HashMap<>();
        dayMap.put("L", DayOfWeek.MONDAY);
        dayMap.put("M", DayOfWeek.TUESDAY);
        dayMap.put("X", DayOfWeek.WEDNESDAY);
        dayMap.put("J", DayOfWeek.THURSDAY);
        dayMap.put("V", DayOfWeek.FRIDAY);
        dayMap.put("S", DayOfWeek.SATURDAY);
        dayMap.put("D", DayOfWeek.SUNDAY);
        boolean diaValido = diasSet.stream()
                .map(dayMap::get)
                .filter(Objects::nonNull)
                .anyMatch(dow -> dow == fecha.getDayOfWeek());
        if (!diaValido) {
            throw new IllegalArgumentException("La fecha propuesta no es un dia disponible del torneo");
        }

        // fecha no excluida
        Set<LocalDate> fechasExcluidas = new HashSet<>();
        if (torneo.getFechasExcluidas() != null && !torneo.getFechasExcluidas().isEmpty()) {
            for (String f : torneo.getFechasExcluidas().split(",")) {
                fechasExcluidas.add(LocalDate.parse(f.trim()));
            }
        }
        if (fechasExcluidas.contains(fecha.toLocalDate())) {
            throw new IllegalArgumentException("La fecha propuesta esta excluida del torneo");
        }

        // hora dentro del rango del torneo
        int horaInicioMinutos = parseHora(torneo.getHoraInicio(), 16 * 60);
        int horaFinMinutos = parseHora(torneo.getHoraFin(), 22 * 60);
        int duracionMinutos = torneo.getDuracionPartido() != null ? torneo.getDuracionPartido() : 60;
        int minutosFecha = fecha.getHour() * 60 + fecha.getMinute();
        if (minutosFecha < horaInicioMinutos || minutosFecha + duracionMinutos > horaFinMinutos) {
            throw new IllegalArgumentException("La hora propuesta esta fuera del horario del torneo");
        }

        // no puede solaparse con otro encuentro ya programado del torneo
        LocalDateTime inicioNuevo = fecha;
        LocalDateTime finNuevo = fecha.plusMinutes(duracionMinutos);
        for (Jornada j : torneoService.obtenerJornadas(torneo.getId())) {
            for (Encuentro otro : j.getEncuentros()) {
                if (otro.getId() != null && otro.getId().equals(encuentro.getId())) {
                    continue;
                }
                if (otro.getFechaRealizacion() == null) {
                    continue;
                }
                LocalDateTime inicioOtro = otro.getFechaRealizacion();
                LocalDateTime finOtro = inicioOtro.plusMinutes(duracionMinutos);
                if (inicioNuevo.isBefore(finOtro) && finNuevo.isAfter(inicioOtro)) {
                    throw new IllegalArgumentException("La fecha propuesta coincide con otro encuentro del torneo");
                }
            }
        }
    }

    // mueve el encuentro a la jornada cuyo rango de fechas contiene la nueva fecha
    private void recalcularJornada(Encuentro encuentro) {
        Jornada jornadaActual = encuentro.getJornada();
        if (jornadaActual == null || jornadaActual.getTorneo() == null
                || encuentro.getFechaRealizacion() == null) {
            return;
        }
        Long torneoId = jornadaActual.getTorneo().getId();
        LocalDate fechaNueva = encuentro.getFechaRealizacion().toLocalDate();

        Jornada jornadaDestino = null;
        for (Jornada j : torneoService.obtenerJornadas(torneoId)) {
            if (j.getFechaInicio() != null && j.getFechaFin() != null
                    && !fechaNueva.isBefore(j.getFechaInicio()) && !fechaNueva.isAfter(j.getFechaFin())) {
                jornadaDestino = j;
                break;
            }
        }
        // si la fecha no cae en ninguna jornada se mantiene la actual
        if (jornadaDestino != null && !jornadaDestino.getId().equals(jornadaActual.getId())) {
            encuentro.setJornada(jornadaDestino);
        }
    }

    private int parseHora(String hora, int porDefecto) {
        if (hora == null || hora.isBlank()) {
            return porDefecto;
        }
        String[] partes = hora.split(":");
        return Integer.parseInt(partes[0].trim()) * 60 + Integer.parseInt(partes[1].trim());
    }
}
