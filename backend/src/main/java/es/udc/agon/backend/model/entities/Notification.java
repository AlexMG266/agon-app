package es.udc.agon.backend.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "\"Notification\"")
public class Notification {

	public enum TipoNotificacion {
		INVITACION,
		RECORDATORIO_PARTIDO,
		RESULTADO_PARTIDO,
		SOLICITUD_APLAZAMIENTO,
		SYSTEM
	}

	private Long id;
	private User usuario;
	private String asunto; 
	private String cuerpo;
	private boolean leido;
	private boolean pendienteDeAccion;
	private Long referenciaId;
	private TipoNotificacion tipo;
	private LocalDateTime fechaCreacion;

	public Notification() {
	}

	public Notification(User usuario, String asunto, String cuerpo, TipoNotificacion tipo) {
        this.usuario = usuario;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.tipo = tipo;
        this.leido = false;
        this.pendienteDeAccion = false;
        this.fechaCreacion = LocalDateTime.now();
    }

	public Notification(User usuario, String asunto, String cuerpo, boolean leido, boolean pendienteDeAccion,
            Long referenciaId, TipoNotificacion tipo) {
        this.usuario = usuario;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.leido = leido;
        this.pendienteDeAccion = pendienteDeAccion;
        this.referenciaId = referenciaId;
        this.tipo = tipo;
        this.fechaCreacion = LocalDateTime.now();
    }

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@ManyToOne
	@JoinColumn(name = "usuarioId", nullable = false)
	public User getUsuario() {
		return usuario;
	}

	public void setUsuario(User usuario) {
		this.usuario = usuario;
	}

	public String getAsunto() {
		return asunto;
	}

	public void setAsunto(String asunto) {
		this.asunto = asunto;
	}

	public String getCuerpo() {
		return cuerpo; 
	}

	public void setCuerpo(String cuerpo) {
		this.cuerpo = cuerpo;
	}

	public boolean isLeido() {
		return leido;
	}

	public void setLeido(boolean leido) {
		this.leido = leido;
	}

	public boolean isPendienteDeAccion() {
		return pendienteDeAccion;
	}

	public void setPendienteDeAccion(boolean pendienteDeAccion) {
		this.pendienteDeAccion = pendienteDeAccion;
	}

	public Long getReferenciaId() {
		return referenciaId;
	}

	public void setReferenciaId(Long referenciaId) {
		this.referenciaId = referenciaId;
	}

	@Enumerated(EnumType.STRING)
	public TipoNotificacion getTipo() {
		return tipo;
	}

	public void setTipo(TipoNotificacion tipo) {
		this.tipo = tipo;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

}
