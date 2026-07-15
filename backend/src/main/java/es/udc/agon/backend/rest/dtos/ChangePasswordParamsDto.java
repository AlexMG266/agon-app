package es.udc.agon.backend.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Parámetros requeridos para realizar un cambio de contraseña de usuario")
public class ChangePasswordParamsDto {

	private String oldPassword;
	private String newPassword;

	public ChangePasswordParamsDto() {}

	@NotNull
	@Schema(
			description = "Contraseña actual del usuario para validar su identidad antes del cambio",
			example = "OldP@ssword123",
			requiredMode = Schema.RequiredMode.REQUIRED,
			accessMode = Schema.AccessMode.WRITE_ONLY
	)
	public String getOldPassword() {
		return oldPassword;
	}

	public void setOldPassword(String oldPassword) {
		this.oldPassword = oldPassword;
	}

	@NotNull
	@Size(min=1, max=60)
	@Schema(
			description = "Nueva contraseña que sustituirá a la anterior. Debe cumplir con las políticas de seguridad.",
			example = "NewP@ssword123",
			requiredMode = Schema.RequiredMode.REQUIRED,
			minLength = 1,
			maxLength = 60,
			accessMode = Schema.AccessMode.WRITE_ONLY
	)
	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}

}