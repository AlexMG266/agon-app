package es.udc.agon.backend.model.entities;

import java.util.HashSet;
import java.util.Set;

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

    private Long id;
    private String nombreEquipo;
    private EstadoEquipo estado;
    private User creador;
    private Set<User> miembros = new HashSet<>();

    public Equipo() {
    }

    public Equipo(String nombreEquipo, User creador) {
        this.nombreEquipo = nombreEquipo;
        this.estado = EstadoEquipo.ACTIVO;
        this.creador = creador;
        this.miembros.add(creador);
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
    @JoinColumn(name = "creador_id")
    public User getCreador() {
        return creador;
    }

    public void setCreador(User creador) {
        this.creador = creador;
    }

    @ManyToMany
    @JoinTable(name = "equipo_miembros", joinColumns = @JoinColumn(name = "equipo_id"), inverseJoinColumns = @JoinColumn(name = "usuario_id"))
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
}
