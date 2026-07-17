// src/main/java/es/udc/agon/backend/rest/common/SecurityConfig.java
package es.udc.agon.backend.rest.common;

import org.springframework.beans.factory.annotation.Autowired;
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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtGenerator jwtGenerator;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors(Customizer.withDefaults())
                .csrf((csrf) -> csrf.disable())
                .sessionManagement(
                        (sessionManagement) -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtFilter(jwtGenerator), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers(HttpMethod.POST, "/users/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users/loginFromServiceToken").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()
                        .requestMatchers("/docs/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()

                        .requestMatchers(HttpMethod.PUT, "/users/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/users/*/changePassword").authenticated()

                        .requestMatchers(HttpMethod.GET, "/notifications").authenticated()
                        .requestMatchers(HttpMethod.GET, "/notifications/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/notifications").authenticated()
                        .requestMatchers(HttpMethod.POST, "/notifications/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/notifications/*").authenticated()

                        .requestMatchers(HttpMethod.POST, "/teams").authenticated()
                        .requestMatchers(HttpMethod.GET, "/teams").authenticated()
                        .requestMatchers(HttpMethod.GET, "/teams/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/teams/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/teams/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/teams/*/propuestas").authenticated()
                        .requestMatchers(HttpMethod.POST, "/teams/peticiones").authenticated()
                        .requestMatchers(HttpMethod.POST, "/teams/solicitudes/*/responder").authenticated()
                        .requestMatchers(HttpMethod.POST, "/teams/*/leave").authenticated()
                        .requestMatchers(HttpMethod.POST, "/teams/*/disband").authenticated()

                        .anyRequest().denyAll());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}