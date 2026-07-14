package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Invitacion;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface EquipoService {

    Equipo crearEquipo(Long userId, String nombreEquipo) throws InstanceNotFoundException;

    Invitacion invitarMiembro(Long remitenteId, Long equipoId, Long destinoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    void responderInvitacion(Long usuarioId, Long invitacionId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    void abandonarEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    void disolverEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException;

    // Optional useful queries
    List<Equipo> obtenerEquiposDeUsuario(Long usuarioId);

    Equipo obtenerEquipo(Long equipoId) throws InstanceNotFoundException;
}
