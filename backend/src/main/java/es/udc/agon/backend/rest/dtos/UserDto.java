package es.udc.agon.backend.rest.dtos;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

@Schema(description = "DTO que representa la información de perfil, estadísticas de ELO y credenciales de un usuario")
public class UserDto {

    public interface AllValidations {
    }

    public interface UpdateValidations {
    }

    @Schema(description = "ID único del usuario", example = "42", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "Puntuación de habilidad (ELO) del jugador", example = "1500", accessMode = Schema.AccessMode.READ_ONLY)
    private int elo;

    @NotNull(groups = { AllValidations.class, UpdateValidations.class })
    @Size(min = 3, max = 15, groups = { AllValidations.class, UpdateValidations.class })
    @Pattern(
            regexp = "^(?![0-9])(?![0-9]+$)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(?: [a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$",
            message = "El nombre no puede empezar ni ser solo números, y solo permite caracteres alfanuméricos con espacios intermedios.",
            groups = { AllValidations.class, UpdateValidations.class }
    )
    @Schema(description = "Nombre único del usuario. No puede comenzar ni contener únicamente números.", example = "Drako266", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @NotNull(groups = { AllValidations.class, UpdateValidations.class })
    @Size(min = 1, max = 120, groups = { AllValidations.class, UpdateValidations.class })
    @Email(groups = { AllValidations.class, UpdateValidations.class })
    @Schema(description = "Dirección de correo electrónico", example = "user@agon.udc.es", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @Size(max = 2097152, groups = { AllValidations.class, UpdateValidations.class })
    @Schema(description = "Imagen de perfil codificada en Base64 (máximo 2MB)", example = "data:image/png;base64,iVBORw0KGgo...", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String imagenPerfil;

    @NotNull(groups = { AllValidations.class })
    @Size(min = 8, max = 60, groups = { AllValidations.class })
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._\\-#\\+=\\[\\]\\{\\}\\(\\)\\^\\~/])[A-Za-z\\d@$!%*?&._\\-#\\+=\\[\\]\\{\\}\\(\\)\\^\\~/]{8,}$",
            message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
            groups = { AllValidations.class }
    )
    @Schema(
            description = "Contraseña de acceso. Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial. Solo se procesa en el registro.",
            example = "P@ssword123",
            accessMode = Schema.AccessMode.WRITE_ONLY
    )
    private String password;

    @NotNull(groups = { AllValidations.class, UpdateValidations.class })
    @Past(groups = { AllValidations.class, UpdateValidations.class })
    @Schema(description = "Fecha de nacimiento del usuario. Debe ser una fecha pasada.", example = "2000-01-15", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate fechaNacimiento;

    @Schema(description = "Indica si el ELO del jugador es provisional (pocas partidas jugadas)", example = "true", accessMode = Schema.AccessMode.READ_ONLY)
    private boolean eloProvisional;

    @Schema(description = "Indica si el usuario desea recibir avisos de sus partidos", example = "true")
    private boolean notificacionesPartidos = true;

    @Schema(description = "Número de días de antelación con los que se avisa de un partido", example = "1")
    private int diasAntelacionPartidos = 1;

    public UserDto() {
    }

    public UserDto(Long id, int elo, String nombre, String email, String imagenPerfil, LocalDate fechaNacimiento,
                   boolean eloProvisional) {
        this(id, elo, nombre, email, imagenPerfil, fechaNacimiento, eloProvisional, true, 1);
    }

    public UserDto(Long id, int elo, String nombre, String email, String imagenPerfil, LocalDate fechaNacimiento,
                   boolean eloProvisional, boolean notificacionesPartidos, int diasAntelacionPartidos) {
        this.id = id;
        this.elo = elo;
        this.nombre = nombre != null ? nombre.trim() : null;
        this.email = email != null ? email.trim() : null;
        this.imagenPerfil = imagenPerfil != null ? imagenPerfil.trim() : null;
        this.fechaNacimiento = fechaNacimiento;
        this.eloProvisional = eloProvisional;
        this.notificacionesPartidos = notificacionesPartidos;
        this.diasAntelacionPartidos = diasAntelacionPartidos;
    }

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
        this.nombre = nombre != null ? nombre.trim() : null;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    public String getImagenPerfil() {
        return imagenPerfil;
    }

    public void setImagenPerfil(String imagenPerfil) {
        this.imagenPerfil = imagenPerfil != null ? imagenPerfil.trim() : null;
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

    public boolean isEloProvisional() {
        return eloProvisional;
    }

    public void setEloProvisional(boolean eloProvisional) {
        this.eloProvisional = eloProvisional;
    }

    public boolean isNotificacionesPartidos() {
        return notificacionesPartidos;
    }

    public void setNotificacionesPartidos(boolean notificacionesPartidos) {
        this.notificacionesPartidos = notificacionesPartidos;
    }

    public int getDiasAntelacionPartidos() {
        return diasAntelacionPartidos;
    }

    public void setDiasAntelacionPartidos(int diasAntelacionPartidos) {
        this.diasAntelacionPartidos = diasAntelacionPartidos;
    }
}