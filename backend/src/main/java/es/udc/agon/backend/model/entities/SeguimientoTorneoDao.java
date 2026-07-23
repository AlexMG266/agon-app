package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface SeguimientoTorneoDao extends CrudRepository<SeguimientoTorneo, Long> {

    List<SeguimientoTorneo> findByUsuarioId(Long usuarioId);

    Optional<SeguimientoTorneo> findByUsuarioIdAndTorneoId(Long usuarioId, Long torneoId);

    void deleteByUsuarioIdAndTorneoId(Long usuarioId, Long torneoId);
}
