package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface SolicitudAplazamientoDao extends CrudRepository<SolicitudAplazamiento, Long> {

    List<SolicitudAplazamiento> findByEncuentroId(Long encuentroId);
}
