package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface TorneoDao extends CrudRepository<Torneo, Long> {

    List<Torneo> findByNombreContainingIgnoreCase(String filtro);

    List<Torneo> findByNombreContainingIgnoreCaseAndPrivadoFalse(String filtro);

    List<Torneo> findByPrivadoFalse();

    List<Torneo> findByOrganizadorId(Long organizadorId);

    Optional<Torneo> findByCodigoTorneo(String codigoTorneo);
}
