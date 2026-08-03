package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.time.LocalDateTime;
import java.util.List;

public interface IEncuentroService {

    /**
     * consulta los encuentros en los que participa un equipo del usuario.
     *
     * @param userId id del usuario (capitan/miembro).
     * @return lista de encuentros donde participa algun equipo del usuario.
     */
    List<Encuentro> consultarEncuentrosPropios(Long userId);

    /**
     * Genera (de forma idempotente) recordatorios de partidos próximos para el usuario
     * según su configuración de notificaciones ({@code notificacionesPartidos} y
     * {@code diasAntelacionPartidos}).
     *
     * @param userId id del usuario.
     * @throws InstanceNotFoundException si el usuario no existe.
     */
    void generarRecordatoriosPartidos(Long userId) throws InstanceNotFoundException;

    /**
     * registra el resultado de un encuentro (lista de sets).
     * Solo los capitanes de los dos equipos participantes pueden registrar el resultado.
     *
     * @param capitanId    id del capitan que registra el resultado.
     * @param encuentroId  id del encuentro.
     * @param sets         Lista de sets con los resultados.
     * @throws InstanceNotFoundException Si el encuentro no existe.
     * @throws PermissionException       si el capitanId no es capitan de uno de los equipos participantes.
     * @throws IllegalArgumentException  si el encuentro ya esta jugado o los datos de sets son invalidos.
     */
    void registrarResultado(Long capitanId, Long encuentroId, List<SetEntity> sets)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * solicita el aplazamiento de un encuentro.
     *
     * @param capitanId    id del capitan que solicita el aplazamiento.
     * @param encuentroId  Id del encuentro.
     * @param fecha        Nueva fecha propuesta.
     * @param motivo       Motivo del aplazamiento.
     * @throws InstanceNotFoundException si el capitan, encuentro o equipo no existen.
     * @throws PermissionException       si el capitanId no es capitan de uno de los equipos participantes.
     */
    void solicitarAplazamiento(Long capitanId, Long encuentroId, LocalDateTime fecha, String motivo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * acepta o rechaza una solicitud de aplazamiento.
     * Solo el capitan del equipo contrario al solicitante puede responder.
     *
     * @param capitanId   id del capitan que responde.
     * @param solicitudId id de la solicitud de aplazamiento.
     * @param aceptar     true para aceptar el aplazamiento, false para rechazarlo.
     * @throws InstanceNotFoundException si el capitan o la solicitud no existen.
     * @throws PermissionException       si el capitanId no es capitan del equipo contrario.
     * @throws IllegalArgumentException  si la solicitud ya no esta pendiente.
     */
    void responderAplazamiento(Long capitanId, Long solicitudId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * consulta el historial de variaciones de ELO de un usuario,
     * ordenado cronológicamente (más antiguo primero).
     *
     * @param usuarioId id del usuario.
     * @return lista de registros de historial de ELO.
     */
    List<EloHistorial> consultarHistorialElo(Long usuarioId);
}
