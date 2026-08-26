package es.udc.agon.backend.model.entities;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "equipo")
public class Equipo {

    private static final String ALFANUMERICO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private Long id;
    private String nombreEquipo;
    private EstadoEquipo estado;
    private String descripcion;
    private User creador;
    private String codigoEquipo;
    private LocalDateTime fechaCreacion;
    private Set<User> miembros = new HashSet<>();

    public Equipo() {
    }

    public Equipo(String nombreEquipo, String descripcion, User creador) {
        this.nombreEquipo = nombreEquipo;
        this.estado = EstadoEquipo.ACTIVO;
        this.descripcion = descripcion;
        this.creador = creador;
        this.miembros.add(creador);
        this.codigoEquipo = generarCodigoAlfanumerico(8);
        this.fechaCreacion = LocalDateTime.now();
    }

    private String generarCodigoAlfanumerico(int longitud) {
        StringBuilder sb = new StringBuilder(longitud);
        for (int i = 0; i < longitud; i++) {
            int index = RANDOM.nextInt(ALFANUMERICO.length());
            sb.append(ALFANUMERICO.charAt(index));
        }
        return sb.toString();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "nombreEquipo")
    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    @Enumerated(EnumType.STRING)
    public EstadoEquipo getEstado() {
        return estado;
    }

    public void setEstado(EstadoEquipo estado) {
        this.estado = estado;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "creadorId")
    public User getCreador() {
        return creador;
    }

    public void setCreador(User creador) {
        this.creador = creador;
    }

    @Column(name = "codigoEquipo", nullable = false, unique = true, length = 8)
    public String getCodigoEquipo() {
        return codigoEquipo;
    }

    public void setCodigoEquipo(String codigoEquipo) {
        this.codigoEquipo = codigoEquipo;
    }

    @ManyToMany
    @JoinTable(
            name = "EquipoMiembros",
            joinColumns = @JoinColumn(name = "equipoId"),
            inverseJoinColumns = @JoinColumn(name = "usuarioId")
    )
    public Set<User> getMiembros() {
        return miembros;
    }

    public void setMiembros(Set<User> miembros) {
        this.miembros = miembros;
    }

    public void addMiembro(User user) {
        this.miembros.add(user);
    }

    public void removeMiembro(User user) {
        this.miembros.remove(user);
    }

    @Column(name = "descripcion")
    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    @Column(name = "fechaCreacion", nullable = false)
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}