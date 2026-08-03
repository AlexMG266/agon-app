package es.udc.agon.backend.test.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.entities.UserDao;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.model.services.NotificationService;
import es.udc.agon.backend.rest.common.JwtGenerator;
import es.udc.agon.backend.rest.common.JwtInfo;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ControllerApiTest {

    private static final String PASSWORD_VALIDA = "P@ssword123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserDao userDao;

    @Autowired
    private JwtGenerator jwtGenerator;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private NotificationService notificationService;

    private User crearUsuario(String nombre, String email) {
        User user = new User(1500, nombre, email, "img.png", passwordEncoder.encode(PASSWORD_VALIDA),
                LocalDate.of(2000, 1, 1), true);
        userDao.save(user);
        return user;
    }

    private String tokenDe(User user) {
        return jwtGenerator.generate(new JwtInfo(user.getId(), "USER"));
    }

    private String body(Object dto) throws Exception {
        return objectMapper.writeValueAsString(dto);
    }

    private Equipo crearEquipoDe(User capitan, String nombre) throws Exception {
        return equipoService.crearEquipo(capitan.getId(), nombre, "desc");
    }

    private String crearTorneoYDevolverRespuesta(User org, String nombre) throws Exception {
        return mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "%s",
                                  "puntosVictoria": 3,
                                  "puntosEmpate": 1,
                                  "puntosDerrota": 0,
                                  "formatoPartidos": "4_SETS",
                                  "estrategiaDistribucion": "JORNADAS",
                                  "diasEntreJornadas": 7,
                                  "privado": false
                                }
                                """.formatted(nombre)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private Long crearTorneoPorHttp(User org, String nombre) throws Exception {
        return objectMapper.readTree(crearTorneoYDevolverRespuesta(org, nombre)).get("id").asLong();
    }

    private Long inscribirEquipoEnTorneo(User cap, Equipo equipo, Long torneoId) throws Exception {
        String solicitud = mockMvc.perform(post("/tournaments/" + torneoId + "/inscripciones")
                        .header("Authorization", "Bearer " + tokenDe(cap))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"equipoId\": " + equipo.getId() + "}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(solicitud).get("id").asLong();
    }

    private void unirMiembro(User cap, User jugador, Equipo equipo) throws Exception {
        String solicitud = mockMvc.perform(post("/teams/solicitudes")
                        .header("Authorization", "Bearer " + tokenDe(jugador))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigoEquipo\": \"" + equipo.getCodigoEquipo() + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long solicitudId = objectMapper.readTree(solicitud).get("id").asLong();

        mockMvc.perform(patch("/teams/solicitudes/" + solicitudId)
                        .header("Authorization", "Bearer " + tokenDe(cap))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "aceptar": true }
                                """))
                .andExpect(status().isNoContent());
    }

    private Long primeraNotificacionDe(User user) throws Exception {
        String respuesta = mockMvc.perform(get("/notifications")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        // el endpoint devuelve un bloque paginado { items: [...], existMoreItems: ... }
        return objectMapper.readTree(respuesta).get("items").get(0).get("id").asLong();
    }

    @Test
    public void testSignupDevuelveTokenYPerfil() throws Exception {
        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "nuevoUsuario",
                                  "email": "nuevo@mail.com",
                                  "password": "P@ssword123",
                                  "fechaNacimiento": "2000-05-10",
                                  "notificacionesPartidos": true,
                                  "diasAntelacionPartidos": 2
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.serviceToken").isNotEmpty())
                .andExpect(jsonPath("$.user.nombre").value("nuevoUsuario"))
                .andExpect(jsonPath("$.user.diasAntelacionPartidos").value(2));
    }

    @Test
    public void testSignupConPasswordDebilDevuelve400() throws Exception {
        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "otroUsuario",
                                  "email": "otro@mail.com",
                                  "password": "corta",
                                  "fechaNacimiento": "2000-05-10"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testSignupConEmailInvalidoDevuelve400() throws Exception {
        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "usuarioEmail",
                                  "email": "no-es-email",
                                  "password": "P@ssword123",
                                  "fechaNacimiento": "2000-05-10"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testLoginCorrectoDevuelve200() throws Exception {
        crearUsuario("loginUser", "login@mail.com");

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "nombre": "loginUser", "password": "P@ssword123" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceToken").isNotEmpty());
    }

    @Test
    public void testLoginIncorrectoDevuelve404() throws Exception {
        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "nombre": "noExiste", "password": "P@ssword123" }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testAccesoSinTokenDevuelve403() throws Exception {
        mockMvc.perform(get("/notifications"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAccesoConTokenInvalidoDevuelve401() throws Exception {
        mockMvc.perform(get("/notifications")
                        .header("Authorization", "Bearer tokenInvalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testActualizarPerfilPropioDevuelve200() throws Exception {
        User user = crearUsuario("updateUser", "update@mail.com");

        mockMvc.perform(put("/users/" + user.getId())
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "updateUserNuevo",
                                  "email": "update@mail.com",
                                  "fechaNacimiento": "2000-05-10",
                                  "notificacionesPartidos": false,
                                  "diasAntelacionPartidos": 3
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("updateUserNuevo"))
                .andExpect(jsonPath("$.notificacionesPartidos").value(false))
                .andExpect(jsonPath("$.diasAntelacionPartidos").value(3));
    }

    @Test
    public void testActualizarPerfilAjenoDevuelve403() throws Exception {
        User user = crearUsuario("userA", "a@mail.com");
        User otro = crearUsuario("userB", "b@mail.com");

        mockMvc.perform(put("/users/" + otro.getId())
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "userB",
                                  "email": "b@mail.com",
                                  "fechaNacimiento": "2000-05-10"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testActualizarPerfilConDatosInvalidosDevuelve400() throws Exception {
        User user = crearUsuario("userInv", "inv@mail.com");

        mockMvc.perform(put("/users/" + user.getId())
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "ab",
                                  "email": "invalido",
                                  "fechaNacimiento": "2099-01-01"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCambiarPasswordCorrectoDevuelve204() throws Exception {
        User user = crearUsuario("passUser", "pass@mail.com");

        mockMvc.perform(post("/users/" + user.getId() + "/changePassword")
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "oldPassword": "P@ssword123",
                                  "newPassword": "N@vaPass456"
                                }
                                """))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testCambiarPasswordIncorrectoDevuelve404() throws Exception {
        User user = crearUsuario("passUser2", "pass2@mail.com");

        mockMvc.perform(post("/users/" + user.getId() + "/changePassword")
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "oldPassword": "Mal@Pass999",
                                  "newPassword": "N@vaPass456"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCrearTorneoDevuelve201() throws Exception {
        User user = crearUsuario("orgTorneo", "orgt@mail.com");

        mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Copa Test",
                                  "puntosVictoria": 3,
                                  "puntosEmpate": 1,
                                  "puntosDerrota": 0,
                                  "formatoPartidos": "4_SETS",
                                  "estrategiaDistribucion": "JORNADAS",
                                  "diasEntreJornadas": 7,
                                  "privado": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Copa Test"));
    }

    @Test
    public void testConsultarTorneoCreadoDevuelve200() throws Exception {
        User user = crearUsuario("orgTorneo2", "orgt2@mail.com");

        String respuesta = mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Torneo Consulta",
                                  "puntosVictoria": 3,
                                  "puntosEmpate": 1,
                                  "puntosDerrota": 0,
                                  "formatoPartidos": "4_SETS",
                                  "estrategiaDistribucion": "JORNADAS",
                                  "diasEntreJornadas": 7,
                                  "privado": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(respuesta).get("id").asLong();

        mockMvc.perform(get("/tournaments/" + id)
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Torneo Consulta"));
    }

    @Test
    public void testLoginFromServiceTokenDevuelve200() throws Exception {
        User user = crearUsuario("svcToken", "svc@mail.com");
        String token = tokenDe(user);

        mockMvc.perform(post("/users/loginFromServiceToken")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceToken").value(token))
                .andExpect(jsonPath("$.user.nombre").value("svcToken"));
    }

    @Test
    public void testActualizarTorneoDevuelve200() throws Exception {
        User user = crearUsuario("orgEdit", "orge@mail.com");

        String respuesta = mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Torneo Editar",
                                  "puntosVictoria": 3,
                                  "puntosEmpate": 1,
                                  "puntosDerrota": 0,
                                  "formatoPartidos": "4_SETS",
                                  "estrategiaDistribucion": "JORNADAS",
                                  "diasEntreJornadas": 7,
                                  "privado": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(respuesta).get("id").asLong();

        mockMvc.perform(put("/tournaments/" + id)
                        .header("Authorization", "Bearer " + tokenDe(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Torneo Editado",
                                  "puntosVictoria": 5
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Torneo Editado"))
                .andExpect(jsonPath("$.puntosVictoria").value(5));
    }

    @Test
    public void testActualizarTorneoAjenoDevuelve403() throws Exception {
        User org = crearUsuario("orgA", "orga@mail.com");
        User otro = crearUsuario("orgB", "orgb@mail.com");

        String respuesta = mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "nombre": "Torneo Ajeno" }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(respuesta).get("id").asLong();

        mockMvc.perform(put("/tournaments/" + id)
                        .header("Authorization", "Bearer " + tokenDe(otro))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "nombre": "Hackeado" }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFlujoInscripcionCalendarioYResultadoDevuelve204() throws Exception {
        User org = crearUsuario("orgFlujo", "orgf@mail.com");
        User cap1 = crearUsuario("capUno", "cap1@mail.com");
        User cap2 = crearUsuario("capDos", "cap2@mail.com");

        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "Equipo Uno", "desc");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "Equipo Dos", "desc");

        String respuesta = mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Torneo Flujo",
                                  "puntosVictoria": 3,
                                  "puntosEmpate": 1,
                                  "puntosDerrota": 0,
                                  "formatoPartidos": "4_SETS",
                                  "estrategiaDistribucion": "JORNADAS",
                                  "diasEntreJornadas": 7,
                                  "privado": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long torneoId = objectMapper.readTree(respuesta).get("id").asLong();

        String solicitud1 = mockMvc.perform(post("/tournaments/" + torneoId + "/inscripciones")
                        .header("Authorization", "Bearer " + tokenDe(cap1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"equipoId\": " + equipo1.getId() + "}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        Long solicitud1Id = objectMapper.readTree(solicitud1).get("id").asLong();

        String solicitud2 = mockMvc.perform(post("/tournaments/" + torneoId + "/inscripciones")
                        .header("Authorization", "Bearer " + tokenDe(cap2))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"equipoId\": " + equipo2.getId() + "}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        Long solicitud2Id = objectMapper.readTree(solicitud2).get("id").asLong();

        mockMvc.perform(patch("/tournaments/" + torneoId + "/inscripciones/" + solicitud1Id)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"APROBADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/tournaments/" + torneoId + "/inscripciones/" + solicitud2Id)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"APROBADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/tournaments/" + torneoId)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"INSCRIPCION_CERRADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/tournaments/" + torneoId + "/estructura")
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tipoTorneo": "LIGA_UNICA",
                                  "numGrupos": 1,
                                  "equiposPorGrupo": 2,
                                  "tienePlayoff": false,
                                  "idaVueltaPlayoff": false,
                                  "estrategiaPlayoff": "RAPIDO"
                                }
                                """))
                .andExpect(status().isOk());

        String jornadas = mockMvc.perform(get("/tournaments/" + torneoId + "/jornadas")
                        .header("Authorization", "Bearer " + tokenDe(org)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long encuentroId = objectMapper.readTree(jornadas)
                .get(0).get("encuentros").get(0).get("id").asLong();

        mockMvc.perform(put("/encuentros/" + encuentroId + "/resultado")
                        .header("Authorization", "Bearer " + tokenDe(cap1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "sets": [
                                    { "golesLocal": 25, "golesVisitante": 20 },
                                    { "golesLocal": 25, "golesVisitante": 18 },
                                    { "golesLocal": 25, "golesVisitante": 20 }
                                  ]
                                }
                                """))
                .andExpect(status().isNoContent());

        // segundo registro del mismo resultado: el encuentro ya esta jugado
        mockMvc.perform(put("/encuentros/" + encuentroId + "/resultado")
                        .header("Authorization", "Bearer " + tokenDe(cap2))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "sets": [
                                    { "golesLocal": 25, "golesVisitante": 20 }
                                  ]
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testObtenerNotificacionesDevuelve200() throws Exception {
        User user = crearUsuario("notifUser", "notif@mail.com");

        mockMvc.perform(get("/notifications")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.existMoreItems").isBoolean());
    }

    @Test
    public void testObtenerMisPartidosDevuelve200() throws Exception {
        User user = crearUsuario("matchUser", "match@mail.com");

        mockMvc.perform(get("/encuentros")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testCrearEquipoDevuelve201() throws Exception {
        User cap = crearUsuario("capApi", "capapi@mail.com");

        mockMvc.perform(post("/teams")
                        .header("Authorization", "Bearer " + tokenDe(cap))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "nombreEquipo": "Equipo Api", "descripcion": "desc" }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombreEquipo").value("Equipo Api"))
                .andExpect(jsonPath("$.estado").value("ACTIVO"))
                .andExpect(jsonPath("$.codigoEquipo").isNotEmpty());
    }

    @Test
    public void testCrearEquipoConNombreVacioDevuelve400() throws Exception {
        User cap = crearUsuario("capInv", "capinv@mail.com");

        mockMvc.perform(post("/teams")
                        .header("Authorization", "Bearer " + tokenDe(cap))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "nombreEquipo": "", "descripcion": "desc" }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testPeticionDeUnionYRespuestaDelCapitanDevuelve204() throws Exception {
        User cap = crearUsuario("capPet", "cappet@mail.com");
        User jugador = crearUsuario("jugPet", "jugpet@mail.com");
        Equipo equipo = crearEquipoDe(cap, "Equipo Peticion");

        String solicitud = mockMvc.perform(post("/teams/solicitudes")
                        .header("Authorization", "Bearer " + tokenDe(jugador))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigoEquipo\": \"" + equipo.getCodigoEquipo() + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long solicitudId = objectMapper.readTree(solicitud).get("id").asLong();

        mockMvc.perform(patch("/teams/solicitudes/" + solicitudId)
                        .header("Authorization", "Bearer " + tokenDe(cap))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "aceptar": true }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/teams/" + equipo.getId())
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.miembros.length()").value(2));
    }

    @Test
    public void testPropuestaDeUnionDelCapitanDevuelve201() throws Exception {
        User cap = crearUsuario("capPro", "cappro@mail.com");
        User jugador = crearUsuario("jugPro", "jugpro@mail.com");
        Equipo equipo = crearEquipoDe(cap, "Equipo Propuesta");

        mockMvc.perform(post("/teams/" + equipo.getId() + "/solicitudes")
                        .header("Authorization", "Bearer " + tokenDe(cap))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"jugadorId\": " + jugador.getId() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipoSolicitud").value("PROPUESTA"));
    }

    @Test
    public void testAbandonarEquipoDevuelve204() throws Exception {
        User cap = crearUsuario("capLea", "caplea@mail.com");
        User jugador = crearUsuario("jugLea", "juglea@mail.com");
        Equipo equipo = crearEquipoDe(cap, "Equipo Abandono");
        unirMiembro(cap, jugador, equipo);

        mockMvc.perform(delete("/teams/" + equipo.getId() + "/miembros/me")
                        .header("Authorization", "Bearer " + tokenDe(jugador)))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testExpulsarMiembroDevuelve204() throws Exception {
        User cap = crearUsuario("capKic", "capkic@mail.com");
        User jugador = crearUsuario("jugKic", "jugkic@mail.com");
        Equipo equipo = crearEquipoDe(cap, "Equipo Expulsion");
        unirMiembro(cap, jugador, equipo);

        mockMvc.perform(delete("/teams/" + equipo.getId() + "/miembros/" + jugador.getId())
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testEliminarEquipoDevuelve204() throws Exception {
        User cap = crearUsuario("capDel", "capdel@mail.com");
        Equipo equipo = crearEquipoDe(cap, "Equipo Eliminar");

        mockMvc.perform(delete("/teams/" + equipo.getId())
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testListarEquiposDelUsuarioDevuelve200() throws Exception {
        User cap = crearUsuario("capLis", "caplis@mail.com");
        crearEquipoDe(cap, "Equipo Lista");

        mockMvc.perform(get("/teams")
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombreEquipo").value("Equipo Lista"));
    }

    @Test
    public void testBuscarEquipoPorCodigoDevuelve200() throws Exception {
        User cap = crearUsuario("capCod", "capcod@mail.com");
        Equipo equipo = crearEquipoDe(cap, "Equipo Codigo");

        mockMvc.perform(get("/teams/by-code/" + equipo.getCodigoEquipo())
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreEquipo").value("Equipo Codigo"));
    }

    @Test
    public void testObtenerNotificacionDetalleDevuelve200() throws Exception {
        User user = crearUsuario("notifDet", "notifdet@mail.com");
        notificationService.createWelcomeNotification(user);
        Long notifId = primeraNotificacionDe(user);

        mockMvc.perform(get("/notifications/" + notifId)
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(notifId))
                .andExpect(jsonPath("$.leido").value(false));
    }

    @Test
    public void testObtenerNotificacionAjenaDevuelve403() throws Exception {
        User user = crearUsuario("notifOwn", "notifown@mail.com");
        User otro = crearUsuario("notifOtro", "notifotro@mail.com");
        notificationService.createWelcomeNotification(user);
        Long notifId = primeraNotificacionDe(user);

        mockMvc.perform(get("/notifications/" + notifId)
                        .header("Authorization", "Bearer " + tokenDe(otro)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testMarcarNotificacionComoLeidaDevuelve200() throws Exception {
        User user = crearUsuario("notifLei", "notiflei@mail.com");
        notificationService.createWelcomeNotification(user);
        Long notifId = primeraNotificacionDe(user);

        mockMvc.perform(put("/notifications/" + notifId)
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leido").value(true));
    }

    @Test
    public void testObtenerMisTorneosDevuelve200() throws Exception {
        User org = crearUsuario("orgMy", "orgmy@mail.com");
        Long torneoId = crearTorneoPorHttp(org, "Torneo Propio");

        mockMvc.perform(get("/tournaments/my")
                        .header("Authorization", "Bearer " + tokenDe(org)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(torneoId));
    }

    @Test
    public void testSeguirYDejarDeSeguirTorneoDevuelve200() throws Exception {
        User org = crearUsuario("orgFol", "orgfol@mail.com");
        User user = crearUsuario("userFol", "userfol@mail.com");
        Long torneoId = crearTorneoPorHttp(org, "Torneo Seguido");

        mockMvc.perform(put("/tournaments/" + torneoId + "/seguidores/me")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/tournaments/followed")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(torneoId));

        mockMvc.perform(delete("/tournaments/" + torneoId + "/seguidores/me")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/tournaments/followed")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    public void testObtenerTorneosInscritosDevuelve200() throws Exception {
        User org = crearUsuario("orgEnc", "orgenc@mail.com");
        User cap = crearUsuario("capEnc", "capenc@mail.com");
        Long torneoId = crearTorneoPorHttp(org, "Torneo Inscrito");
        Equipo equipo = crearEquipoDe(cap, "Equipo Inscrito");
        Long solicitudId = inscribirEquipoEnTorneo(cap, equipo, torneoId);

        mockMvc.perform(patch("/tournaments/" + torneoId + "/inscripciones/" + solicitudId)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"APROBADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/tournaments/enrolled")
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(torneoId));
    }

    @Test
    public void testListarTorneosPaginadoDevuelve200() throws Exception {
        User org = crearUsuario("orgLis", "orglis@mail.com");
        crearTorneoPorHttp(org, "Torneo Publico");

        mockMvc.perform(get("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(org)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    public void testBuscarTorneoPorCodigoDevuelve200() throws Exception {
        User org = crearUsuario("orgCod", "orgcod@mail.com");
        String respuesta = crearTorneoYDevolverRespuesta(org, "Torneo Codigo Api");
        String codigo = objectMapper.readTree(respuesta).get("codigoTorneo").asText();

        mockMvc.perform(get("/tournaments/by-code/" + codigo)
                        .header("Authorization", "Bearer " + tokenDe(org)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Torneo Codigo Api"));
    }

    @Test
    public void testBuscarTorneosPorNombreDevuelve200() throws Exception {
        User org = crearUsuario("orgBusc", "orgbusc@mail.com");
        crearTorneoPorHttp(org, "Torneo BusquedaUnicaApi");

        mockMvc.perform(get("/tournaments")
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .param("filtro", "BusquedaUnicaApi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].nombre").value("Torneo BusquedaUnicaApi"));
    }

    @Test
    public void testObtenerSolicitudesPendientesYRechazarDevuelve200() throws Exception {
        User org = crearUsuario("orgSol", "orgsol@mail.com");
        User cap = crearUsuario("capSol", "capsol@mail.com");
        Long torneoId = crearTorneoPorHttp(org, "Torneo Solicitudes");
        Equipo equipo = crearEquipoDe(cap, "Equipo Solicitud");
        Long solicitudId = inscribirEquipoEnTorneo(cap, equipo, torneoId);

        mockMvc.perform(get("/tournaments/" + torneoId + "/inscripciones")
                        .header("Authorization", "Bearer " + tokenDe(org)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(solicitudId));

        mockMvc.perform(patch("/tournaments/" + torneoId + "/inscripciones/" + solicitudId)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"RECHAZADA\"}"))
                .andExpect(status().isOk());
    }

    @Test
    public void testObtenerSolicitudPorIdDevuelve200() throws Exception {
        User org = crearUsuario("orgSolId", "orgsol1@mail.com");
        User cap = crearUsuario("capSolId", "capsol1@mail.com");
        Long torneoId = crearTorneoPorHttp(org, "Torneo Solicitud Id");
        Equipo equipo = crearEquipoDe(cap, "Equipo Solicitud Id");
        Long solicitudId = inscribirEquipoEnTorneo(cap, equipo, torneoId);

        mockMvc.perform(get("/tournaments/inscripciones/" + solicitudId)
                        .header("Authorization", "Bearer " + tokenDe(cap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(solicitudId))
                .andExpect(jsonPath("$.equipoId").value(equipo.getId()))
                .andExpect(jsonPath("$.torneoId").value(torneoId));
    }

    @Test
    public void testConsultarTorneoInexistenteDevuelve404() throws Exception {
        User user = crearUsuario("orgNoExiste", "orgnoexiste@mail.com");

        mockMvc.perform(get("/tournaments/999999")
                        .header("Authorization", "Bearer " + tokenDe(user)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.globalError").isNotEmpty());
    }

    @Test
    public void testSignupConNombreDuplicadoDevuelve400() throws Exception {
        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "dupNombre",
                                  "email": "dup1@mail.com",
                                  "password": "P@ssword123",
                                  "fechaNacimiento": "2000-05-10"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "dupNombre",
                                  "email": "dup2@mail.com",
                                  "password": "P@ssword123",
                                  "fechaNacimiento": "2000-05-10"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.globalError").isNotEmpty());
    }

    @Test
    public void testHistorialEloTrasRegistrarResultado() throws Exception {
        User org = crearUsuario("orgElo", "orgelo@mail.com");
        User cap1 = crearUsuario("capEloUno", "capelo1@mail.com");
        User cap2 = crearUsuario("capEloDos", "capelo2@mail.com");
        User curioso = crearUsuario("curiosoElo", "curiosoelo@mail.com");

        Equipo equipo1 = equipoService.crearEquipo(cap1.getId(), "Equipo Elo Uno", "desc");
        Equipo equipo2 = equipoService.crearEquipo(cap2.getId(), "Equipo Elo Dos", "desc");

        Long torneoId = crearTorneoPorHttp(org, "Torneo Elo");

        Long solicitud1Id = inscribirEquipoEnTorneo(cap1, equipo1, torneoId);
        Long solicitud2Id = inscribirEquipoEnTorneo(cap2, equipo2, torneoId);

        mockMvc.perform(patch("/tournaments/" + torneoId + "/inscripciones/" + solicitud1Id)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"APROBADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/tournaments/" + torneoId + "/inscripciones/" + solicitud2Id)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"APROBADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/tournaments/" + torneoId)
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": \"INSCRIPCION_CERRADA\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/tournaments/" + torneoId + "/estructura")
                        .header("Authorization", "Bearer " + tokenDe(org))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tipoTorneo": "LIGA_UNICA",
                                  "numGrupos": 1,
                                  "equiposPorGrupo": 2,
                                  "tienePlayoff": false,
                                  "idaVueltaPlayoff": false,
                                  "estrategiaPlayoff": "RAPIDO"
                                }
                                """))
                .andExpect(status().isOk());

        String jornadas = mockMvc.perform(get("/tournaments/" + torneoId + "/jornadas")
                        .header("Authorization", "Bearer " + tokenDe(org)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long encuentroId = objectMapper.readTree(jornadas)
                .get(0).get("encuentros").get(0).get("id").asLong();

        // victoria local 3-0 (ambos equipos con ELO medio 1500 -> esperado 0.5, K=32)
        mockMvc.perform(put("/encuentros/" + encuentroId + "/resultado")
                        .header("Authorization", "Bearer " + tokenDe(cap1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "sets": [
                                    { "golesLocal": 25, "golesVisitante": 20 },
                                    { "golesLocal": 25, "golesVisitante": 18 },
                                    { "golesLocal": 25, "golesVisitante": 20 }
                                  ]
                                }
                                """))
                .andExpect(status().isNoContent());

        // historial del ganador: VICTORIA, 1500 -> 1516 (+16)
        mockMvc.perform(get("/users/" + cap1.getId() + "/elo-history")
                        .header("Authorization", "Bearer " + tokenDe(cap1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].resultado").value("VICTORIA"))
                .andExpect(jsonPath("$[0].eloAnterior").value(1500))
                .andExpect(jsonPath("$[0].eloNuevo").value(1516))
                .andExpect(jsonPath("$[0].variacion").value(16))
                .andExpect(jsonPath("$[0].encuentroId").value(encuentroId))
                .andExpect(jsonPath("$[0].equipoLocal").value("Equipo Elo Uno"))
                .andExpect(jsonPath("$[0].equipoVisitante").value("Equipo Elo Dos"))
                .andExpect(jsonPath("$[0].fecha").isNotEmpty());

        // historial del perdedor: DERROTA, 1500 -> 1484 (-16)
        mockMvc.perform(get("/users/" + cap2.getId() + "/elo-history")
                        .header("Authorization", "Bearer " + tokenDe(cap2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].resultado").value("DERROTA"))
                .andExpect(jsonPath("$[0].eloAnterior").value(1500))
                .andExpect(jsonPath("$[0].eloNuevo").value(1484))
                .andExpect(jsonPath("$[0].variacion").value(-16));

        // el usuario sin permisos no puede ver el historial ajeno
        mockMvc.perform(get("/users/" + cap1.getId() + "/elo-history")
                        .header("Authorization", "Bearer " + tokenDe(curioso)))
                .andExpect(status().isForbidden());

        // historial inexistente
        mockMvc.perform(get("/users/999999/elo-history")
                        .header("Authorization", "Bearer " + tokenDe(curioso)))
                .andExpect(status().isForbidden());
    }
}
