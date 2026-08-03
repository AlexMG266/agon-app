package es.udc.agon.backend.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "elo_historial")
public class EloHistorial {

    private Long id;
    private User usuario;
    private Encuentro encuentro;
    private int eloAnterior;
    private int eloNuevo;
    private String resultado;
    private LocalDateTime fecha;

    public EloHistorial() {
    }

    public EloHistorial(User usuario, Encuentro encuentro, int eloAnterior, int eloNuevo, String resultado,
            LocalDateTime fecha) {
        this.usuario = usuario;
        this.encuentro = encuentro;
        this.eloAnterior = eloAnterior;
        this.eloNuevo = eloNuevo;
        this.resultado = resultado;
        this.fecha = fecha;
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
    @JoinColumn(name = "idUsuario")
    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "idEncuentro")
    public Encuentro getEncuentro() {
        return encuentro;
    }

    public void setEncuentro(Encuentro encuentro) {
        this.encuentro = encuentro;
    }

    @Column(name = "eloAnterior", nullable = false)
    public int getEloAnterior() {
        return eloAnterior;
    }

    public void setEloAnterior(int eloAnterior) {
        this.eloAnterior = eloAnterior;
    }

    @Column(name = "eloNuevo", nullable = false)
    public int getEloNuevo() {
        return eloNuevo;
    }

    public void setEloNuevo(int eloNuevo) {
        this.eloNuevo = eloNuevo;
    }

    @Column(name = "resultado", nullable = false, length = 20)
    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    @Column(name = "fecha", nullable = false)
    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
