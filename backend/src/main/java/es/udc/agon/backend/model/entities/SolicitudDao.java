package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudDao extends CrudRepository<Solicitud, Long> {

    /**
     * Recupera todas las solicitudes donde el usuario es el decisor
     * (es decir, las que tiene pendientes de aceptar o rechazar en su buzón).
     */
    List<Solicitud> findByDecisorId(Long decisorId);

    /**
     * Recupera el histórico de solicitudes de un equipo concreto.
     */
    List<Solicitud> findByEquipoId(Long equipoId);

    /**
     * Utilizado para evitar duplicados. Comprueba si un candidato ya tiene
     * una solicitud activa (ej. PENDIENTE) para un equipo concreto.
     */
    Optional<Solicitud> findByCandidatoIdAndEquipoIdAndEstado(Long candidatoId, Long equipoId, EstadoSolicitud estado);
}