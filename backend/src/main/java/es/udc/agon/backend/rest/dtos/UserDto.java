package es.udc.agon.backend.rest.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class UserDto {

    public interface AllValidations {
    }

    public interface UpdateValidations {
    }

    private Long id;
    private int elo;

    @NotNull(groups = { AllValidations.class, UpdateValidations.class })
    @Size(min = 3, max = 15, groups = { AllValidations.class, UpdateValidations.class })
    @Pattern(
        regexp = "^(?![0-9])(?![0-9]+$)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(?: [a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$",
        message = "El nombre no puede empezar ni ser solo números, y solo permite caracteres alfanuméricos con espacios intermedios.",
        groups = { AllValidations.class, UpdateValidations.class }
    )
    private String nombre;

    @NotNull(groups = { AllValidations.class, UpdateValidations.class })
    @Size(min = 1, max = 120, groups = { AllValidations.class, UpdateValidations.class })
    @Email(groups = { AllValidations.class, UpdateValidations.class })
    private String email;

    @Size(max = 2097152, groups = { AllValidations.class, UpdateValidations.class })
    private String imagenPerfil;

    @NotNull(groups = { AllValidations.class })
    @Size(min = 8, max = 60, groups = { AllValidations.class })
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._\\-#\\+=\\[\\]\\{\\}\\(\\)\\^\\~/])[A-Za-z\\d@$!%*?&._\\-#\\+=\\[\\]\\{\\}\\(\\)\\^\\~/]{8,}$",
        message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
        groups = { AllValidations.class }
    )
    private String password;

    @NotNull(groups = { AllValidations.class, UpdateValidations.class })
    @Past(groups = { AllValidations.class, UpdateValidations.class })
    private LocalDate fechaNacimiento;

    private boolean eloProvisional;

    public UserDto() {
    }

    public UserDto(Long id, int elo, String nombre, String email, String imagenPerfil, LocalDate fechaNacimiento,
            boolean eloProvisional) {
        this.id = id;
        this.elo = elo;
        this.nombre = nombre != null ? nombre.trim() : null;
        this.email = email != null ? email.trim() : null;
        this.imagenPerfil = imagenPerfil != null ? imagenPerfil.trim() : null;
        this.fechaNacimiento = fechaNacimiento;
        this.eloProvisional = eloProvisional;
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
}