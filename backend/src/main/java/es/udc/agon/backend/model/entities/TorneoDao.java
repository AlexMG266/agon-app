package es.udc.agon.backend.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TorneoDao extends JpaRepository<Torneo, Long> {

    Page<Torneo> findByNombreContainingIgnoreCaseAndPrivadoFalse(String filtro, Pageable pageable);

    Page<Torneo> findByPrivadoFalse(Pageable pageable);

    Page<Torneo> findByPrivadoFalseAndEstado(EstadoTorneo estado, Pageable pageable);

    Page<Torneo> findByNombreContainingIgnoreCaseAndPrivadoFalseAndEstado(String filtro, EstadoTorneo estado, Pageable pageable);

    @Query("SELECT t FROM Torneo t WHERE t.privado = false AND t.estado IN :estados")
    Page<Torneo> findByPrivadoFalseAndEstadoIn(@Param("estados") List<EstadoTorneo> estados, Pageable pageable);

    @Query("SELECT t FROM Torneo t WHERE t.privado = false AND LOWER(t.nombre) LIKE LOWER(CONCAT('%', :filtro, '%')) AND t.estado IN :estados")
    Page<Torneo> findByNombreContainingIgnoreCaseAndPrivadoFalseAndEstadoIn(@Param("filtro") String filtro, @Param("estados") List<EstadoTorneo> estados, Pageable pageable);

    List<Torneo> findByOrganizadorId(Long organizadorId);

    Optional<Torneo> findByCodigoTorneo(String codigoTorneo);
}
