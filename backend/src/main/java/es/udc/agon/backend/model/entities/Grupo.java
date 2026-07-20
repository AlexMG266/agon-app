package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grupo")
public class Grupo {

    private Long id;
    private Torneo torneo;
    private String nombreGrupo;
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public Grupo() {
    }

    public Grupo(Torneo torneo, String nombreGrupo) {
        this.torneo = torneo;
        this.nombreGrupo = nombreGrupo;
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
    @JoinColumn(name = "idTorneo")
    public Torneo getTorneo() {
        return torneo;
    }

    public void setTorneo(Torneo torneo) {
        this.torneo = torneo;
    }

    @Column(name = "nombreGrupo", nullable = false)
    public String getNombreGrupo() {
        return nombreGrupo;
    }

    public void setNombreGrupo(String nombreGrupo) {
        this.nombreGrupo = nombreGrupo;
    }

    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Inscripcion> getInscripciones() {
        return inscripciones;
    }

    public void setInscripciones(List<Inscripcion> inscripciones) {
        this.inscripciones = inscripciones;
    }

    public boolean estaLleno() {
        return inscripciones.size() >= torneo.getEquiposPorGrupo();
    }
}
