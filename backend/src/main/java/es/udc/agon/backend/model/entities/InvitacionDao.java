package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface InvitacionDao extends CrudRepository<Invitacion, Long> {

    List<Invitacion> findByUsuarioDestinoId(Long usuarioDestinoId);

    List<Invitacion> findByEquipoId(Long equipoId);

    Optional<Invitacion> findByUsuarioDestinoIdAndEquipoIdAndEstado(Long usuarioDestinoId, Long equipoId,
            EstadoInvitacion estado);
}
