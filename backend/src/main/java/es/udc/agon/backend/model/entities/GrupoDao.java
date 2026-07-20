package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface GrupoDao extends CrudRepository<Grupo, Long> {

    List<Grupo> findByTorneoId(Long torneoId);
}
