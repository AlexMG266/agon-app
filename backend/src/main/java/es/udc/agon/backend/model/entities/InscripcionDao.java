package es.udc.agon.backend.model.entities;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InscripcionDao extends CrudRepository<Inscripcion, Long> {

    /**
     * Devuelve las inscripciones de un torneo ordenadas por id ascendente.
     * El orden es determinista (mismo orden de inscripcion) y garantiza que
     * la generacion del calendario round-robin asigne siempre los mismos
     * locales/visitantes, independientemente del plan de ejecucion de la BD.
     */
    @Query("SELECT i FROM Inscripcion i WHERE i.torneo.id = :torneoId ORDER BY i.id ASC")
    List<Inscripcion> findByTorneoId(@Param("torneoId") Long torneoId);

    Optional<Inscripcion> findByEquipoIdAndTorneoId(Long equipoId, Long torneoId);

    List<Inscripcion> findByGrupoId(Long grupoId);

    List<Inscripcion> findByEquipoId(Long equipoId);

    List<Inscripcion> findByTorneoIdAndEquipo_Creador_Id(Long torneoId, Long userId);
}
