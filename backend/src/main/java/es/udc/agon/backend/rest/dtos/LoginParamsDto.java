package es.udc.agon.backend.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class LoginParamsDto {
	
	private String nombre;
	private String password;
	
	public LoginParamsDto() {}

	@NotNull
	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre != null ? nombre.trim() : null;
	}

	@NotNull
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
