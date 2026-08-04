package es.udc.agon.backend.rest.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtGenerator jwtGenerator;

    @Value("${project.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors(Customizer.withDefaults())
                .csrf((csrf) -> csrf.disable())
                .sessionManagement(
                        (sessionManagement) -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtFilter(jwtGenerator), UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests((authorize) -> authorize
                    // Se usa AntPathRequestMatcher (matching de patrón puro sobre el
                    // servlet path) en lugar del MvcRequestMatcher por defecto: es
                    // determinista e independiente del contexto de Spring MVC, lo que
                    // evita 403 inesperados en runtime de producción.
                    // Las rutas se declaran SIN prefijo: la API se sirve en la raíz (/)
                    // tanto en desarrollo como en producción (dominio dedicado, p. ej.
                    // https://api.tudominio.com). El frontend apunta a la URL base
                    // completa vía VITE_BACKEND_URL.
                    .requestMatchers(new AntPathRequestMatcher("/**", "OPTIONS")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/users/signup", "POST")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/users/login", "POST")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/users/google", "POST")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/users/loginFromServiceToken", "POST")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api-docs/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/docs/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/swagger-ui/**")).permitAll()

                    .requestMatchers(new AntPathRequestMatcher("/users/*", "PUT")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/users/*/changePassword", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/users/*/elo-history", "GET")).hasRole("USER")

                    .requestMatchers(new AntPathRequestMatcher("/notifications", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/notifications/*", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/notifications", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/notifications/*", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/notifications/*", "PUT")).hasRole("USER")

                    .requestMatchers(new AntPathRequestMatcher("/encuentros", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/encuentros/**", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/encuentros/**", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/encuentros/*/resultado", "PUT")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/encuentros/aplazamientos/*", "PATCH")).hasRole("USER")

                    .requestMatchers(new AntPathRequestMatcher("/teams", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/**", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/*", "PUT")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/*", "DELETE")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/*/miembros/*", "DELETE")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/*/solicitudes", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/solicitudes", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/teams/solicitudes/*", "PATCH")).hasRole("USER")

                    .requestMatchers(new AntPathRequestMatcher("/tournaments", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/**", "POST")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/**", "GET")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/*", "PUT")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/*/seguidores/*", "PUT")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/**", "DELETE")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/*/seguidores/*", "DELETE")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/*", "PATCH")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/*/estructura", "PATCH")).hasRole("USER")
                    .requestMatchers(new AntPathRequestMatcher("/tournaments/*/inscripciones/*", "PATCH")).hasRole("USER")

                    .anyRequest().denyAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        config.setAllowCredentials(true);
        // Orígenes permitidos desde configuración (application.yml / env var).
        // En desarrollo: localhost:5173 y localhost:8080.
        // En producción: el/los dominio(s) real(es) vía CORS_ALLOWED_ORIGINS.
        // Como frontend y API usan dominios distintos (p. ej. app.tudominio.com
        // y api.tudominio.com), CORS SI se aplica y CORS_ALLOWED_ORIGINS debe
        // incluir el dominio del frontend.
        config.setAllowedOrigins(Arrays.asList(
            allowedOrigins.split(",")));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
