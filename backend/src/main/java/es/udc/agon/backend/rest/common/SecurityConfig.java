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
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/signup").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users/loginFromServiceToken").permitAll()
                    .requestMatchers("/api-docs/**").permitAll()
                    .requestMatchers("/docs/**").permitAll()
                    .requestMatchers("/swagger-ui/**").permitAll()

                    .requestMatchers(HttpMethod.PUT, "/users/*").hasRole("USER")  
                    .requestMatchers(HttpMethod.POST, "/users/*/changePassword").hasRole("USER")  

                    .requestMatchers(HttpMethod.GET, "/notifications").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/notifications/*").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/notifications").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/notifications/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/notifications/*").hasRole("USER")

                    .requestMatchers(HttpMethod.GET, "/encuentros/**").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/encuentros/**").hasRole("USER")

                    .requestMatchers(HttpMethod.POST, "/teams").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/teams").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/teams/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/teams/*").hasRole("USER")  
                    .requestMatchers(HttpMethod.DELETE, "/teams/*").hasRole("USER")  
                    .requestMatchers(HttpMethod.POST, "/teams/*/propuestas").hasRole("USER")  
                    .requestMatchers(HttpMethod.POST, "/teams/peticiones").hasRole("USER")  
                    .requestMatchers(HttpMethod.POST, "/teams/solicitudes/*/responder").hasRole("USER") 
                    .requestMatchers(HttpMethod.POST, "/teams/*/leave").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/teams/*/disband").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/teams/*/members/*/kick").hasRole("USER")

                    .requestMatchers(HttpMethod.POST, "/tournaments").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/tournaments").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/tournaments/**").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/tournaments/*").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/tournaments/**").hasRole("USER")

                    .anyRequest().denyAll()
                );

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