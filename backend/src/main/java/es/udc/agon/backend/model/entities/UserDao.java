package es.udc.agon.backend.model.entities;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface UserDao extends CrudRepository<User, Long> {
	
	boolean existsByNombre(String nombre);

	Optional<User> findByNombre(String nombre);

	Optional<User> findByEmail(String email);

	Optional<User> findByGoogleId(String googleId);
	
}
