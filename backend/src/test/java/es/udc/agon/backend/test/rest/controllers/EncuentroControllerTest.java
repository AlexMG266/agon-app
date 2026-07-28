package es.udc.agon.backend.test.rest.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.model.services.IEncuentroService;
import es.udc.agon.backend.model.services.TorneoService;
import es.udc.agon.backend.rest.dtos.AplazamientoDto;
import es.udc.agon.backend.rest.dtos.SetDto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class EncuentroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IEncuentroService encuentroService;

    @Autowired
    private TorneoService torneoService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TorneoDao torneoDao;

    @Autowired
    private JornadaDao jornadaDao;

    @Autowired
    private EncuentroDao encuentroDao;

    @Autowired
    private InscripcionDao inscripcionDao;

    private ObjectMapper objectMapper;

    private User org;
    private User cap1;
    private User cap2;
    private Encuentro encuentro;
    private Long userId;

    @BeforeEach
    public void setUp() throws InstanceNotFoundException, PermissionException {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        org = createUser("org_cont");
        cap1 = createUser("cap_cont1");
        cap2 = createUser("cap_cont2");
        userId = cap1.getId();

        encuentro = setupEncuentro(org, cap1, cap2);
    }

    private User createUser(String nombre) {
        User user = new User(1500, nombre, nombre + "@mail.com", "img.png", "password",
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    private Inscripcion inscribirEquipo(User capitan, Torneo torneo, Equipo equipo)
            throws InstanceNotFoundException, PermissionException {
        var solicitud = torneoService.solicitarInscripcion(
                capitan.getId(), torneo.getId(), equipo.getId(), null);
        return torneoService.aprobarInscripcion(
                torneo.getOrganizador().getId(), solicitud.getId());
    }

    private Encuentro setupEncuentro(User org, User cap1, User cap2)
            throws InstanceNotFoundException, PermissionException {

        Torneo torneo = new Torneo(org, "Torneo Cont Test", false, "TC99-XXXX");
        torneo = torneoService.crearTorneo(org.getId(), torneo, false);

        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "EquipoContLocal", "Local");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "EquipoContVisit", "Visitante");

        inscribirEquipo(cap1, torneo, equipo1);
        inscribirEquipo(cap2, torneo, equipo2);

        torneoService.cerrarInscripciones(torneo.getId());
        torneoService.configurarEstructuraYGenerarCalendario(
                torneo.getId(), "LIGA_UNICA", 1, 2, false, false, null, null, null);

        List<Jornada> jornadas = jornadaDao.findByTorneoIdOrderByNumeroJornadaAsc(torneo.getId());
        return jornadas.get(0).getEncuentros().get(0);
    }

    @Test
    public void testGetMyEncounters() throws Exception {
        mockMvc.perform(get("/encounters/my")
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].equipoLocalNombre", is("EquipoContLocal")))
                .andExpect(jsonPath("$[0].equipoVisitanteNombre", is("EquipoContVisit")))
                .andExpect(jsonPath("$[0].estado", is("PENDIENTE")));
    }

    @Test
    public void testGetMyEncountersSinParticipacion() throws Exception {
        User sinEquipo = createUser("sin_equipo_cont");
        mockMvc.perform(get("/encounters/my")
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", sinEquipo.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    public void testRegistrarResultado() throws Exception {
        List<SetDto> sets = new ArrayList<>();
        sets.add(new SetDto(1, 25, 20));
        sets.add(new SetDto(2, 25, 18));
        sets.add(new SetDto(3, 20, 25));
        sets.add(new SetDto(4, 25, 22));

        String json = objectMapper.writeValueAsString(sets);

        mockMvc.perform(post("/encounters/{id}/result", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        Encuentro actualizado = encuentroDao.findById(encuentro.getId()).get();
        assert actualizado.getEstadoEncuentro() == EstadoEncuentro.JUGADO;
    }

    @Test
    public void testRegistrarResultadoEncuentroNoExistente() throws Exception {
        List<SetDto> sets = new ArrayList<>();
        sets.add(new SetDto(1, 25, 20));

        String json = objectMapper.writeValueAsString(sets);

        mockMvc.perform(post("/encounters/{id}/result", 99999L)
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testRegistrarResultadoYaJugado() throws Exception {
        List<SetEntity> setEntities = new ArrayList<>();
        setEntities.add(new SetEntity(null, 1, 25, 20));
        setEntities.add(new SetEntity(null, 2, 25, 18));
        setEntities.add(new SetEntity(null, 3, 25, 20));
        encuentroService.registrarResultado(encuentro.getId(), setEntities);

        List<SetDto> sets = new ArrayList<>();
        sets.add(new SetDto(1, 25, 20));

        String json = objectMapper.writeValueAsString(sets);

        mockMvc.perform(post("/encounters/{id}/result", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegistrarResultadoSetsVacios() throws Exception {
        String json = objectMapper.writeValueAsString(new ArrayList<>());

        mockMvc.perform(post("/encounters/{id}/result", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testSolicitarAplazamiento() throws Exception {
        AplazamientoDto dto = new AplazamientoDto(LocalDateTime.now().plusDays(14), "Motivo de prueba");
        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/encounters/{id}/postpone", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        Encuentro actualizado = encuentroDao.findById(encuentro.getId()).get();
        assert actualizado.getEstadoEncuentro() == EstadoEncuentro.SOLICITADO_APLAZAMIENTO;
    }

    @Test
    public void testSolicitarAplazamientoSinPermiso() throws Exception {
        User otro = createUser("otro_cont");
        AplazamientoDto dto = new AplazamientoDto(LocalDateTime.now().plusDays(14), "Sin permiso");
        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/encounters/{id}/postpone", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", otro.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testSolicitarAplazamientoEncuentroNoExistente() throws Exception {
        AplazamientoDto dto = new AplazamientoDto(LocalDateTime.now().plusDays(14), "No existe");
        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/encounters/{id}/postpone", 99999L)
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testSolicitarAplazamientoFechaPasada() throws Exception {
        AplazamientoDto dto = new AplazamientoDto(LocalDateTime.now().minusDays(1), "Fecha pasada");
        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/encounters/{id}/postpone", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testSolicitarAplazamientoEncuentroYaJugado() throws Exception {
        List<SetEntity> setEntities = new ArrayList<>();
        setEntities.add(new SetEntity(null, 1, 25, 20));
        setEntities.add(new SetEntity(null, 2, 25, 18));
        setEntities.add(new SetEntity(null, 3, 25, 20));
        encuentroService.registrarResultado(encuentro.getId(), setEntities);

        AplazamientoDto dto = new AplazamientoDto(LocalDateTime.now().plusDays(14), "Ya jugado");
        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/encounters/{id}/postpone", encuentro.getId())
                        .with(user("user").roles("USER"))
                        .requestAttr("userId", cap1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}
