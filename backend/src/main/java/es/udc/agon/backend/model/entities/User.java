// src/main/java/es/udc/agon/backend/model/entities/User.java
package es.udc.agon.backend.model.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
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
    private boolean eloProvisional;
    private int partidosJugados;
    private String role;

    public User() {
    }

    public User(int elo, String nombre, String email, String imagenPerfil, String password,
            LocalDate fechaNacimiento, boolean eloProvisional) {
        this.elo = elo;
        this.nombre = nombre;
        this.email = email;
        this.imagenPerfil = imagenPerfil;
        this.password = password;
        this.fechaNacimiento = fechaNacimiento;
        this.eloProvisional = eloProvisional;
        this.partidosJugados = 0;
        this.role = "USER";
    }

    public User(String nombre, String email, String imagenPerfil, String password, LocalDate fechaNacimiento) {
        this(1500, nombre, email, imagenPerfil, password, fechaNacimiento, true);
    }

    public User(String nombre, String email, String imagenPerfil) {
        this(1500, nombre, email, imagenPerfil, null, null, true);
    }

    public User(String userName, String password, String firstName, String lastName, String email) {
        this(1500, userName, email, null, password, null, true);
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

    public boolean isEloProvisional() {
        return eloProvisional;
    }

    public void setEloProvisional(boolean eloProvisional) {
        this.eloProvisional = eloProvisional;
    }

    public int getPartidosJugados() {
        return partidosJugados;
    }

    public void setPartidosJugados(int partidosJugados) {
        this.partidosJugados = partidosJugados;
    }

    /**
     * Actualiza el ELO del jugador tras disputar un partido.
     * <p>
     * Utiliza el sistema de rating ELO con la formula:
     * E_a = 1 / (1 + 10^((R_b - R_a) / 400))
     * R_a' = R_a + K * (S_A - E_A)
     * </p>
     * <p>
     * El factor K es dinamico: empieza en 80 para jugadores nuevos y
     * disminuye 3.6 por partido hasta estabilizarse en K=8 a partir
     * de 20 partidos. Cuando el jugador alcanza 20 partidos,
     * {@code eloProvisional} pasa a {@code false}.
     * </p>
     *
     * @param eloRivalPromedio ELO promedio del equipo rival
     * @param ganador          {@code true} si el jugador ganó el encuentro,
     *                         {@code false} si perdio
     */
    public void actualizarElo(double eloRivalPromedio, boolean ganador) {
        double expected = 1.0 / (1.0 + Math.pow(10.0, (eloRivalPromedio - this.elo) / 400.0));
        double performed = ganador ? 1.0 : 0.0;
        int k = calcularK();
        int delta = (int) Math.round(k * (performed - expected));
        this.elo = Math.max(0, this.elo + delta);
        this.partidosJugados++;
        if (this.partidosJugados >= 20) {
            this.eloProvisional = false;
        }
    }

    /**
     * Calcula el factor K (varianza) para el sistema ELO.
     * <p>
     * Si el jugador ha jugado menos de 20 partidos, su K es alto
     * (comienza en 80) para que su rating converja rapidamente a su
     * nivel real. A partir de 20 partidos se estabiliza en 8.
     * </p>
     *
     * @return factor K entre 8 y 80 segun los partidos disputados
     */
    private int calcularK() {
        if (this.partidosJugados < 20) {
            return Math.max(8, 80 - (int) Math.round(3.6 * this.partidosJugados));
        }
        return 8;
    }

    @Column(name = "role", nullable = false, length = 20)
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}