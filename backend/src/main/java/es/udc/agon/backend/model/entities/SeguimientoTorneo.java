package es.udc.agon.backend.model.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SeguimientoTorneo", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuarioId", "torneoId"})
})
public class SeguimientoTorneo {

    private Long id;
    private User usuario;
    private Torneo torneo;
    private LocalDateTime fechaCreacion;

    public SeguimientoTorneo() {
    }

    public SeguimientoTorneo(User usuario, Torneo torneo) {
        this.usuario = usuario;
        this.torneo = torneo;
        this.fechaCreacion = LocalDateTime.now();
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
    @JoinColumn(name = "usuarioId")
    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "torneoId")
    public Torneo getTorneo() {
        return torneo;
    }

    public void setTorneo(Torneo torneo) {
        this.torneo = torneo;
    }

    @Column(name = "fechaCreacion", nullable = false)
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
