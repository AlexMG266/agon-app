package es.udc.agon.backend.model.entities;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "\"User\"")
public class User {

	private Long id;
	private int elo;
	private String nombre;
	private String email;
	private String imagenPerfil;
	private String password;
	private LocalDate fechaNacimiento;

	public User() {
	}

	public User(int elo, String nombre, String email, String imagenPerfil, String password,
		LocalDate fechaNacimiento) {
		this.elo = elo;
		this.nombre = nombre;
		this.email = email;
		this.imagenPerfil = imagenPerfil;
		this.password = password;
		this.fechaNacimiento = fechaNacimiento;
	}

	public User(String nombre, String email, String imagenPerfil, String password, LocalDate fechaNacimiento) {
		this(0, nombre, email, imagenPerfil, password, fechaNacimiento);
	}

	public User(String nombre, String email, String imagenPerfil) {
		this(0, nombre, email, imagenPerfil, null, null);
	}

	public User(String userName, String password, String firstName, String lastName, String email) {
		this(0, userName, email, null, password, null);
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getElo() {
		return elo;
	}

	public void setElo(int elo) {
		this.elo = elo;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getImagenPerfil() {
		return imagenPerfil;
	}

	public void setImagenPerfil(String imagenPerfil) {
		this.imagenPerfil = imagenPerfil;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public LocalDate getFechaNacimiento() {
		return fechaNacimiento;
	}

	public void setFechaNacimiento(LocalDate fechaNacimiento) {
		this.fechaNacimiento = fechaNacimiento;
	}

}
