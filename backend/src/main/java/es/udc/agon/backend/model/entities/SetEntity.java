package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "SetEntity")
public class SetEntity {

    private Long id;
    private Encuentro encuentro;
    private int numeroSet;
    private int golesLocal;
    private int golesVisitante;

    public SetEntity() {
    }

    public SetEntity(Encuentro encuentro, int numeroSet, int golesLocal, int golesVisitante) {
        this.encuentro = encuentro;
        this.numeroSet = numeroSet;
        this.golesLocal = golesLocal;
        this.golesVisitante = golesVisitante;
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
    @JoinColumn(name = "idEncuentro")
    public Encuentro getEncuentro() {
        return encuentro;
    }

    public void setEncuentro(Encuentro encuentro) {
        this.encuentro = encuentro;
    }

    @Column(name = "numeroSet", nullable = false)
    public int getNumeroSet() {
        return numeroSet;
    }

    public void setNumeroSet(int numeroSet) {
        this.numeroSet = numeroSet;
    }

    @Column(name = "golesLocal", nullable = false)
    public int getGolesLocal() {
        return golesLocal;
    }

    public void setGolesLocal(int golesLocal) {
        this.golesLocal = golesLocal;
    }

    @Column(name = "golesVisitante", nullable = false)
    public int getGolesVisitante() {
        return golesVisitante;
    }

    public void setGolesVisitante(int golesVisitante) {
        this.golesVisitante = golesVisitante;
    }
}
