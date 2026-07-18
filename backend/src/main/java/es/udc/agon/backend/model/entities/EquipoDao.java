package es.udc.agon.backend.model.entities;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface EquipoDao extends CrudRepository<Equipo, Long> {

    List<Equipo> findByCreadorId(Long creadorId);

    @Query("SELECT e FROM Equipo e JOIN e.miembros m WHERE m.id = :usuarioId")
    List<Equipo> findByMiembrosId(Long usuarioId);

    Optional<Equipo> findByCodigoEquipo (String codigoEquipo);
}
