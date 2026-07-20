package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TorneoDao extends CrudRepository<Torneo, Long> {

    List<Torneo> findByNombreContainingIgnoreCase(String filtro);

    List<Torneo> findByOrganizadorId(Long organizadorId);
}
