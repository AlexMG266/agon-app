package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "torneo")
public class Torneo {

    private Long id;
    private User organizador;
    private String nombre;
    private int numGrupos;
    private int equiposPorGrupo;
    private boolean tienePlayoff;
    private EstadoTorneo estado;
    private List<Grupo> grupos = new ArrayList<>();
    private List<Jornada> jornadas = new ArrayList<>();
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public Torneo() {
    }

    public Torneo(User organizador, String nombre, int numGrupos, int equiposPorGrupo, boolean tienePlayoff) {
        this.organizador = organizador;
        this.nombre = nombre;
        this.numGrupos = numGrupos;
        this.equiposPorGrupo = equiposPorGrupo;
        this.tienePlayoff = tienePlayoff;
        this.estado = EstadoTorneo.RECLUTANDO;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "idOrganizador")
    public User getOrganizador() {
        return organizador;
    }

    public void setOrganizador(User organizador) {
        this.organizador = organizador;
    }

    @Column(name = "nombre", nullable = false)
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    @Column(name = "numGrupos")
    public int getNumGrupos() {
        return numGrupos;
    }

    public void setNumGrupos(int numGrupos) {
        this.numGrupos = numGrupos;
    }

    @Column(name = "equiposPorGrupo")
    public int getEquiposPorGrupo() {
        return equiposPorGrupo;
    }

    public void setEquiposPorGrupo(int equiposPorGrupo) {
        this.equiposPorGrupo = equiposPorGrupo;
    }

    @Column(name = "tienePlayoff")
    public boolean isTienePlayoff() {
        return tienePlayoff;
    }

    public void setTienePlayoff(boolean tienePlayoff) {
        this.tienePlayoff = tienePlayoff;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    public EstadoTorneo getEstado() {
        return estado;
    }

    public void setEstado(EstadoTorneo estado) {
        this.estado = estado;
    }

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Grupo> getGrupos() {
        return grupos;
    }

    public void setGrupos(List<Grupo> grupos) {
        this.grupos = grupos;
    }

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Jornada> getJornadas() {
        return jornadas;
    }

    public void setJornadas(List<Jornada> jornadas) {
        this.jornadas = jornadas;
    }

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Inscripcion> getInscripciones() {
        return inscripciones;
    }

    public void setInscripciones(List<Inscripcion> inscripciones) {
        this.inscripciones = inscripciones;
    }
}
