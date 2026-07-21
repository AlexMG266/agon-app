package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class TorneoServiceImpl implements TorneoService {

    private static final String QR_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private TorneoDao torneoDao;

    @Autowired
    private InscripcionDao inscripcionDao;

    @Autowired
    private JornadaDao jornadaDao;

    @Autowired
    private GrupoDao grupoDao;

    @Autowired
    private EquipoDao equipoDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Override
    @Transactional(readOnly = true)
    public List<Torneo> buscarTorneos(String filtro) {
        if (filtro == null || filtro.trim().isEmpty()) {
            return (List<Torneo>) torneoDao.findAll();
        }
        return torneoDao.findByNombreContainingIgnoreCase(filtro.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public Torneo consultarTorneo(Long torneoId) throws InstanceNotFoundException {
        return torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));
    }

    @Override
    public Torneo crearTorneo(Long organizadorId, Torneo torneo) throws InstanceNotFoundException {
        User organizador = permissionChecker.checkUser(organizadorId);
        torneo.setOrganizador(organizador);
        torneo.setEstado(EstadoTorneo.RECLUTANDO);
        // los grupos se crean al configurar la estructura (tras cerrar inscripciones)
        return torneoDao.save(torneo);
    }

    @Override
    public Inscripcion inscribirYValidarEquipo(Long capitanId, Long torneoId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.RECLUTANDO) {
            throw new IllegalArgumentException("El torneo no está en periodo de reclutamiento");
        }

        // buscar el equipo y verificar que el capitan es el creador
        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));

        if (!equipo.getCreador().getId().equals(capitanId)) {
            throw new PermissionException();
        }

        // comprobar que la inscripcion no existe ya para este equipo y torneo
        if (inscripcionDao.findByEquipoIdAndTorneoId(equipoId, torneoId).isPresent()) {
            throw new IllegalArgumentException("El equipo ya está inscrito en este torneo");
        }

        // contar las inscripciones actuales
        List<Inscripcion> inscripcionesActuales = inscripcionDao.findByTorneoId(torneoId);
        if (torneo.getNumGrupos() != null && torneo.getEquiposPorGrupo() != null) {
            // si ya se configuro la estructura, validar el maximo
            int maxEquipos = torneo.getNumGrupos() * torneo.getEquiposPorGrupo();
            if (inscripcionesActuales.size() >= maxEquipos) {
                throw new IllegalArgumentException("El torneo ya ha alcanzado el número máximo de equipos");
            }
        }
        // si aun no se configuro la estructura, no hay limite (aun no hay grupos)

        // al inscribirse aun no hay grupos, se asigna null — se reasignaran al configurar
        Inscripcion inscripcion = new Inscripcion(torneo, equipo);
        return inscripcionDao.save(inscripcion);
    }

    @Override
    public void cerrarInscripciones(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException {
        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.RECLUTANDO) {
            throw new IllegalArgumentException("El torneo no está en periodo de reclutamiento");
        }

        List<Inscripcion> inscripciones = inscripcionDao.findByTorneoId(torneoId);
        if (inscripciones.size() < 2) {
            throw new IllegalArgumentException("Debe haber al menos 2 equipos inscritos para cerrar las inscripciones");
        }

        torneo.setEstado(EstadoTorneo.INSCRIPCION_CERRADA);
        torneoDao.save(torneo);
    }

    @Override
    public Torneo configurarEstructuraYGenerarCalendario(Long torneoId, String tipoTorneo,
                                                          int numGrupos, int equiposPorGrupo,
                                                          boolean tienePlayoff, boolean idaVueltaPlayoff)
            throws InstanceNotFoundException, IllegalArgumentException {

        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.INSCRIPCION_CERRADA) {
            throw new IllegalArgumentException("El torneo debe estar en estado INSCRIPCION_CERRADA");
        }

        List<Inscripcion> inscripciones = inscripcionDao.findByTorneoId(torneoId);
        if (inscripciones.isEmpty()) {
            throw new IllegalArgumentException("No hay equipos inscritos en el torneo");
        }

        int capacidadTotal = numGrupos * equiposPorGrupo;
        if (capacidadTotal < inscripciones.size()) {
            throw new IllegalArgumentException(
                    "La capacidad total (" + capacidadTotal + ") es menor que el número de equipos inscritos ("
                    + inscripciones.size() + "). Aumenta el número de grupos o equipos por grupo.");
        }

        // guardar la configuracion estructural en el torneo
        torneo.setTipoTorneo(tipoTorneo);
        torneo.setNumGrupos(numGrupos);
        torneo.setEquiposPorGrupo(equiposPorGrupo);
        torneo.setTienePlayoff(tienePlayoff);
        torneo.setIdaVueltaPlayoff(idaVueltaPlayoff);

        // crear los grupos
        List<Grupo> grupos = new ArrayList<>();
        for (int i = 1; i <= numGrupos; i++) {
            Grupo grupo = new Grupo(torneo, "Grupo " + i);
            grupoDao.save(grupo);
            grupos.add(grupo);
        }
        torneo.setGrupos(grupos);

        // asignar equipos a los grupos (round-robin)
        int numEquipos = inscripciones.size();
        for (int i = 0; i < numEquipos; i++) {
            Grupo grupoAsignado = grupos.get(i % numGrupos);
            inscripciones.get(i).setGrupo(grupoAsignado);
            inscripcionDao.save(inscripciones.get(i));
        }

        // generar calendario de fase de grupos (round-robin dentro de cada grupo)
        List<Jornada> jornadasExistentes = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId);
        if (!jornadasExistentes.isEmpty()) {
            throw new IllegalArgumentException("El torneo ya tiene un calendario generado");
        }

        LocalDate fechaInicio = LocalDate.now().plusDays(7);
        int numeroJornada = 1;

        for (Grupo grupo : grupos) {
            List<Inscripcion> inscripcionesGrupo = new ArrayList<>();
            for (Inscripcion ins : inscripciones) {
                if (ins.getGrupo() != null && ins.getGrupo().getId().equals(grupo.getId())) {
                    inscripcionesGrupo.add(ins);
                }
            }
            int numEquiposGrupo = inscripcionesGrupo.size();

            if (numEquiposGrupo < 2) continue;

            // algoritmo round-robin: cada equipo juega contra todos los demas una vez
            for (int ronda = 0; ronda < numEquiposGrupo - 1; ronda++) {
                Jornada jornada = new Jornada(torneo, numeroJornada, TipoFase.LIGA_GRUPO,
                        TipoJornada.LIGA_4_SETS, fechaInicio, fechaInicio.plusDays(6));

                for (int i = 0; i < numEquiposGrupo / 2; i++) {
                    int idxLocal = (ronda + i) % (numEquiposGrupo - 1);
                    int idxVisitante = (numEquiposGrupo - 1 - i + ronda) % (numEquiposGrupo - 1);
                    if (i == 0) {
                        idxVisitante = numEquiposGrupo - 1;
                    }

                    Equipo equipoLocal = inscripcionesGrupo.get(idxLocal).getEquipo();
                    Equipo equipoVisitante = inscripcionesGrupo.get(idxVisitante).getEquipo();
                    Encuentro encuentro = new Encuentro(jornada, equipoLocal, equipoVisitante,
                            fechaInicio.atStartOfDay());
                    jornada.getEncuentros().add(encuentro);
                }

                jornadaDao.save(jornada);
                numeroJornada++;
                fechaInicio = fechaInicio.plusWeeks(1);
            }
        }

        // cambiar estado a FASE_GRUPOS
        torneo.setEstado(EstadoTorneo.FASE_GRUPOS);
        return torneoDao.save(torneo);
    }

    @Override
    public void generarCalendario(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException {
        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.FASE_GRUPOS) {
            throw new IllegalArgumentException("El torneo debe estar en fase de grupos para generar el calendario");
        }

        List<Jornada> jornadasExistentes = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId);
        if (!jornadasExistentes.isEmpty()) {
            throw new IllegalArgumentException("El torneo ya tiene un calendario generado");
        }

        List<Grupo> grupos = grupoDao.findByTorneoId(torneoId);
        LocalDate fechaInicio = LocalDate.now().plusDays(7);
        int numeroJornada = 1;

        for (Grupo grupo : grupos) {
            List<Inscripcion> inscripciones = inscripcionDao.findByGrupoId(grupo.getId());
            int numEquipos = inscripciones.size();

            // algoritmo round-robin: cada equipo juega contra todos los demas una vez
            for (int ronda = 0; ronda < numEquipos - 1; ronda++) {
                Jornada jornada = new Jornada(torneo, numeroJornada, TipoFase.LIGA_GRUPO,
                        TipoJornada.LIGA_4_SETS, fechaInicio, fechaInicio.plusDays(6));

                for (int i = 0; i < numEquipos / 2; i++) {
                    int idxLocal = (ronda + i) % (numEquipos - 1);
                    int idxVisitante = (numEquipos - 1 - i + ronda) % (numEquipos - 1);
                    if (i == 0) {
                        idxVisitante = numEquipos - 1;
                    }

                    Equipo equipoLocal = inscripciones.get(idxLocal).getEquipo();
                    Equipo equipoVisitante = inscripciones.get(idxVisitante).getEquipo();
                    Encuentro encuentro = new Encuentro(jornada, equipoLocal, equipoVisitante,
                            fechaInicio.atStartOfDay());
                    jornada.getEncuentros().add(encuentro);
                }

                jornadaDao.save(jornada);
                numeroJornada++;
                fechaInicio = fechaInicio.plusWeeks(1);
            }
        }
    }

    @Override
    public String generarCodigoQR(Long torneoId) throws InstanceNotFoundException {
        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        // genera un codigo qr simulado de 16 caracteres
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(QR_CHARS.charAt(RANDOM.nextInt(QR_CHARS.length())));
        }
        String qrCode = "TORNEO-" + sb;
        return qrCode;
    }

    @Override
    public void gestionarJornadas(Long torneoId, Long jornadaId, EstadoJornada nuevoEstado)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        Jornada jornada = jornadaDao.findById(jornadaId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.jornada", jornadaId));

        if (!jornada.getTorneo().getId().equals(torneoId)) {
            throw new IllegalArgumentException("La jornada no pertenece al torneo especificado");
        }

        jornada.setEstado(nuevoEstado);
        jornadaDao.save(jornada);
    }
}
