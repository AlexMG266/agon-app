package es.udc.agon.backend.model.entities;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface EloHistorialDao extends CrudRepository<EloHistorial, Long> {

    List<EloHistorial> findByUsuarioIdOrderByFechaAsc(Long usuarioId);

    @Query("SELECT COUNT(DISTINCT e.id) FROM EloHistorial e WHERE e.usuario.id = :usuarioId")
    long countDistinctEncuentrosByUsuarioId(@Param("usuarioId") Long usuarioId);
}
