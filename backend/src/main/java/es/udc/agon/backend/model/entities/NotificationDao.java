package es.udc.agon.backend.model.entities;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface NotificationDao extends CrudRepository<Notification, Long> {

	@Query("SELECT n FROM Notification n WHERE n.usuario.id = :usuarioId ORDER BY n.fechaCreacion DESC")
	List<Notification> findByUsuarioId(Long usuarioId);

	@Query("SELECT n FROM Notification n WHERE n.usuario.id = :usuarioId AND n.leido = false")
	List<Notification> findUnreadByUsuarioId(Long usuarioId);

	@Query("SELECT COUNT(n) FROM Notification n WHERE n.usuario.id = :usuarioId AND n.leido = false")
	long countUnreadByUsuarioId(Long usuarioId);

}
