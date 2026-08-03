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
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // Cada regla se declara con dos variantes: la ruta original
                    // (servlet path "/", desarrollo y tests) y su equivalente
                    // bajo /api (producción, spring.mvc.servlet.path=/api).
                    .requestMatchers(HttpMethod.POST, "/users/signup", "/api/users/signup").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/login", "/api/users/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/loginFromServiceToken", "/api/users/loginFromServiceToken").permitAll()
                    .requestMatchers("/api-docs/**", "/api/api-docs/**").permitAll()
                    .requestMatchers("/docs/**", "/api/docs/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/api/swagger-ui/**").permitAll()

                    .requestMatchers(HttpMethod.PUT, "/users/*", "/api/users/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/users/*/changePassword", "/api/users/*/changePassword").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/users/*/elo-history", "/api/users/*/elo-history").hasRole("USER")

                    .requestMatchers(HttpMethod.GET, "/notifications", "/api/notifications").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/notifications/*", "/api/notifications/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/notifications", "/api/notifications").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/notifications/*", "/api/notifications/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/notifications/*", "/api/notifications/*").hasRole("USER")

                    .requestMatchers(HttpMethod.GET, "/encuentros", "/api/encuentros").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/encuentros/**", "/api/encuentros/**").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/encuentros/**", "/api/encuentros/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/encuentros/*/resultado", "/api/encuentros/*/resultado").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/encuentros/aplazamientos/*", "/api/encuentros/aplazamientos/*").hasRole("USER")

                    .requestMatchers(HttpMethod.POST, "/teams", "/api/teams").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/teams", "/api/teams").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/teams/**", "/api/teams/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/teams/*", "/api/teams/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/teams/*", "/api/teams/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/teams/*/miembros/*", "/api/teams/*/miembros/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/teams/*/solicitudes", "/api/teams/*/solicitudes").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/teams/solicitudes", "/api/teams/solicitudes").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/teams/solicitudes/*", "/api/teams/solicitudes/*").hasRole("USER")

                    .requestMatchers(HttpMethod.POST, "/tournaments", "/api/tournaments").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/tournaments/**", "/api/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/tournaments", "/api/tournaments").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/tournaments/**", "/api/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/tournaments/*", "/api/tournaments/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/tournaments/*/seguidores/*", "/api/tournaments/*/seguidores/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/tournaments/**", "/api/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/tournaments/*/seguidores/*", "/api/tournaments/*/seguidores/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/tournaments/*", "/api/tournaments/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/tournaments/*/estructura", "/api/tournaments/*/estructura").hasRole("USER")
                    .requestMatchers(HttpMethod.PATCH, "/tournaments/*/inscripciones/*", "/api/tournaments/*/inscripciones/*").hasRole("USER")

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
        // NOTA: si frontend y API comparten dominio (Nginx proxy de /api),
        // las peticiones son same-origin y CORS ni siquiera se aplica.
        config.setAllowedOrigins(Arrays.asList(
            allowedOrigins.split(",")));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}