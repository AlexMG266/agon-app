package es.udc.agon.backend.model.entities;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface SetEntityDao extends CrudRepository<SetEntity, Long> {

    List<SetEntity> findByEncuentroId(Long encuentroId);
}
