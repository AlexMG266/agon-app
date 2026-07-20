package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface ITorneoService {

    /**
     * Busca torneos cuyo nombre contenga el filtro (busqueda por texto).
     */
    List<Torneo> buscarTorneos(String filtro);

    /**
     * Obtiene los detalles completos de un torneo por su ID.
     */
    Torneo consultarTorneo(Long torneoId) throws InstanceNotFoundException;

    /**
     * Crea un nuevo torneo a partir de los datos proporcionados.
     *
     * @param organizadorId Id del usuario organizador.
     * @param torneo        Objeto Torneo con los datos basicos (nombre, numGrupos, equiposPorGrupo, tienePlayoff).
     * @return El torneo creado.
     * @throws InstanceNotFoundException Si el organizador no existe.
     */
    Torneo crearTorneo(Long organizadorId, Torneo torneo) throws InstanceNotFoundException;

    /**
     * Inscribe un equipo en el torneo y lo valida si cumple las condiciones.
     * El capitan del equipo realiza la inscripcion.
     *
     * @param capitanId Id del capitan que inscribe al equipo.
     * @param torneoId  Id del torneo.
     * @param equipoId  Id del equipo a inscribir.
     * @throws InstanceNotFoundException Si el capitan, torneo o equipo no existen.
     * @throws PermissionException       Si el capitanId no es el creador del equipo.
     * @throws IllegalArgumentException  Si el equipo ya esta inscrito o el torneo no esta en estado RECLUTANDO.
     */
    Inscripcion inscribirYValidarEquipo(Long capitanId, Long torneoId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * Cierra las inscripciones del torneo, cambiando su estado de RECLUTANDO a FASE_GRUPOS.
     *
     * @param torneoId Id del torneo.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  Si el torneo no esta en estado RECLUTANDO o no tiene suficientes equipos.
     */
    void cerrarInscripciones(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * Genera el calendario de jornadas para el torneo (solo fase de grupos).
     *
     * @param torneoId Id del torneo.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  Si el torneo no esta en FASE_GRUPOS o ya tiene jornadas generadas.
     */
    void generarCalendario(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * Genera un codigo QR para el torneo (simulado como un string alfanumerico).
     *
     * @param torneoId Id del torneo.
     * @return String representando el codigo QR.
     * @throws InstanceNotFoundException Si el torneo no existe.
     */
    String generarCodigoQR(Long torneoId) throws InstanceNotFoundException;

    /**
     * Gestiona el estado de una jornada (activarla o aplazarla).
     *
     * @param torneoId            Id del torneo.
     * @param jornadaId           Id de la jornada.
     * @param nuevoEstado         Nuevo estado para la jornada.
     * @throws InstanceNotFoundException Si el torneo o la jornada no existen.
     * @throws PermissionException       Si el usuario no es el organizador.
     * @throws IllegalArgumentException  Si la jornada no pertenece al torneo.
     */
    void gestionarJornadas(Long torneoId, Long jornadaId, EstadoJornada nuevoEstado)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;
}
