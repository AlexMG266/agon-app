package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface TorneoService {

    /**
     * busca torneos cuyo nombre contenga el filtro (busqueda por texto).
     */
    List<Torneo> buscarTorneos(String filtro);

    /**
     * obtiene los torneos creados por un organizador.
     */
    List<Torneo> obtenerTorneosOrganizador(Long organizadorId);

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
     * @return el torneo creado en estado RECLUTANDO.
     * @throws InstanceNotFoundException si el organizador no existe.
     */
    /**
     * crea un nuevo torneo con los datos basicos (sin estructura de grupos).
     * La estructura (numGrupos, equiposPorGrupo, tipoTorneo, etc.) se configurara
     * tras cerrar las inscripciones mediante configurarEstructuraYGenerarCalendario().
     *
     * @param organizadorId Id del usuario organizador.
     * @param torneo        torneo con los datos basicos (nombre).
     * @param privado       indica si el torneo es privado (requiere codigo para inscribirse).
     * @return el torneo creado en estado RECLUTANDO.
     * @throws InstanceNotFoundException si el organizador no existe.
     */
    Torneo crearTorneo(Long organizadorId, Torneo torneo, Boolean privado) throws InstanceNotFoundException;

    /**
     * inscribe un equipo en el torneo y lo valida si cumple las condiciones.
     * el capitan del equipo realiza la inscripcion.
     *
     * @param capitanId   id del capitan que inscribe al equipo.
     * @param torneoId    id del torneo.
     * @param equipoId    id del equipo a inscribir.
     * @param codigoTorneo codigo del torneo (obligatorio si el torneo es privado).
     * @throws InstanceNotFoundException si el capitan, torneo o equipo no existen.
     * @throws PermissionException       si el capitanId no es el creador del equipo.
     * @throws IllegalArgumentException  si el equipo ya esta inscrito, el torneo no esta en reclutando,
     *                                   o el codigo es incorrecto para torneos privados.
     */
    Inscripcion inscribirYValidarEquipo(Long capitanId, Long torneoId, Long equipoId, String codigoTorneo)
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
}
