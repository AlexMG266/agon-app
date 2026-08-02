package es.udc.agon.backend.model.entities;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface NotificationDao extends CrudRepository<Notification, Long> {

	@Query(value = "SELECT n FROM Notification n WHERE n.usuario.id = :usuarioId ORDER BY n.fechaCreacion DESC",
			countQuery = "SELECT COUNT(n) FROM Notification n WHERE n.usuario.id = :usuarioId")
	Page<Notification> findByUsuarioId(Long usuarioId, Pageable pageable);

	@Query("SELECT n FROM Notification n WHERE n.usuario.id = :usuarioId AND n.leido = false")
	List<Notification> findUnreadByUsuarioId(Long usuarioId);

	@Query("SELECT COUNT(n) FROM Notification n WHERE n.usuario.id = :usuarioId AND n.leido = false")
	long countUnreadByUsuarioId(Long usuarioId);

	@Query("SELECT n FROM Notification n WHERE n.usuario.id = :usuarioId AND n.referenciaId = :referenciaId AND n.tipo = :tipo")
	Optional<Notification> findByUsuarioIdAndReferenciaIdAndTipo(Long usuarioId, Long referenciaId,
			Notification.TipoNotificacion tipo);

}
