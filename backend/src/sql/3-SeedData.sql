-- ============================================================
-- SCRIPT DE DATOS DE PRUEBA (Seed Data)
-- ============================================================
-- 41 usuarios, 20 equipos (2 miembros c/u), 81 torneos
--
-- Organizador: user000 (contraseña: User000!)
-- 40 competidores: test001 a test040 (contraseña: TestXXX!)
-- Equipos: 20 equipos de 2 miembros (códigos auto-generados)
-- Torneos:
--   1 torneo de prueba (user000) con 20 equipos inscritos
--   40 torneos públicos (1 por test user)
--   40 torneos privados (1 por test user)
-- ============================================================

-- ============================================================
-- 1. USUARIOS (41: user000 organizador + test001-test040 jugadores)
-- ============================================================
INSERT INTO "User" (elo, nombre, email, imagenPerfil, password, fechaNacimiento, eloProvisional, role)
VALUES
    (2000, 'user000', 'user000@email.com', NULL, '$2a$10$wCYcAl7RqRo313h1ie1tfOHHRX0sf2MANQWo/WEqyl1ELQ7CZGv76', '1990-01-01', FALSE, 'USER');

INSERT INTO "User" (elo, nombre, email, imagenPerfil, password, fechaNacimiento, eloProvisional, role)
VALUES
    (1000, 'test001', 'test001@email.com', NULL, '$2a$10$tkqVLzAq6RtN.FbRJyH1K.hXZA3lduiKfrA0fGL0/WRarSEMnxING', '1990-02-01', FALSE, 'USER'),
    (1010, 'test002', 'test002@email.com', NULL, '$2a$10$Qrg2loatbRjnFN9CsleVmuTGAdQu1cAsofRnaPpZlieLWpPuFYto.', '1990-03-01', FALSE, 'USER'),
    (1021, 'test003', 'test003@email.com', NULL, '$2a$10$39uqwOhTSqeSWfDwfqKNpO9VXvwdhWccdC9pIuIjozy6tQsFyti.a', '1990-04-01', FALSE, 'USER'),
    (1031, 'test004', 'test004@email.com', NULL, '$2a$10$79rES9rmUOm2fSRT6a/7cej/r60ILuBaHfQSpyDSY/Q5P4VyyF6fm', '1990-05-01', FALSE, 'USER'),
    (1041, 'test005', 'test005@email.com', NULL, '$2a$10$f2e.USx0zEEgS3swd9yR4u8x4lMF1tYzWi2nv2AXT69wbevnwQm..', '1990-06-01', FALSE, 'USER'),
    (1051, 'test006', 'test006@email.com', NULL, '$2a$10$TE8cFIW7gpmiLpb6LxDZN.x0b5rtR2puRMkXCqqFyzxpt3mpmW.VO', '1990-07-01', FALSE, 'USER'),
    (1062, 'test007', 'test007@email.com', NULL, '$2a$10$0xrjZFKIa9kpTfdyKZeKH.gXB/doh/XbYlLCXq7UOmXgWD.mdVW3O', '1990-08-01', FALSE, 'USER'),
    (1072, 'test008', 'test008@email.com', NULL, '$2a$10$OqeD9iq.RmrTtYoCla55EObiyz.TJMbYY7PdpFgQY/VSMytl03SrK', '1990-09-01', FALSE, 'USER'),
    (1082, 'test009', 'test009@email.com', NULL, '$2a$10$TUqu0SKMDMmgaZQ9UHhZVeE3LAGw/ZJn1Qn/iz7yapySy7AQlAWuO', '1990-10-01', FALSE, 'USER'),
    (1092, 'test010', 'test010@email.com', NULL, '$2a$10$Q0KJ0EZOnpo0TioaucAgpOK2cYDunecKPue63fAgQDB2UZSOF9ibC', '1990-11-01', FALSE, 'USER'),
    (1103, 'test011', 'test011@email.com', NULL, '$2a$10$DOEyf0kl7lRnXJbDXwJbP.in6FuBqpHc0wzEZZ99QcNEjdDn9eiSi', '1990-12-01', FALSE, 'USER'),
    (1113, 'test012', 'test012@email.com', NULL, '$2a$10$VYUT6ZkVK6UN7tK7kL5dDO80wrK.lMGh7hs3pYi.eTnNhbTIJ8W2O', '1991-01-01', FALSE, 'USER'),
    (1123, 'test013', 'test013@email.com', NULL, '$2a$10$mWQ6ND6ADoZgpYqrh3pcpu0HykYiwKjAm22Hh1dxDrFKzQkR0Qp2S', '1991-02-01', FALSE, 'USER'),
    (1133, 'test014', 'test014@email.com', NULL, '$2a$10$cI3Xf09UtGiXSnKE.pvhT.qC.p.IdutN85mZz86x6jvlgY/JniV5i', '1991-03-01', FALSE, 'USER'),
    (1144, 'test015', 'test015@email.com', NULL, '$2a$10$5tOT4LAh2hscOZh/u0iUd.DbJpTXlQGRhs58JuLONkoCHufp9OucW', '1991-04-01', FALSE, 'USER'),
    (1154, 'test016', 'test016@email.com', NULL, '$2a$10$vwBvJG7VdW0wReHt20Bt1e55DNFxhYcJ6ay3I5JdhWjcY5DoRHHAq', '1991-05-01', FALSE, 'USER'),
    (1164, 'test017', 'test017@email.com', NULL, '$2a$10$9O4DFF38dgCyM32iEsQXru79RhApvDadCzhjtb9NdpgS4RU9TQ5fe', '1991-06-01', FALSE, 'USER'),
    (1174, 'test018', 'test018@email.com', NULL, '$2a$10$gm.7HYUEXeh6XRGeYexvJ.5YWIl60RGDQqbNnGF5uMXpV8.E5UayO', '1991-07-01', FALSE, 'USER'),
    (1185, 'test019', 'test019@email.com', NULL, '$2a$10$8R8oxku1oEkmJ3Ep6l1XruEbNXKAznA0u8dOikzZIOXVnueKwc6Q6', '1991-08-01', FALSE, 'USER'),
    (1195, 'test020', 'test020@email.com', NULL, '$2a$10$YLim0mOWYV9SV6NdBC2AXu05Zklalzu/NX3joQKS1VNI3tK0WT/aC', '1991-09-01', FALSE, 'USER'),
    (1205, 'test021', 'test021@email.com', NULL, '$2a$10$XcsvJ1Ds4SkNLuvA1I1NouAqWLncIs0I0Vp6hcj1nLxCwWxACZqHa', '1991-10-01', FALSE, 'USER'),
    (1215, 'test022', 'test022@email.com', NULL, '$2a$10$ARA5wHWqaBxuVMmyQoFaNOB0hlPrutsvH.ljotvLrzi.S9zvbe5iG', '1991-11-01', FALSE, 'USER'),
    (1226, 'test023', 'test023@email.com', NULL, '$2a$10$t5Ev36fpPwh9q7LctqQIIei7BdSu27Q8x6kqPohGzuVrIgXfx/ATW', '1991-12-01', FALSE, 'USER'),
    (1236, 'test024', 'test024@email.com', NULL, '$2a$10$BF4YCytuTz6./q/dTFUsx.rhu6i/kmD1fMONFenb7gXyyjsJWPtZC', '1992-01-01', FALSE, 'USER'),
    (1246, 'test025', 'test025@email.com', NULL, '$2a$10$2bywEIAEtlHuq3FOGF4VDObfii8tZcN.Lh3oLqqUi90.YMWy1BaDG', '1992-02-01', FALSE, 'USER'),
    (1256, 'test026', 'test026@email.com', NULL, '$2a$10$u17LnhkM9nLn18.8Ge.MpuFjbFaIYnTfnnOjlLhepJAJ4t7NYIvVq', '1992-03-01', FALSE, 'USER'),
    (1267, 'test027', 'test027@email.com', NULL, '$2a$10$hJskCNRsklK3.19eVPg.Qu3ZmY4ypVu3YTfE734dBoUn9ZFcRV0.q', '1992-04-01', FALSE, 'USER'),
    (1277, 'test028', 'test028@email.com', NULL, '$2a$10$Kugagx.DdIGZzMAflSJrTeQhD/BdQOKQtKMYFWaRarRQfahOtEGhO', '1992-05-01', FALSE, 'USER'),
    (1287, 'test029', 'test029@email.com', NULL, '$2a$10$/A.NYQdru17jGqYE.ZQJ6OdMg9Okz2csrlCzn2r/p5N7kutXgOKyi', '1992-06-01', FALSE, 'USER'),
    (1297, 'test030', 'test030@email.com', NULL, '$2a$10$6EdnCDNpHIbP.ncliVSlZOUjvMTeCR6daQ4AAuvG/5t4lZLDl.eCa', '1992-07-01', FALSE, 'USER'),
    (1308, 'test031', 'test031@email.com', NULL, '$2a$10$FxAmreK4njpO5dp5uAQKX.NozQxA4R6mZ.Jt.wj3RQwczLKIiloAe', '1992-08-01', FALSE, 'USER'),
    (1318, 'test032', 'test032@email.com', NULL, '$2a$10$G02gxH4IKYQ0l1HQhmC4ru/O.mCxRALtE17qE/4dvNhq1j7nVOg9S', '1992-09-01', FALSE, 'USER'),
    (1328, 'test033', 'test033@email.com', NULL, '$2a$10$G2kdPcPmoVZXRbnx1u6DNumkwv/Xt4zJZ/9Q9BSykJS.p926U5DVC', '1992-10-01', FALSE, 'USER'),
    (1338, 'test034', 'test034@email.com', NULL, '$2a$10$INNaA.vGGakIKAL2BaGC9epAKTm/F1VkkompPFW6cmi4SQTBts3KC', '1992-11-01', FALSE, 'USER'),
    (1349, 'test035', 'test035@email.com', NULL, '$2a$10$wsJMVsMI4Tr.dsS8S4bLzOp9KdMBukF1vbKzd0Ms3Qs2Inxx2/YU.', '1992-12-01', FALSE, 'USER'),
    (1359, 'test036', 'test036@email.com', NULL, '$2a$10$W4OheroPoCbzxeBFkzhJaut1XmSyY6TNboQRAOgX3V7NSThFxg57W', '1993-01-01', FALSE, 'USER'),
    (1369, 'test037', 'test037@email.com', NULL, '$2a$10$/QnBolL5a7H1XFKYnVP0vOn0UkpIeT4KKs.Zt5Hd5006ytFaJHv/S', '1993-02-01', FALSE, 'USER'),
    (1379, 'test038', 'test038@email.com', NULL, '$2a$10$T1Xw59aF6W7bm4UwTGGZVOouJM2PwbKS2UvT0tIHDUsHMfO1nSUNi', '1993-03-01', FALSE, 'USER'),
    (1390, 'test039', 'test039@email.com', NULL, '$2a$10$vKgQy9X0V/p6HozrXjsCxuirI920jZsTdbW6b4TNcXbIRfu2meLqO', '1993-04-01', FALSE, 'USER'),
    (1400, 'test040', 'test040@email.com', NULL, '$2a$10$SXoee1gQkJ5HuOYF2pnopuYZXbh1IPgSzmC0Pc20UWO2MeGAjBBf6', '1993-05-01', FALSE, 'USER');

-- ============================================================
-- 2. EQUIPOS (20 equipos, 2 miembros cada uno, códigos auto-generados)
-- ============================================================
INSERT INTO Equipo (nombreEquipo, descripcion, estado, creador_id, codigo_equipo)
SELECT
    v.nombreEquipo,
    v.descripcion,
    v.estado::TEXT,
    v.creador_id::BIGINT,
    UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 8))
FROM (VALUES
    ('Los Alfa',      'Equipo formado por test001 y test002',   'ACTIVO', 2),
    ('Los Beta',      'Equipo formado por test003 y test004',   'ACTIVO', 4),
    ('Los Gamma',     'Equipo formado por test005 y test006',   'ACTIVO', 6),
    ('Los Delta',     'Equipo formado por test007 y test008',   'ACTIVO', 8),
    ('Los Epsilon',   'Equipo formado por test009 y test010',   'ACTIVO', 10),
    ('Los Zeta',      'Equipo formado por test011 y test012',   'ACTIVO', 12),
    ('Los Eta',       'Equipo formado por test013 y test014',   'ACTIVO', 14),
    ('Los Theta',     'Equipo formado por test015 y test016',   'ACTIVO', 16),
    ('Los Iota',      'Equipo formado por test017 y test018',   'ACTIVO', 18),
    ('Los Kappa',     'Equipo formado por test019 y test020',   'ACTIVO', 20),
    ('Los Lambda',    'Equipo formado por test021 y test022',   'ACTIVO', 22),
    ('Los Mu',        'Equipo formado por test023 y test024',   'ACTIVO', 24),
    ('Los Nu',        'Equipo formado por test025 y test026',   'ACTIVO', 26),
    ('Los Xi',        'Equipo formado por test027 y test028',   'ACTIVO', 28),
    ('Los Ómicron',   'Equipo formado por test029 y test030',   'ACTIVO', 30),
    ('Los Pi',        'Equipo formado por test031 y test032',   'ACTIVO', 32),
    ('Los Rho',       'Equipo formado por test033 y test034',   'ACTIVO', 34),
    ('Los Sigma',     'Equipo formado por test035 y test036',   'ACTIVO', 36),
    ('Los Tau',       'Equipo formado por test037 y test038',   'ACTIVO', 38),
    ('Los Omega',     'Equipo formado por test039 y test040',   'ACTIVO', 40)
) AS v(nombreEquipo, descripcion, estado, creador_id);

-- ============================================================
-- 3. MIEMBROS DE EQUIPOS (2 miembros por equipo)
-- ============================================================
INSERT INTO Equipo_Miembros (equipo_id, usuario_id)
VALUES
    (1,  2),  (1,  3),   -- Los Alfa:   test001 + test002
    (2,  4),  (2,  5),   -- Los Beta:   test003 + test004
    (3,  6),  (3,  7),   -- Los Gamma:  test005 + test006
    (4,  8),  (4,  9),   -- Los Delta:  test007 + test008
    (5,  10), (5,  11),  -- Los Epsilon: test009 + test010
    (6,  12), (6,  13),  -- Los Zeta:   test011 + test012
    (7,  14), (7,  15),  -- Los Eta:    test013 + test014
    (8,  16), (8,  17),  -- Los Theta:  test015 + test016
    (9,  18), (9,  19),  -- Los Iota:   test017 + test018
    (10, 20), (10, 21),  -- Los Kappa:  test019 + test020
    (11, 22), (11, 23),  -- Los Lambda: test021 + test022
    (12, 24), (12, 25),  -- Los Mu:     test023 + test024
    (13, 26), (13, 27),  -- Los Nu:     test025 + test026
    (14, 28), (14, 29),  -- Los Xi:     test027 + test028
    (15, 30), (15, 31),  -- Los Ómicron: test029 + test030
    (16, 32), (16, 33),  -- Los Pi:     test031 + test032
    (17, 34), (17, 35),  -- Los Rho:    test033 + test034
    (18, 36), (18, 37),  -- Los Sigma:  test035 + test036
    (19, 38), (19, 39),  -- Los Tau:    test037 + test038
    (20, 40), (20, 41);  -- Los Omega:  test039 + test040

-- ============================================================
-- 4. TORNEOS
--    4.1 Torneo principal (user000) — con estructura completa
--    4.2 Torneos de prueba por cada test user (públicos + privados)
-- ============================================================

-- 4.1 Torneo principal de user000 (idOrganizador = 1, público, RECLUTANDO)
INSERT INTO Torneo (idOrganizador, nombre, privado, codigoTorneo, numGrupos, equiposPorGrupo, tienePlayoff, tipoTorneo, idaVueltaPlayoff, estado,
                    fechaInicio, fechaFin, fechaLimiteInscripcion,
                    puntosVictoria, puntosEmpate, puntosDerrota,
                    formatoPartidos, criterioDesempate,
                    diasDisponibles, horaInicio, horaFin, duracionPartido,
                    fechasExcluidas, estrategiaDistribucion, diasEntreJornadas)
SELECT
    1, 'Torneo de Prueba 2026', FALSE,
    'T' || LPAD(FLOOR(RANDOM() * 100)::INT::TEXT, 2, '0') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 4)),
    NULL, NULL, NULL, NULL, NULL, 'RECLUTANDO',
    '2026-03-01', '2026-04-30', '2026-02-20',
    3, 1, 0,
    '4_SETS', 'PUNTOS',
    'L,M,X,J,V', '16:00', '22:00', 45,
    '2026-04-01,2026-04-02', 'JORNADAS', 7;

-- 4.2 Torneos de cada test user (40 públicos + 40 privados, con código auto-generado)
INSERT INTO Torneo (idOrganizador, nombre, privado, codigoTorneo, estado)
SELECT
    u.id,
    'Torneo_Publico_' || u.nombre,
    FALSE,
    'T' || LPAD(FLOOR(RANDOM() * 100)::INT::TEXT, 2, '0') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 4)),
    'RECLUTANDO'
FROM "User" u
WHERE u.nombre LIKE 'test%'

UNION ALL

SELECT
    u.id,
    'Torneo_Privado_' || u.nombre,
    TRUE,
    'T' || LPAD(FLOOR(RANDOM() * 100)::INT::TEXT, 2, '0') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 4)),
    'RECLUTANDO'
FROM "User" u
WHERE u.nombre LIKE 'test%'
ORDER BY id;

-- ============================================================
-- 5. SOLICITUDES DE INSCRIPCIÓN (20 solicitudes ACEPTADAS al torneo principal)
-- ============================================================
INSERT INTO Solicitud (candidato_id, decisor_id, equipo_id, torneo_id, estado, tipo_solicitud, fecha_creacion)
VALUES
    (2,  1, 1,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '10 days'),
    (4,  1, 2,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '9 days'),
    (6,  1, 3,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '9 days'),
    (8,  1, 4,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '8 days'),
    (10, 1, 5,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '8 days'),
    (12, 1, 6,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '7 days'),
    (14, 1, 7,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '7 days'),
    (16, 1, 8,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '6 days'),
    (18, 1, 9,  1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '6 days'),
    (20, 1, 10, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '5 days'),
    (22, 1, 11, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '5 days'),
    (24, 1, 12, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '4 days'),
    (26, 1, 13, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '4 days'),
    (28, 1, 14, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '3 days'),
    (30, 1, 15, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '3 days'),
    (32, 1, 16, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '2 days'),
    (34, 1, 17, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '2 days'),
    (36, 1, 18, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '1 day'),
    (38, 1, 19, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '1 day'),
    (40, 1, 20, 1, 'ACEPTADA', 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '1 day');

-- ============================================================
-- 6. INSCRIPCIONES CONFIRMADAS (20 inscripciones ACTIVAS al torneo principal)
-- ============================================================
INSERT INTO Inscripcion (idTorneo, idEquipo, idGrupo, partidosJugados, estadoInscripcion, puntosLiga, setsGanados, setsPerdidos)
VALUES
    (1, 1,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 2,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 3,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 4,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 5,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 6,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 7,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 8,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 9,  NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 10, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 11, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 12, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 13, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 14, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 15, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 16, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 17, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 18, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 19, NULL, 0, 'ACTIVA', 0, 0, 0),
    (1, 20, NULL, 0, 'ACTIVA', 0, 0, 0);

-- ============================================================
-- 7. NOTIFICACIONES
-- ============================================================
INSERT INTO Notification (usuarioId, asunto, cuerpo, leido, pendienteDeAccion, referenciaId, tipo, fechaCreacion)
VALUES
    (1, 'Inscripciones completadas', 'Los 20 equipos ya están inscritos en el Torneo de Prueba 2026. Revisa la configuración del torneo para comenzar.', TRUE, FALSE, 1, 'SOLICITUD_INSCRIPCION', NOW() - INTERVAL '1 day');

-- ============================================================
-- 8. SEGUIMIENTO DE TORNEOS (seguimientos al torneo principal)
-- ============================================================
INSERT INTO SeguimientoTorneo (usuarioId, torneoId, fechaCreacion)
VALUES
    (2,  1, NOW() - INTERVAL '10 days'),
    (4,  1, NOW() - INTERVAL '9 days'),
    (6,  1, NOW() - INTERVAL '8 days'),
    (8,  1, NOW() - INTERVAL '7 days'),
    (10, 1, NOW() - INTERVAL '6 days'),
    (12, 1, NOW() - INTERVAL '5 days'),
    (14, 1, NOW() - INTERVAL '4 days'),
    (16, 1, NOW() - INTERVAL '3 days'),
    (18, 1, NOW() - INTERVAL '2 days'),
    (20, 1, NOW() - INTERVAL '1 day');
