package es.udc.agon.backend.rest.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO devuelto tras una autenticación exitosa, que contiene el token de sesión y los datos del usuario")
public class AuthenticatedUserDto {

	@Schema(
			description = "Token JWT de autenticación que el cliente debe incluir en la cabecera Authorization (Bearer) para peticiones protegidas",
			example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9...",
			accessMode = Schema.AccessMode.READ_ONLY
	)
	private String serviceToken;

	@Schema(description = "Datos detallados del perfil del usuario autenticado")
	private UserDto userDto;

	public AuthenticatedUserDto() {}

	public AuthenticatedUserDto(String serviceToken, UserDto userDto) {
		this.serviceToken = serviceToken;
		this.userDto = userDto;
	}

	public String getServiceToken() {
		return serviceToken;
	}

	public void setServiceToken(String serviceToken) {
		this.serviceToken = serviceToken;
	}

	@JsonProperty("user")
	public UserDto getUserDto() {
		return userDto;
	}

	public void setUserDto(UserDto userDto) {
		this.userDto = userDto;
	}
}