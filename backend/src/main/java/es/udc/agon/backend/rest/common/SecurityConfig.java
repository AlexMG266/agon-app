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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

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
                    // Las rutas se declaran SIN prefijo: la API se sirve en la
                    // raíz (/) tanto en desarrollo como en producción (dominio
                    // dedicado, p. ej. https://api.tudominio.com). El frontend
                    // apunta a la URL base completa vía VITE_BACKEND_URL.
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/signup").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/loginFromServiceToken").permitAll()
                    .requestMatchers("/api-docs/**").permitAll()
                    .requestMatchers("/docs/**").permitAll()
                    .requestMatchers("/swagger-ui/**").permitAll()

                    .requestMatchers(HttpMethod.PUT, "/users/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/users/*/changePassword").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/users/*/elo-history").hasRole("USER")

                    .requestMatchers(HttpMethod.GET, "/notifications").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/notifications/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/notifications").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/notifications/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/notifications/*").hasRole("USER")

                    .requestMatchers(HttpMethod.GET, "/encuentros").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/encuentros/**").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/encuentros/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/encuentros/*/resultado").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/encuentros/aplazamientos/*").hasRole("USER")

                    .requestMatchers(HttpMethod.POST, "/teams").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/teams").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/teams/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/teams/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/teams/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/teams/*/miembros/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/teams/*/solicitudes").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/teams/solicitudes").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/teams/solicitudes/*").hasRole("USER")

                    .requestMatchers(HttpMethod.POST, "/tournaments").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/tournaments").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/tournaments/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/tournaments/*/seguidores/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/tournaments/*/seguidores/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/tournaments/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/tournaments/*/estructura").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/tournaments/*/inscripciones/*").hasRole("USER")

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