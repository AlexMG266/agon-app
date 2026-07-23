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
    private Integer numGrupos;
    private Integer equiposPorGrupo;
    private Boolean tienePlayoff;
    private String tipoTorneo;
    private Boolean idaVueltaPlayoff;
    private Boolean privado;
    private String codigoTorneo;
    private EstadoTorneo estado;
    private List<Grupo> grupos = new ArrayList<>();
    private List<Jornada> jornadas = new ArrayList<>();
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public Torneo() {
    }

    public Torneo(User organizador, String nombre, Boolean privado, String codigoTorneo) {
        this.organizador = organizador;
        this.nombre = nombre;
        this.numGrupos = null;
        this.equiposPorGrupo = null;
        this.tienePlayoff = null;
        this.tipoTorneo = null;
        this.idaVueltaPlayoff = null;
        this.privado = privado != null ? privado : false;
        this.codigoTorneo = codigoTorneo;
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

    @Column(name = "numGrupos", nullable = true)
    public Integer getNumGrupos() {
        return numGrupos;
    }

    public void setNumGrupos(Integer numGrupos) {
        this.numGrupos = numGrupos;
    }

    @Column(name = "equiposPorGrupo", nullable = true)
    public Integer getEquiposPorGrupo() {
        return equiposPorGrupo;
    }

    public void setEquiposPorGrupo(Integer equiposPorGrupo) {
        this.equiposPorGrupo = equiposPorGrupo;
    }

    @Column(name = "tipoTorneo", nullable = true)
    public String getTipoTorneo() {
        return tipoTorneo;
    }

    public void setTipoTorneo(String tipoTorneo) {
        this.tipoTorneo = tipoTorneo;
    }

    @Column(name = "tienePlayoff", nullable = true)
    public Boolean getTienePlayoff() {
        return tienePlayoff;
    }

    public void setTienePlayoff(Boolean tienePlayoff) {
        this.tienePlayoff = tienePlayoff;
    }

    @Column(name = "idaVueltaPlayoff", nullable = true)
    public Boolean getIdaVueltaPlayoff() {
        return idaVueltaPlayoff;
    }

    public void setIdaVueltaPlayoff(Boolean idaVueltaPlayoff) {
        this.idaVueltaPlayoff = idaVueltaPlayoff;
    }

    @Column(name = "privado", nullable = false)
    public Boolean getPrivado() {
        return privado;
    }

    public void setPrivado(Boolean privado) {
        this.privado = privado;
    }

    @Column(name = "codigoTorneo", length = 16, unique = true, nullable = false)
    public String getCodigoTorneo() {
        return codigoTorneo;
    }

    public void setCodigoTorneo(String codigoTorneo) {
        this.codigoTorneo = codigoTorneo;
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
