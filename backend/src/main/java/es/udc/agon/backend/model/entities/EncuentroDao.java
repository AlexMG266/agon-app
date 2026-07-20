package es.udc.agon.backend.model.entities;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface EncuentroDao extends CrudRepository<Encuentro, Long> {

    List<Encuentro> findByJornadaId(Long jornadaId);

    @Query("SELECT e FROM Encuentro e WHERE e.local.id = :equipoId OR e.visitante.id = :equipoId")
    List<Encuentro> findByEquipoId(Long equipoId);
}
