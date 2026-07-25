package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface TorneoService {

    /**
     * busca torneos publicos cuyo nombre contenga el filtro (busqueda por texto). Paginado.
     * @param estadoFilter filtro de estado: null/'ALL' = todos, 'RECLUTANDO', 'EN_JUEGO', 'FINALIZADO'
     */
    Block<Torneo> buscarTorneos(String filtro, String estadoFilter, int page, int size);

    /**
     * obtiene los torneos creados por un organizador.
     */
    List<Torneo> obtenerTorneosOrganizador(Long organizadorId);

    /**
     * Obtiene los torneos seguidos por un usuario.
     */
    List<Torneo> obtenerTorneosSeguidos(Long usuarioId);

    /**
     * Obtiene los torneos en los que el usuario tiene alg�n equipo inscrito
     * (como capitán o como miembro).
     */
    List<Torneo> obtenerTorneosInscritos(Long usuarioId);

    /**
     * Sigue (marca como favorito) un torneo.
     *
     * @throws InstanceNotFoundException si el usuario o torneo no existen.
     * @throws IllegalArgumentException  si el usuario ya sigue el torneo.
     */
    void seguirTorneo(Long usuarioId, Long torneoId)
            throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * Deja de seguir un torneo.
     */
    void dejarDeSeguirTorneo(Long usuarioId, Long torneoId);

    /**
     * obtiene los detalles completos de un torneo por su id.
     */
    Torneo consultarTorneo(Long torneoId) throws InstanceNotFoundException;

    /**
     * crea un nuevo torneo con los datos basicos (sin estructura de grupos).
     * La estructura (numGrupos, equiposPorGrupo, tipoTorneo, etc.) se configurara
     * tras cerrar las inscripciones mediante configurarEstructuraYGenerarCalendario().
     *
     * @param organizadorId Id del usuario organizador.
     * @param torneo        torneo con los datos basicos (nombre).
     * @param privado       indica si el torneo es privado (requiere codigo para encontrarlo).
     * @return el torneo creado en estado RECLUTANDO.
     * @throws InstanceNotFoundException si el organizador no existe.
     */
    Torneo crearTorneo(Long organizadorId, Torneo torneo, Boolean privado) throws InstanceNotFoundException;

    /**
     * Solicita la inscripcion de un equipo en el torneo. Crea una solicitud PENDIENTE
     * que el organizador debera aceptar o rechazar.
     *
     * @param capitanId   id del capitan que solicita inscribir al equipo.
     * @param torneoId    id del torneo.
     * @param equipoId    id del equipo a inscribir.
     * @param codigoTorneo codigo del torneo (obligatorio si el torneo es privado).
     * @return la Solicitud creada.
     * @throws InstanceNotFoundException si el capitan, torneo o equipo no existen.
     * @throws PermissionException       si el capitanId no es el creador del equipo.
     * @throws IllegalArgumentException  si el equipo ya esta inscrito, el torneo no esta en reclutando,
     *                                   o el codigo es incorrecto para torneos privados.
     */
    Solicitud solicitarInscripcion(Long capitanId, Long torneoId, Long equipoId, String codigoTorneo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * Aprueba una solicitud de inscripcion y crea la inscripcion real.
     *
     * @param organizadorId id del organizador del torneo.
     * @param solicitudId   id de la solicitud a aprobar.
     * @return la Inscripcion creada.
     * @throws InstanceNotFoundException si la solicitud no existe.
     * @throws PermissionException       si el usuario no es el organizador del torneo.
     * @throws IllegalArgumentException  si la solicitud no esta PENDIENTE.
     */
    Inscripcion aprobarInscripcion(Long organizadorId, Long solicitudId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * Rechaza una solicitud de inscripcion.
     *
     * @param organizadorId id del organizador del torneo.
     * @param solicitudId   id de la solicitud a rechazar.
     * @throws InstanceNotFoundException si la solicitud no existe.
     * @throws PermissionException       si el usuario no es el organizador del torneo.
     * @throws IllegalArgumentException  si la solicitud no esta PENDIENTE.
     */
    void rechazarInscripcion(Long organizadorId, Long solicitudId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * cierra las inscripciones del torneo, cambiando su estado de RECLUTANDO a INSCRIPCION_CERRADA.
     * No genera calendario ni crea grupos — eso se hace en configurarEstructuraYGenerarCalendario().
     *
     * @param torneoId Id del torneo.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  si el torneo no esta en estado RECLUTANDO o no tiene suficientes equipos.
     */
    void cerrarInscripciones(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * configura la estructura del torneo (tipo, grupos, playoff), crea los grupos,
     * asigna los equipos inscritos a los grupos (round-robin), genera el calendario
     * de la fase de grupos y cambia el estado a FASE_GRUPOS.
     *
     * @param torneoId        Id del torneo.
     * @param tipoTorneo      Tipo de torneo (LIGA_UNICA, GRUPOS_PLAYOFF, ELIMINATORIAS).
     * @param numGrupos       Número de grupos.
     * @param equiposPorGrupo Capacidad maxima de equipos por grupo.
     * @param tienePlayoff    Si el torneo tiene playoff tras la fase de grupos.
     * @param idaVueltaPlayoff Si los playoffs son a ida y vuelta.
     * @return el torneo actualizado en estado FASE_GRUPOS.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  si el torneo no esta en INSCRIPCION_CERRADA,
     *                                   si no hay equipos inscritos,
     *                                   si numGrupos*equiposPorGrupo es menor que los equipos inscritos.
     */
    Torneo configurarEstructuraYGenerarCalendario(Long torneoId, String tipoTorneo,
                                                   int numGrupos, int equiposPorGrupo,
                                                   boolean tienePlayoff, boolean idaVueltaPlayoff)
            throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * genera el calendario de jornadas para el torneo (solo fase de grupos).
     *
     * @param torneoId Id del torneo.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  si el torneo no esta en fase_grupos o ya tiene jornadas generadas.
     */
    void generarCalendario(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * busca un torneo por su codigo unico.
     *
     * @param codigoTorneo codigo del torneo.
     * @return el torneo encontrado.
     * @throws InstanceNotFoundException si no existe torneo con ese codigo.
     */
    Torneo buscarPorCodigo(String codigoTorneo) throws InstanceNotFoundException;

    /**
     * genera un codigo qr para el torneo (simulado como un string alfanumerico).
     *
     * @param torneoId Id del torneo.
     * @return string representando el codigo qr.
     * @throws InstanceNotFoundException Si el torneo no existe.
     */
    String generarCodigoQR(Long torneoId) throws InstanceNotFoundException;

    /**
     * gestiona el estado de una jornada (activarla o aplazarla).
     *
     * @param torneoId            Id del torneo.
     * @param jornadaId           Id de la jornada.
     * @param nuevoEstado         Nuevo estado para la jornada.
     * @throws InstanceNotFoundException Si el torneo o la jornada no existen.
     * @throws PermissionException       si el usuario no es el organizador.
     * @throws IllegalArgumentException  si la jornada no pertenece al torneo.
     */
    void gestionarJornadas(Long torneoId, Long jornadaId, EstadoJornada nuevoEstado)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * Obtiene las solicitudes de inscripcion pendientes para un torneo.
     */
    List<Solicitud> obtenerSolicitudesPendientes(Long torneoId);

    /**
     * Actualiza los datos editables de un torneo (nombre, fechas, reglas, calendario, etc.).
     * Solo el organizador del torneo puede realizar esta accion.
     *
     * @param userId   Id del usuario que solicita la actualizacion (debe ser el organizador).
     * @param torneoId Id del torneo a actualizar.
     * @param datos     Torneo con los campos a actualizar (los valores no nulos se aplican).
     * @return el torneo actualizado.
     * @throws InstanceNotFoundException si el torneo no existe.
     * @throws PermissionException       si el usuario no es el organizador del torneo.
     */
    Torneo actualizarTorneo(Long userId, Long torneoId, Torneo datos)
            throws InstanceNotFoundException, PermissionException;
}
