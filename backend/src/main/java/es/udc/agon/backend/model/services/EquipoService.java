package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Invitacion;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface EquipoService {

    /**
     *
     * @param userId
     * @param nombreEquipo
     * @return equipo creado
     * @throws InstanceNotFoundException
     */
    Equipo crearEquipo(Long userId, String nombreEquipo) throws InstanceNotFoundException;

    /**
     *
     * @param remitenteId
     * @param equipoId
     * @param destinoId
     * @returns
     * @throws InstanceNotFoundException
     * @throws PermissionException
     * @throws IllegalArgumentException
     */
    Invitacion invitarMiembro(Long remitenteId, Long equipoId, Long destinoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     *
     * @param usuarioId
     * @param invitacionId
     * @param aceptar
     * @throws InstanceNotFoundException
     * @throws PermissionException
     * @throws IllegalArgumentException
     */
    void responderInvitacion(Long usuarioId, Long invitacionId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     *
     * @param usuarioId
     * @param equipoId
     * @throws InstanceNotFoundException
     * @throws PermissionException
     * @throws IllegalArgumentException
     */
    void abandonarEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     *
     * @param usuarioId
     * @param equipoId
     * @throws InstanceNotFoundException
     * @throws PermissionException
     */
    void disolverEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException;

    /**
     *
     * @param usuarioId
     * @return los equipos a los que pertenece el usuario
     */
    List<Equipo> obtenerEquiposDeUsuario(Long usuarioId);

    /**
     *
     * @param equipoId
     * @return equipo con id equipoId
     * @throws InstanceNotFoundException
     */
    Equipo obtenerEquipo(Long equipoId) throws InstanceNotFoundException;
}
