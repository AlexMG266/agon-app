package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface JornadaDao extends CrudRepository<Jornada, Long> {

    List<Jornada> findByTorneoIdOrderByNumeroJornadaAsc(Long torneoId);
}
