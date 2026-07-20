package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface ITorneoService {

    /**
     * busca torneos cuyo nombre contenga el filtro (busqueda por texto).
     */
    List<Torneo> buscarTorneos(String filtro);

    /**
     * obtiene los detalles completos de un torneo por su id.
     */
    Torneo consultarTorneo(Long torneoId) throws InstanceNotFoundException;

    /**
     * crea un nuevo torneo a partir de los datos proporcionados.
     *
     * @param organizadorId Id del usuario organizador.
     * @param torneo        torneo con los datos basicos (nombre, numGrupos, equiposPorGrupo, tienePlayoff).
     * @return el torneo creado.
     * @throws InstanceNotFoundException si el organizador no existe.
     */
    Torneo crearTorneo(Long organizadorId, Torneo torneo) throws InstanceNotFoundException;

    /**
     * inscribe un equipo en el torneo y lo valida si cumple las condiciones.
     * el capitan del equipo realiza la inscripcion.
     *
     * @param capitanId id del capitan que inscribe al equipo.
     * @param torneoId  id del torneo.
     * @param equipoId  id del equipo a inscribir.
     * @throws InstanceNotFoundException si el capitan, torneo o equipo no existen.
     * @throws PermissionException       si el capitanId no es el creador del equipo.
     * @throws IllegalArgumentException  si el equipo ya esta inscrito o el torneo no esta en estado reclutando.
     */
    Inscripcion inscribirYValidarEquipo(Long capitanId, Long torneoId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * cierra las inscripciones del torneo, cambiando su estado de reclutando a fase_grupos.
     *
     * @param torneoId Id del torneo.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  si el torneo no esta en estado reclutando o no tiene suficientes equipos.
     */
    void cerrarInscripciones(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * genera el calendario de jornadas para el torneo (solo fase de grupos).
     *
     * @param torneoId Id del torneo.
     * @throws InstanceNotFoundException Si el torneo no existe.
     * @throws IllegalArgumentException  si el torneo no esta en fase_grupos o ya tiene jornadas generadas.
     */
    void generarCalendario(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

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
