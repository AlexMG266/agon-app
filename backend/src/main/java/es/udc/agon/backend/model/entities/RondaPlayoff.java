package es.udc.agon.backend.model.entities;

public enum RondaPlayoff {
    FINAL, SEMIFINALES, CUARTOS, OCTAVOS, DIECISEISAVOS;

    public int equipos() {
        switch (this) {
            case DIECISEISAVOS:
                return 32;
            case OCTAVOS:
                return 16;
            case CUARTOS:
                return 8;
            case SEMIFINALES:
                return 4;
            default:
                return 2; // FINAL
        }
    }

    public static RondaPlayoff fromEquipos(int equipos) {
        switch (equipos) {
            case 32:
                return DIECISEISAVOS;
            case 16:
                return OCTAVOS;
            case 8:
                return CUARTOS;
            case 4:
                return SEMIFINALES;
            default:
                return FINAL;
        }
    }
}
