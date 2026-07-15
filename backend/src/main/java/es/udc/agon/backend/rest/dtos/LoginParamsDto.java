package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Parámetros requeridos para iniciar sesión en la plataforma")
public class LoginParamsDto {

	private String nombre;
	private String password;

	public LoginParamsDto() {}

	@NotNull
	@Schema(
			description = "Nombre de usuario registrado en el sistema",
			example = "Drako266",
			requiredMode = Schema.RequiredMode.REQUIRED
	)
	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre != null ? nombre.trim() : null;
	}

	@NotNull
	@Schema(
			description = "Contraseña asociada a la cuenta del usuario",
			example = "P@ssword123",
			requiredMode = Schema.RequiredMode.REQUIRED,
			accessMode = Schema.AccessMode.WRITE_ONLY
	)
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}