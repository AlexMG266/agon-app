package es.udc.agon.backend.rest.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Introduce el token JWT obtenido tras el login/registro para acceder a los endpoints protegidos.")))
                .info(new Info()
                        .title("AGON API - Sistema de Gestión de Competiciones y Equipos")
                        .version("1.0.0")
                        .description("Especificación de la API REST 'AGON'. "
                                + "Esta documentación cubre los módulos de autenticación, gestión de perfiles, "
                                + "notificaciones y administración de equipos e invitaciones."));
    }
}