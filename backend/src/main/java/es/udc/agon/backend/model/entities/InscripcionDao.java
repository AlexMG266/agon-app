package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface InscripcionDao extends CrudRepository<Inscripcion, Long> {

    List<Inscripcion> findByTorneoId(Long torneoId);

    Optional<Inscripcion> findByEquipoIdAndTorneoId(Long equipoId, Long torneoId);

    List<Inscripcion> findByGrupoId(Long grupoId);

    List<Inscripcion> findByEquipoId(Long equipoId);

    List<Inscripcion> findByTorneoIdAndEquipo_Creador_Id(Long torneoId, Long userId);
}
