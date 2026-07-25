package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class TorneoServiceImpl implements TorneoService {

    private static final String QR_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final String CODIGO_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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

    @Autowired
    private SeguimientoTorneoDao seguimientoTorneoDao;

    @Autowired
    private SolicitudDao solicitudDao;

    @Autowired
    private NotificationDao notificationDao;

    @Override
    @Transactional(readOnly = true)
    public Block<Torneo> buscarTorneos(String filtro, String estadoFilter, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Torneo> torneoPage;

        // Convertir el filtro de estado a valores de EstadoTorneo
        List<EstadoTorneo> estados = null;
        if (estadoFilter != null && !estadoFilter.isBlank() && !"ALL".equalsIgnoreCase(estadoFilter)) {
            switch (estadoFilter.toUpperCase()) {
                case "RECLUTANDO":
                    estados = List.of(EstadoTorneo.RECLUTANDO);
                    break;
                case "EN_JUEGO":
                    estados = List.of(EstadoTorneo.INSCRIPCION_CERRADA, EstadoTorneo.FASE_GRUPOS, EstadoTorneo.PLAYOFF);
                    break;
                case "FINALIZADO":
                    estados = List.of(EstadoTorneo.FINALIZADO);
                    break;
                default:
                    // valor no reconocido -> sin filtro
                    break;
            }
        }

        if (estados != null) {
            if (filtro == null || filtro.trim().isEmpty()) {
                torneoPage = torneoDao.findByPrivadoFalseAndEstadoIn(estados, pageRequest);
            } else {
                torneoPage = torneoDao.findByNombreContainingIgnoreCaseAndPrivadoFalseAndEstadoIn(filtro.trim(), estados, pageRequest);
            }
        } else {
            if (filtro == null || filtro.trim().isEmpty()) {
                torneoPage = torneoDao.findByPrivadoFalse(pageRequest);
            } else {
                torneoPage = torneoDao.findByNombreContainingIgnoreCaseAndPrivadoFalse(filtro.trim(), pageRequest);
            }
        }

        return new Block<>(torneoPage.getContent(), torneoPage.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Torneo> obtenerTorneosOrganizador(Long organizadorId) {
        return torneoDao.findByOrganizadorId(organizadorId);
    }

    @Override
    @Transactional(readOnly = true)
    public Torneo consultarTorneo(Long torneoId) throws InstanceNotFoundException {
        return torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));
    }

    @Override
    public Torneo crearTorneo(Long organizadorId, Torneo torneo, Boolean privado) throws InstanceNotFoundException {
        User organizador = permissionChecker.checkUser(organizadorId);
        torneo.setOrganizador(organizador);
        torneo.setEstado(EstadoTorneo.RECLUTANDO);
        torneo.setPrivado(privado != null ? privado : false);
        torneo.setCodigoTorneo(generarCodigoUnico());
        // los grupos se crean al configurar la estructura (tras cerrar inscripciones)
        return torneoDao.save(torneo);
    }

    private String generarCodigoUnico() {
        StringBuilder sb;
        do {
            sb = new StringBuilder("T");
            sb.append(String.format("%02d", RANDOM.nextInt(100)));
            sb.append("-");
            for (int i = 0; i < 4; i++) {
                sb.append(CODIGO_CHARS.charAt(RANDOM.nextInt(CODIGO_CHARS.length())));
            }
        } while (torneoDao.findByCodigoTorneo(sb.toString()).isPresent());
        return sb.toString();
    }

    @Override
    public Solicitud solicitarInscripcion(Long capitanId, Long torneoId, Long equipoId, String codigoTorneo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.RECLUTANDO) {
            throw new IllegalArgumentException("El torneo no está en periodo de reclutamiento");
        }

        // validar codigo si el torneo es privado
        if (torneo.getPrivado() != null && torneo.getPrivado()) {
            if (codigoTorneo == null || codigoTorneo.isBlank() || !codigoTorneo.equals(torneo.getCodigoTorneo())) {
                throw new IllegalArgumentException("Código de torneo incorrecto");
            }
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

        // Comprobar que el usuario no tiene ya otro equipo inscrito en este torneo
        List<Inscripcion> inscripcionesUsuario = inscripcionDao.findByTorneoIdAndEquipo_Creador_Id(torneoId, capitanId);
        if (!inscripcionesUsuario.isEmpty()) {
            throw new IllegalArgumentException("Ya tienes un equipo inscrito en este torneo");
        }

        // Comprobar que no hay ya una solicitud pendiente para este equipo/torneo
        if (solicitudDao.findByCandidatoIdAndTorneoIdAndEstado(capitanId, torneoId, EstadoSolicitud.PENDIENTE).isPresent()) {
            throw new IllegalArgumentException("Ya tienes una solicitud pendiente para este torneo");
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

        User organizador = permissionChecker.checkUser(torneo.getOrganizador().getId());

        // Crear la solicitud de inscripcion (PENDIENTE)
        Solicitud solicitud = new Solicitud(equipo.getCreador(), organizador, equipo, torneo, TipoSolicitud.SOLICITUD_INSCRIPCION);
        solicitudDao.save(solicitud);

        // Crear notificacion al organizador
        String asunto = "Nueva solicitud de inscripción";
        String cuerpo = "El equipo \"" + equipo.getNombreEquipo() + "\" solicita inscribirse en el torneo \"" + torneo.getNombre() + "\".";
        Notification notificacion = new Notification(organizador, asunto, cuerpo,
                false, true, solicitud.getId(), Notification.TipoNotificacion.SOLICITUD_INSCRIPCION);
        notificationDao.save(notificacion);

        return solicitud;
    }

    @Override
    public Inscripcion aprobarInscripcion(Long organizadorId, Long solicitudId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Solicitud solicitud = solicitudDao.findById(solicitudId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.solicitud", solicitudId));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new IllegalArgumentException("La solicitud no está pendiente");
        }

        if (solicitud.getTipoSolicitud() != TipoSolicitud.SOLICITUD_INSCRIPCION) {
            throw new IllegalArgumentException("La solicitud no es de tipo inscripción");
        }

        Torneo torneo = solicitud.getTorneo();
        if (!torneo.getOrganizador().getId().equals(organizadorId)) {
            throw new PermissionException();
        }

        if (torneo.getEstado() != EstadoTorneo.RECLUTANDO) {
            throw new IllegalArgumentException("El torneo no está en periodo de reclutamiento");
        }

        Equipo equipo = solicitud.getEquipo();

        // Verificar que el equipo no esté ya inscrito
        if (inscripcionDao.findByEquipoIdAndTorneoId(equipo.getId(), torneo.getId()).isPresent()) {
            solicitud.rechazar();
            solicitudDao.save(solicitud);
            throw new IllegalArgumentException("El equipo ya está inscrito en este torneo");
        }

        // Contar inscripciones actuales y validar límite
        List<Inscripcion> inscripcionesActuales = inscripcionDao.findByTorneoId(torneo.getId());
        if (torneo.getNumGrupos() != null && torneo.getEquiposPorGrupo() != null) {
            int maxEquipos = torneo.getNumGrupos() * torneo.getEquiposPorGrupo();
            if (inscripcionesActuales.size() >= maxEquipos) {
                throw new IllegalArgumentException("El torneo ya ha alcanzado el número máximo de equipos");
            }
        }

        // Aceptar la solicitud y crear la inscripcion
        solicitud.aceptar();
        solicitudDao.save(solicitud);

        Inscripcion inscripcion = new Inscripcion(torneo, equipo);
        inscripcionDao.save(inscripcion);

        // Notificar al candidato que su solicitud fue aceptada
        String asunto = "Solicitud de inscripción aceptada";
        String cuerpo = "Tu solicitud para inscribir al equipo \"" + equipo.getNombreEquipo()
                + "\" en el torneo \"" + torneo.getNombre() + "\" ha sido aceptada.";
        Notification notificacion = new Notification(solicitud.getCandidato(), asunto, cuerpo,
                false, false, torneo.getId(), Notification.TipoNotificacion.SYSTEM);
        notificationDao.save(notificacion);

        return inscripcion;
    }

    @Override
    public void rechazarInscripcion(Long organizadorId, Long solicitudId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Solicitud solicitud = solicitudDao.findById(solicitudId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.solicitud", solicitudId));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new IllegalArgumentException("La solicitud no está pendiente");
        }

        if (solicitud.getTipoSolicitud() != TipoSolicitud.SOLICITUD_INSCRIPCION) {
            throw new IllegalArgumentException("La solicitud no es de tipo inscripción");
        }

        Torneo torneo = solicitud.getTorneo();
        if (!torneo.getOrganizador().getId().equals(organizadorId)) {
            throw new PermissionException();
        }

        solicitud.rechazar();
        solicitudDao.save(solicitud);

        // Notificar al candidato que su solicitud fue rechazada
        String asunto = "Solicitud de inscripción rechazada";
        String cuerpo = "Tu solicitud para inscribir al equipo \"" + solicitud.getEquipo().getNombreEquipo()
                + "\" en el torneo \"" + torneo.getNombre() + "\" ha sido rechazada.";
        Notification notificacion = new Notification(solicitud.getCandidato(), asunto, cuerpo,
                false, false, torneo.getId(), Notification.TipoNotificacion.SYSTEM);
        notificationDao.save(notificacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Solicitud> obtenerSolicitudesPendientes(Long torneoId) {
        return solicitudDao.findByTorneoId(torneoId).stream()
                .filter(s -> s.getTipoSolicitud() == TipoSolicitud.SOLICITUD_INSCRIPCION
                        && s.getEstado() == EstadoSolicitud.PENDIENTE)
                .collect(Collectors.toList());
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

        // crear los grupos (modificar la colección in-place para preservar la referencia de Hibernate)
        torneo.getGrupos().clear();
        for (int i = 1; i <= numGrupos; i++) {
            Grupo grupo = new Grupo(torneo, "Grupo " + i);
            grupoDao.save(grupo);
            torneo.getGrupos().add(grupo);
        }

        // asignar equipos a los grupos (round-robin)
        List<Grupo> grupos = torneo.getGrupos();
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
    @Transactional(readOnly = true)
    public Torneo buscarPorCodigo(String codigoTorneo) throws InstanceNotFoundException {
        return torneoDao.findByCodigoTorneo(codigoTorneo)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", codigoTorneo));
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
    @Transactional(readOnly = true)
    public List<Torneo> obtenerTorneosSeguidos(Long usuarioId) {
        List<SeguimientoTorneo> seguimientos = seguimientoTorneoDao.findByUsuarioId(usuarioId);
        return seguimientos.stream()
                .map(SeguimientoTorneo::getTorneo)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Torneo> obtenerTorneosInscritos(Long usuarioId) {
        // Obtener todos los equipos donde el usuario es creador O miembro
        List<Equipo> equiposCreador = equipoDao.findByCreadorId(usuarioId);
        List<Equipo> equiposMiembro = equipoDao.findByMiembrosId(usuarioId);

        // Combinar ambas listas evitando duplicados
        Set<Equipo> equipos = new HashSet<>();
        equipos.addAll(equiposCreador);
        equipos.addAll(equiposMiembro);

        // Obtener inscripciones de esos equipos y extraer torneos distintos
        return equipos.stream()
                .flatMap(equipo -> inscripcionDao.findByEquipoId(equipo.getId()).stream())
                .map(Inscripcion::getTorneo)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public void seguirTorneo(Long usuarioId, Long torneoId)
            throws InstanceNotFoundException, IllegalArgumentException {
        User usuario = permissionChecker.checkUser(usuarioId);
        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        // Comprobar si ya sigue el torneo
        if (seguimientoTorneoDao.findByUsuarioIdAndTorneoId(usuarioId, torneoId).isPresent()) {
            throw new IllegalArgumentException("Ya sigues este torneo");
        }

        SeguimientoTorneo seguimiento = new SeguimientoTorneo(usuario, torneo);
        seguimientoTorneoDao.save(seguimiento);
    }

    @Override
    @Transactional
    public void dejarDeSeguirTorneo(Long usuarioId, Long torneoId) {
        seguimientoTorneoDao.deleteByUsuarioIdAndTorneoId(usuarioId, torneoId);
    }

    @Override
    public Torneo actualizarTorneo(Long userId, Long torneoId, Torneo datos)
            throws InstanceNotFoundException, PermissionException {

        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (!torneo.getOrganizador().getId().equals(userId)) {
            throw new PermissionException();
        }

        // Solo actualizar campos no nulos en 'datos'
        if (datos.getNombre() != null) {
            torneo.setNombre(datos.getNombre());
        }
        if (datos.getFechaInicio() != null) {
            torneo.setFechaInicio(datos.getFechaInicio());
        }
        if (datos.getFechaFin() != null) {
            torneo.setFechaFin(datos.getFechaFin());
        }
        if (datos.getFechaLimiteInscripcion() != null) {
            torneo.setFechaLimiteInscripcion(datos.getFechaLimiteInscripcion());
        }
        if (datos.getPuntosVictoria() != null) {
            torneo.setPuntosVictoria(datos.getPuntosVictoria());
        }
        if (datos.getPuntosEmpate() != null) {
            torneo.setPuntosEmpate(datos.getPuntosEmpate());
        }
        if (datos.getPuntosDerrota() != null) {
            torneo.setPuntosDerrota(datos.getPuntosDerrota());
        }
        if (datos.getFormatoPartidos() != null) {
            torneo.setFormatoPartidos(datos.getFormatoPartidos());
        }
        if (datos.getCriterioDesempate() != null) {
            torneo.setCriterioDesempate(datos.getCriterioDesempate());
        }
        if (datos.getDiasDisponibles() != null) {
            torneo.setDiasDisponibles(datos.getDiasDisponibles());
        }
        if (datos.getHoraInicio() != null) {
            torneo.setHoraInicio(datos.getHoraInicio());
        }
        if (datos.getHoraFin() != null) {
            torneo.setHoraFin(datos.getHoraFin());
        }
        if (datos.getDuracionPartido() != null) {
            torneo.setDuracionPartido(datos.getDuracionPartido());
        }
        if (datos.getFechasExcluidas() != null) {
            torneo.setFechasExcluidas(datos.getFechasExcluidas());
        }
        if (datos.getEstrategiaDistribucion() != null) {
            torneo.setEstrategiaDistribucion(datos.getEstrategiaDistribucion());
        }

        return torneoDao.save(torneo);
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
