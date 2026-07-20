package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    public void registrarResultado(Long encuentroId, List<SetEntity> sets)
            throws InstanceNotFoundException, IllegalArgumentException {

        Encuentro encuentro = encuentroDao.findById(encuentroId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.encuentro", encuentroId));

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
        Equipo ganador = encuentro.getGanador();
        Equipo perdedor = ganador.equals(encuentro.getLocal()) ? encuentro.getVisitante() : encuentro.getLocal();

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
    }

    @Override
    public void solicitarAplazamiento(Long capitanId, Long encuentroId, LocalDateTime fecha, String motivo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        User capitan = permissionChecker.checkUser(capitanId);
        Encuentro encuentro = encuentroDao.findById(encuentroId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.encuentro", encuentroId));

        // verificar que el capitan pertenece a uno de los equipos del encuentro
        boolean esCapitanLocal = encuentro.getLocal().getCreador().getId().equals(capitanId);
        boolean esCapitanVisitante = encuentro.getVisitante().getCreador().getId().equals(capitanId);

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
