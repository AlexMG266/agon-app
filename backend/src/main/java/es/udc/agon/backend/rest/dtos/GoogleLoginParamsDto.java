package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Parámetros requeridos para iniciar sesión con cuenta de Google")
public class GoogleLoginParamsDto {

	private String googleToken;

	public GoogleLoginParamsDto() {}

	@NotNull
	@Schema(
			description = "ID Token (JWT) obtenido del flujo 'Sign in with Google' del cliente",
			requiredMode = Schema.RequiredMode.REQUIRED,
			accessMode = Schema.AccessMode.WRITE_ONLY
	)
	public String getGoogleToken() {
		return googleToken;
	}

	public void setGoogleToken(String googleToken) {
		this.googleToken = googleToken;
	}

}
