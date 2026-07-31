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
     *
     * @param encuentroId  id del encuentro.
     * @param sets        Lista de sets con los resultados.
     * @throws InstanceNotFoundException Si el encuentro no existe.
     * @throws IllegalArgumentException  si el encuentro ya esta jugado o los datos de sets son invalidos.
     */
    void registrarResultado(Long encuentroId, List<SetEntity> sets)
            throws InstanceNotFoundException, IllegalArgumentException;

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
}
