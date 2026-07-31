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
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));
        if (torneo.getInscripciones() != null) {
            for (Inscripcion ins : torneo.getInscripciones()) {
                if (ins.getEquipo() != null) {
                    ins.getEquipo().getMiembros().size();
                }
            }
        }
        return torneo;
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

        // Marcar como procesada la notificacion original del organizador
        Optional<Notification> notificationOpt = notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                organizadorId, solicitudId, Notification.TipoNotificacion.SOLICITUD_INSCRIPCION);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setLeido(true);
            notification.setPendienteDeAccion(false);
            notificationDao.save(notification);
        }

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

        // Marcar como procesada la notificacion original del organizador
        Optional<Notification> notificationOpt = notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                organizadorId, solicitudId, Notification.TipoNotificacion.SOLICITUD_INSCRIPCION);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setLeido(true);
            notification.setPendienteDeAccion(false);
            notificationDao.save(notification);
        }

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
                                                          boolean tienePlayoff, boolean idaVueltaPlayoff,
                                                          String estrategiaPlayoff, Integer diasEntrePlayoff,
                                                          String fechaFin)
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
        // Compatibilidad: la estrategia 'UNIFORME' fue eliminada, se trata como 'RAPIDO'
        if ("UNIFORME".equals(estrategiaPlayoff)) {
            estrategiaPlayoff = "RAPIDO";
        }
        if ("UNIFORME".equals(torneo.getEstrategiaDistribucion())) {
            torneo.setEstrategiaDistribucion("RAPIDO");
        }
        torneo.setEstrategiaPlayoff(estrategiaPlayoff);
        torneo.setDiasEntrePlayoff(diasEntrePlayoff);

        // establecer la fecha de fin si se proporciona (puede ser null, y se calculará automáticamente)
        if (fechaFin != null && !fechaFin.isBlank()) {
            torneo.setFechaFin(LocalDate.parse(fechaFin));
        }

        // crear los grupos (modificar la colección in-place para preservar la referencia de Hibernate)
        torneo.getGrupos().clear();
        for (int i = 1; i <= numGrupos; i++) {
            Grupo grupo = new Grupo(torneo, "Grupo " + (char)('A' + i - 1));
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

        // Preparar los equipos de cada grupo y calcular el numero correcto de rondas
        // Algoritmo: circle method round-robin
        // - N par: N-1 rondas (cada equipo juega cada ronda)
        // - N impar: N rondas (un equipo descansa cada ronda)
        Map<Grupo, List<Inscripcion>> gruposConEquipos = new LinkedHashMap<>();
        int maxRondas = 0;
        for (Grupo grupo : grupos) {
            List<Inscripcion> inscripcionesGrupo = new ArrayList<>();
            for (Inscripcion ins : inscripciones) {
                if (ins.getGrupo() != null && ins.getGrupo().getId().equals(grupo.getId())) {
                    inscripcionesGrupo.add(ins);
                }
            }
            int numEquiposGrupo = inscripcionesGrupo.size();
            if (numEquiposGrupo >= 2) {
                gruposConEquipos.put(grupo, inscripcionesGrupo);
                // N par => N-1 rondas; N impar => N rondas
                int rondasGrupo = (numEquiposGrupo % 2 == 0) ? numEquiposGrupo - 1 : numEquiposGrupo;
                maxRondas = Math.max(maxRondas, rondasGrupo);
            }
        }

        // Leer configuracion de calendario del torneo
        LocalDate calFechaInicio = torneo.getFechaInicio() != null
                ? torneo.getFechaInicio() : LocalDate.now().plusDays(7);
        LocalDate calFechaFin = torneo.getFechaFin();

        // Si hay playoff, reservar espacio al final del rango para las eliminatorias
        LocalDate limiteFaseGrupos = calFechaFin;
        if (tienePlayoff && calFechaFin != null) {
            // Calcular separacion entre rondas de playoff segun su estrategia
            int diasEntrePlayoffCalc;
            String estrPlayoff = torneo.getEstrategiaPlayoff();
            if ("JORNADAS".equals(estrPlayoff)) {
                diasEntrePlayoffCalc = torneo.getDiasEntrePlayoff() != null ? torneo.getDiasEntrePlayoff() : 7;
            } else {
                // RAPIDO o null (backwards compatible): dia siguiente
                diasEntrePlayoffCalc = 1;
            }
            // Reservar para: cuartos, semifinal, final (3 rondas) — o 6 si ida/vuelta
            int rondasPlayoff = idaVueltaPlayoff ? 6 : 3;
            int reservaPlayoff = rondasPlayoff * diasEntrePlayoffCalc;
            limiteFaseGrupos = calFechaFin.minusDays(reservaPlayoff);
        }
        String[] diasDisponibles = torneo.getDiasDisponibles() != null
                ? torneo.getDiasDisponibles().split(",") : new String[]{"L","M","X","J","V","S","D"};
        Set<String> diasSet = new HashSet<>(Arrays.asList(diasDisponibles));
        Set<LocalDate> fechasExcluidasSet = new HashSet<>();
        if (torneo.getFechasExcluidas() != null && !torneo.getFechasExcluidas().isEmpty()) {
            for (String fechaStr : torneo.getFechasExcluidas().split(",")) {
                fechasExcluidasSet.add(LocalDate.parse(fechaStr.trim()));
            }
        }
        int horaInicioMinutos = torneo.getHoraInicio() != null
                ? Integer.parseInt(torneo.getHoraInicio().split(":")[0]) * 60
                  + Integer.parseInt(torneo.getHoraInicio().split(":")[1])
                : 16 * 60; // default 16:00
        int horaFinMinutos = torneo.getHoraFin() != null
                ? Integer.parseInt(torneo.getHoraFin().split(":")[0]) * 60
                  + Integer.parseInt(torneo.getHoraFin().split(":")[1])
                : 22 * 60; // default 22:00
        int duracionPartidoMinutos = torneo.getDuracionPartido() != null
                ? torneo.getDuracionPartido() : 60;

        // Mapa de clave de dia a DayOfWeek
        Map<String, java.time.DayOfWeek> dayMap = new HashMap<>();
        dayMap.put("L", java.time.DayOfWeek.MONDAY);
        dayMap.put("M", java.time.DayOfWeek.TUESDAY);
        dayMap.put("X", java.time.DayOfWeek.WEDNESDAY);
        dayMap.put("J", java.time.DayOfWeek.THURSDAY);
        dayMap.put("V", java.time.DayOfWeek.FRIDAY);
        dayMap.put("S", java.time.DayOfWeek.SATURDAY);
        dayMap.put("D", java.time.DayOfWeek.SUNDAY);

        Set<java.time.DayOfWeek> diasSemana = new HashSet<>();
        for (String d : diasSet) {
            java.time.DayOfWeek dow = dayMap.get(d);
            if (dow != null) diasSemana.add(dow);
        }

        int numeroJornada = 1;

        // Para cada ronda global, crear UNA jornada con partidos de TODOS los grupos
        for (int ronda = 0; ronda < maxRondas; ronda++) {
            // Encontrar el siguiente dia disponible que cumpla las condiciones
            LocalDate fechaJornada = null;
            int maxIter = 365; // safety limit
            int iter = 0;
            LocalDate searchDate = calFechaInicio;
            while (iter < maxIter) {
                if (limiteFaseGrupos != null && searchDate.isAfter(limiteFaseGrupos)) {
                    break;
                }
                if (diasSemana.contains(searchDate.getDayOfWeek()) && !fechasExcluidasSet.contains(searchDate)) {
                    fechaJornada = searchDate;
                    break;
                }
                searchDate = searchDate.plusDays(1);
                iter++;
            }

            if (fechaJornada == null) {
                // No hay dias disponibles dentro del rango, saltamos esta ronda
                break;
            }

            Jornada jornada = new Jornada(torneo, numeroJornada, TipoFase.LIGA_GRUPO,
                    TipoJornada.LIGA_4_SETS, fechaJornada, fechaJornada);

            int slotActual = 0;
            for (Map.Entry<Grupo, List<Inscripcion>> entry : gruposConEquipos.entrySet()) {
                List<Inscripcion> inscripcionesGrupo = entry.getValue();
                int N = inscripcionesGrupo.size();

                // Determinar las rondas que necesita este grupo
                int rondasNecesarias = (N % 2 == 0) ? N - 1 : N;
                if (ronda >= rondasNecesarias) {
                    continue; // este grupo ya completo sus rondas
                }

                // Circle method: para N impar, usar N+1 (bye virtual)
                int M = (N % 2 == 0) ? N : N + 1; // numero par de equipos (incluye bye si impar)

                for (int i = 0; i < M / 2; i++) {
                    int idxLocal = (ronda + i) % (M - 1);
                    int idxVisitante = (M - 1 - i + ronda) % (M - 1);
                    if (i == 0) {
                        idxVisitante = M - 1;
                    }

                    // Si N es impar, el indice M-1 es el "bye" (descansa)
                    if (idxLocal >= N || idxVisitante >= N) {
                        continue; // este equipo descansa esta ronda
                    }

                    Equipo equipoLocal = inscripcionesGrupo.get(idxLocal).getEquipo();
                    Equipo equipoVisitante = inscripcionesGrupo.get(idxVisitante).getEquipo();

                    // Calcular hora del encuentro
                    int minutosInicio = horaInicioMinutos + slotActual * duracionPartidoMinutos;
                    if (minutosInicio + duracionPartidoMinutos > horaFinMinutos) {
                        minutosInicio = horaInicioMinutos;
                    }
                    LocalDateTime fechaHoraEncuentro = fechaJornada.atTime(
                            minutosInicio / 60, minutosInicio % 60);

                    Encuentro encuentro = new Encuentro(jornada, equipoLocal, equipoVisitante,
                            fechaHoraEncuentro);
                    jornada.getEncuentros().add(encuentro);
                    slotActual++;
                }
            }

            if (!jornada.getEncuentros().isEmpty()) {
                jornadaDao.save(jornada);
            }
            numeroJornada++;
            // Avanzar segun la estrategia de distribucion
            String estrategia = torneo.getEstrategiaDistribucion();
            if ("JORNADAS".equals(estrategia)) {
                int diasEntre = torneo.getDiasEntreJornadas() != null ? torneo.getDiasEntreJornadas() : 7;
                calFechaInicio = fechaJornada.plusDays(diasEntre);
            } else {
                // RAPIDO o cualquier otro: dia siguiente
                calFechaInicio = fechaJornada.plusDays(1);
            }
        }

        // Validar que se generaron todas las jornadas necesarias
        int jornadasGeneradas = numeroJornada - 1;
        if (jornadasGeneradas < maxRondas) {
            // Eliminar las jornadas que se hayan creado parcialmente
            List<Jornada> jornadasCreadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId);
            for (Jornada j : jornadasCreadas) {
                jornadaDao.delete(j);
            }
            throw new IllegalArgumentException(
                    "No caben todas las jornadas en el rango de fechas seleccionado. "
                    + "Se necesitan " + maxRondas + " jornadas, pero solo caben " + jornadasGeneradas + ". "
                    + "Prueba a aumentar el rango de fechas, reducir los días entre jornadas, "
                    + "o seleccionar más días disponibles en la semana."
            );
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

    @Override
    @Transactional(readOnly = true)
    public List<Jornada> obtenerJornadas(Long torneoId) {
        return jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId);
    }

    @Override
    @Transactional(readOnly = true)
    public Solicitud obtenerSolicitud(Long solicitudId) throws InstanceNotFoundException {
        return solicitudDao.findById(solicitudId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.solicitud", solicitudId));
    }

    @Override
    public List<Jornada> generarPlayoffs(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException {

        Torneo torneo = torneoDao.findById(torneoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.torneo", torneoId));

        if (torneo.getTienePlayoff() == null || !torneo.getTienePlayoff()) {
            throw new IllegalArgumentException("El torneo no tiene playoffs configurados");
        }

        // ya existen jornadas de eliminatorias
        List<Jornada> jornadasTorneo = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId);
        boolean hayPlayoffs = jornadasTorneo.stream()
                .anyMatch(j -> j.getTipoFase() == TipoFase.ELIMINATORIA);
        if (hayPlayoffs) {
            throw new IllegalArgumentException("El torneo ya tiene playoffs generados");
        }

        // obtener los clasificados: los 2 mejores de cada grupo por puntos
        List<Grupo> grupos = grupoDao.findByTorneoId(torneoId);
        List<Equipo> clasificados = new ArrayList<>();
        for (Grupo grupo : grupos) {
            List<Inscripcion> inscripcionesGrupo = inscripcionDao.findByGrupoId(grupo.getId());
            inscripcionesGrupo.sort(Comparator.comparingInt(Inscripcion::getPuntosLiga).reversed()
                    .thenComparingInt(Inscripcion::getSetsGanados).reversed()
                    .thenComparingInt(Inscripcion::getSetsPerdidos));
            for (int i = 0; i < Math.min(2, inscripcionesGrupo.size()); i++) {
                clasificados.add(inscripcionesGrupo.get(i).getEquipo());
            }
        }

        if (clasificados.size() < 2) {
            throw new IllegalArgumentException("No hay suficientes equipos clasificados para los playoffs");
        }

        // rellenar hasta una potencia de 2 con "byes" (null) para el bracket
        int numEquipos = clasificados.size();
        int potencia = 1;
        while (potencia < numEquipos) {
            potencia *= 2;
        }
        while (clasificados.size() < potencia) {
            clasificados.add(null);
        }

        boolean idaVuelta = Boolean.TRUE.equals(torneo.getIdaVueltaPlayoff());
        String estrategia = torneo.getEstrategiaPlayoff();
        int diasEntre = 1;
        if ("JORNADAS".equals(estrategia)) {
            diasEntre = torneo.getDiasEntrePlayoff() != null ? torneo.getDiasEntrePlayoff() : 7;
        }

        int numeroJornada = jornadasTorneo.stream()
                .mapToInt(Jornada::getNumeroJornada)
                .max().orElse(0) + 1;

        // fecha de inicio: siguiente dia disponible segun la configuracion del torneo
        LocalDate fechaBase = LocalDate.now();
        if (torneo.getFechaFin() != null) {
            // si hay fechaFin, partir del ultimo encuentro de fase de grupos
            Jornada ultimaLiga = null;
            for (Jornada j : jornadasTorneo) {
                if (j.getTipoFase() == TipoFase.LIGA_GRUPO) {
                    ultimaLiga = j;
                }
            }
            if (ultimaLiga != null && ultimaLiga.getFechaFin() != null) {
                fechaBase = ultimaLiga.getFechaFin();
            }
        }

        int horaInicioMinutos = torneo.getHoraInicio() != null
                ? Integer.parseInt(torneo.getHoraInicio().split(":")[0]) * 60
                  + Integer.parseInt(torneo.getHoraInicio().split(":")[1])
                : 16 * 60;
        int horaFinMinutos = torneo.getHoraFin() != null
                ? Integer.parseInt(torneo.getHoraFin().split(":")[0]) * 60
                  + Integer.parseInt(torneo.getHoraFin().split(":")[1])
                : 22 * 60;
        int duracionPartidoMinutos = torneo.getDuracionPartido() != null
                ? torneo.getDuracionPartido() : 60;

        // construir el bracket de eliminatorias de forma idempotente:
        // se recrea el bracket a partir de los clasificados y de los resultados ya registrados.
        // Solo se crean encuentros cuyos dos participantes ya son conocidos (los byes avanzan solos
        // y los ganadores de encuentros jugados se van incorporando en rondas posteriores).
        List<Jornada> eliminatorias = jornadasTorneo.stream()
                .filter(j -> j.getTipoFase() == TipoFase.ELIMINATORIA)
                .sorted(Comparator.comparingInt(Jornada::getNumeroJornada))
                .collect(Collectors.toList());
        Map<Integer, Jornada> jornadaPorRonda = new LinkedHashMap<>();
        for (int i = 0; i < eliminatorias.size(); i++) {
            jornadaPorRonda.put(i, eliminatorias.get(i));
        }

        // copias finales para usar dentro de las lambdas del bracket
        final LocalDate fechaBaseFinal = fechaBase;
        final int diasEntreFinal = diasEntre;

        List<Equipo> rondaActual = new ArrayList<>(clasificados);
        int ronda = 0;
        while (rondaActual.size() > 1) {
            final int rondaIdx = ronda;
            Jornada jornadaRonda = jornadaPorRonda.computeIfAbsent(rondaIdx, r -> new Jornada(
                    torneo, numeroJornada + rondaIdx, TipoFase.ELIMINATORIA,
                    TipoJornada.PLAYOFF_BEST_OF_5,
                    fechaBaseFinal.plusDays((long) rondaIdx * diasEntreFinal),
                    fechaBaseFinal.plusDays((long) rondaIdx * diasEntreFinal)));

            int slotActual = jornadaRonda.getEncuentros().size();
            List<Equipo> siguienteRonda = new ArrayList<>();

            for (int i = 0; i < rondaActual.size(); i += 2) {
                Equipo a = rondaActual.get(i);
                Equipo b = (i + 1 < rondaActual.size()) ? rondaActual.get(i + 1) : null;

                // emparejamiento incompleto o bye doble: no hay nada que crear
                if (a == null && b == null) {
                    continue;
                }
                // bye: el equipo conocido avanza directamente
                if (a == null) {
                    siguienteRonda.add(b);
                    continue;
                }
                if (b == null) {
                    siguienteRonda.add(a);
                    continue;
                }

                // ambos equipos conocidos: comprobar si el encuentro ya existe
                boolean existe = jornadaRonda.getEncuentros().stream().anyMatch(e ->
                        (e.getLocal().getId().equals(a.getId()) && e.getVisitante().getId().equals(b.getId()))
                                || (e.getLocal().getId().equals(b.getId()) && e.getVisitante().getId().equals(a.getId())));

                if (!existe) {
                    int minutosInicio = horaInicioMinutos + slotActual * duracionPartidoMinutos;
                    if (minutosInicio + duracionPartidoMinutos > horaFinMinutos) {
                        minutosInicio = horaInicioMinutos;
                    }
                    LocalDateTime fechaHora = fechaBase.plusDays((long) rondaIdx * diasEntre)
                            .atTime(minutosInicio / 60, minutosInicio % 60);
                    Encuentro encuentro = new Encuentro(jornadaRonda, a, b, fechaHora);
                    jornadaRonda.getEncuentros().add(encuentro);
                    slotActual++;

                    if (idaVuelta) {
                        int minutosVuelta = horaInicioMinutos + slotActual * duracionPartidoMinutos;
                        if (minutosVuelta + duracionPartidoMinutos > horaFinMinutos) {
                            minutosVuelta = horaInicioMinutos;
                        }
                        LocalDateTime fechaHoraVuelta = fechaBase.plusDays((long) rondaIdx * diasEntre + 1)
                                .atTime(minutosVuelta / 60, minutosVuelta % 60);
                        Encuentro vuelta = new Encuentro(jornadaRonda, b, a, fechaHoraVuelta);
                        jornadaRonda.getEncuentros().add(vuelta);
                        slotActual++;
                    }
                }

                // el ganador se incorpora a la siguiente ronda si ya se ha decidido
                siguienteRonda.add(ganadorEmparejamiento(jornadaRonda.getEncuentros(), a, b));
            }

            if (!jornadaRonda.getEncuentros().isEmpty() && jornadaRonda.getId() == null) {
                jornadaDao.save(jornadaRonda);
            }

            rondaActual = siguienteRonda;
            ronda++;
        }

        // cambiar el estado del torneo a PLAYOFF
        if (torneo.getEstado() != EstadoTorneo.PLAYOFF) {
            torneo.setEstado(EstadoTorneo.PLAYOFF);
            torneoDao.save(torneo);
        }

        return jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneoId);
    }

    /**
     * Devuelve el equipo ganador del emparejamiento entre {@code a} y {@code b} dentro de la lista de
     * encuentros de una ronda. Si el encuentro aun no esta jugado, devuelve {@code null} para indicar
     * que el ganador todavia no se conoce (y el hueco del bracket queda pendiente).
     */
    private Equipo ganadorEmparejamiento(List<Encuentro> encuentros, Equipo a, Equipo b) {
        for (Encuentro e : encuentros) {
            boolean esEmparejamiento = (e.getLocal().getId().equals(a.getId()) && e.getVisitante().getId().equals(b.getId()))
                    || (e.getLocal().getId().equals(b.getId()) && e.getVisitante().getId().equals(a.getId()));
            if (esEmparejamiento) {
                return e.getEstadoEncuentro() == EstadoEncuentro.JUGADO ? e.getGanador() : null;
            }
        }
        return null;
    }
}
