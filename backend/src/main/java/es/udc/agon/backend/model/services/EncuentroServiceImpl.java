package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class EncuentroServiceImpl implements IEncuentroService {

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

        LocalDate hoy = LocalDate.now();
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

        if (fecha == null || fecha.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha de aplazamiento debe ser futura");
        }

        Equipo equipoSolicitante = esCapitanLocal ? encuentro.getLocal() : encuentro.getVisitante();

        SolicitudAplazamiento solicitud = new SolicitudAplazamiento(encuentro, equipoSolicitante, fecha);
        solicitudAplazamientoDao.save(solicitud);

        encuentro.setEstadoEncuentro(EstadoEncuentro.SOLICITADO_APLAZAMIENTO);
        encuentroDao.save(encuentro);
    }
}
