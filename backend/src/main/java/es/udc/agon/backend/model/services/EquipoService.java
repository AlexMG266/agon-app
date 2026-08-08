package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface EquipoService {

    /**
     * Crea un equipo manualmente en el sistema.
     * * @param userId Id del creador.
     * @param nombreEquipo Nombre del equipo.
     * @return El equipo creado.
     * @param descripcion Descripción del equipo.
     * @throws InstanceNotFoundException Si el usuario creador no existe.
     */
    Equipo crearEquipo(Long userId, String nombreEquipo, String descripcion) throws InstanceNotFoundException;

    /**
     * Flujo PROPUESTA: El creador de un equipo invita activamente a un jugador.
     * El decisor de esta solicitud será el propio jugador invitado.
     * * @param creadorId Id del creador del equipo (quien envía la propuesta).
     * @param equipoId Id del equipo.
     * @param jugadorId Id del jugador al que se propone unirse.
     * @return La solicitud creada en estado PENDIENTE de tipo PROPUESTA.
     * @throws InstanceNotFoundException Si no existe el equipo o alguno de los usuarios.
     * @throws PermissionException Si el creadorId no es el creador del equipo.
     * @throws IllegalArgumentException Si el jugador ya está en el equipo o ya existe una propuesta pendiente.
     */
    Solicitud crearPropuestaDeUnion(Long creadorId, Long equipoId, Long jugadorId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * Flujo PETICION: Un jugador introduce el código único del equipo para solicitar unirse.
     * El decisor de esta solicitud será el creador del equipo.
     * * @param jugadorId Id del jugador que introduce el código (quien realiza la petición).
     * @param codigoEquipo Código único del equipo al que se quiere unir.
     * @return La solicitud creada en estado PENDIENTE de tipo PETICION.
     * @throws InstanceNotFoundException Si el jugador o el equipo no existen.
     * @throws IllegalArgumentException Si el jugador ya está en el equipo o ya tiene una petición de unión pendiente.
     */
    Solicitud crearPeticionDeUnion(Long jugadorId, String codigoEquipo)
            throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * Responde (acepta o rechaza) a una solicitud (sea tipo PROPUESTA o PETICION).
     * El servicio comprobará que el usuario que responde coincide con el decisor de la solicitud.
     * * @param usuarioId Id del usuario que toma la decisión.
     * @param solicitudId Id de la solicitud a responder.
     * @param aceptar True si acepta entrar/unir, False para rechazar.
     * @throws InstanceNotFoundException Si la solicitud o el usuario no existen.
     * @throws PermissionException Si el usuarioId no coincide con el decisor asignado a la solicitud.
     * @throws IllegalArgumentException Si la solicitud no está pendiente o el equipo ya está completo.
     */
    void responderSolicitud(Long usuarioId, Long solicitudId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * Un jugador abandona un equipo al que pertenece.
     * * @param usuarioId Id del jugador.
     * @param equipoId Id del equipo.
     * @throws InstanceNotFoundException Si el equipo o usuario no existen.
     * @throws PermissionException Si el usuario no pertenece a dicho equipo.
     * @throws IllegalArgumentException Si se intenta abandonar un equipo que ya no cumple reglas básicas.
     */
    void abandonarEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    /**
     * El creador de un equipo elimina el equipo del sistema.
     * * @param usuarioId Id del creador.
     * @param equipoId Id del equipo.
     * @throws InstanceNotFoundException Si el equipo o usuario no existen.
     * @throws PermissionException Si el usuario no es el creador del equipo.
     */
    void eliminarEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException;

    /**
     * Obtiene todos los equipos de los que forma parte activa el usuario
     * * @param usuarioId Id del usuario.
     * @return Lista de equipos asociados.
     */
    List<Equipo> obtenerEquiposDeUsuario(Long usuarioId);

    /**
     * Obtiene la información detallada de un equipo.
     * * @param equipoId Id del equipo.
     * @return El equipo en cuestión.
     * @throws InstanceNotFoundException Si el equipo no existe.
     */
    Equipo obtenerEquipo(Long equipoId) throws InstanceNotFoundException;

    /**
     * Busca un equipo activo por su código único de invitación.
     * * @param codigoEquipo Código alfanumérico de 8 caracteres del equipo.
     * @return El equipo encontrado.
     * @throws InstanceNotFoundException Si no existe un equipo activo con ese código.
     */
    Equipo buscarEquipoPorCodigo(String codigoEquipo) throws InstanceNotFoundException;

    /**
     * Cuenta las partidas jugadas (estado JUGADO) en las que ha participado el equipo.
     * * @param equipoId Id del equipo.
     * @return Número de encuentros jugados del equipo.
     */
    long obtenerNumPartidasJugadas(Long equipoId);

    /**
     * El capitán expulsa a un miembro del equipo.
     * * @param captainId Id del capitán (creador del equipo).
     * @param equipoId Id del equipo.
     * @param miembroId Id del miembro a expulsar.
     * @throws InstanceNotFoundException Si el equipo, el capitán o el miembro no existen.
     * @throws PermissionException Si el captainId no es el creador del equipo.
     * @throws IllegalArgumentException Si el miembro no pertenece al equipo o se intenta expulsar al capitán.
     */
    void expulsarMiembro(Long captainId, Long equipoId, Long miembroId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;
}