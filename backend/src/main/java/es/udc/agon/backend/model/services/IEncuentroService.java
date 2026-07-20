package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.time.LocalDateTime;
import java.util.List;

public interface IEncuentroService {

    /**
     * Consulta los encuentros en los que participa un equipo del usuario.
     *
     * @param userId Id del usuario (capitan/miembro).
     * @return Lista de encuentros donde participa algun equipo del usuario.
     */
    List<Encuentro> consultarEncuentrosPropios(Long userId);

    /**
     * Registra el resultado de un encuentro (lista de sets).
     *
     * @param encuentroId Id del encuentro.
     * @param sets        Lista de sets con los resultados.
     * @throws InstanceNotFoundException Si el encuentro no existe.
     * @throws IllegalArgumentException  Si el encuentro ya esta jugado o los datos de sets son invalidos.
     */
    void registrarResultado(Long encuentroId, List<SetEntity> sets)
            throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * Solicita el aplazamiento de un encuentro.
     *
     * @param capitanId    Id del capitan que solicita el aplazamiento.
     * @param encuentroId  Id del encuentro.
     * @param fecha        Nueva fecha propuesta.
     * @param motivo       Motivo del aplazamiento.
     * @throws InstanceNotFoundException Si el capitan, encuentro o equipo no existen.
     * @throws PermissionException       Si el capitanId no es capitan de uno de los equipos participantes.
     */
    void solicitarAplazamiento(Long capitanId, Long encuentroId, LocalDateTime fecha, String motivo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;
}
