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
						// autorizacion
						.requestMatchers(HttpMethod.POST, "/users/signup").permitAll()
						.requestMatchers(HttpMethod.POST, "/users/login").permitAll()
						.requestMatchers(HttpMethod.POST, "/users/loginFromServiceToken").permitAll()

						// doc
						.requestMatchers("/api-docs/**").permitAll()
						.requestMatchers("/docs/**").permitAll()
						.requestMatchers("/swagger-ui/**").permitAll()

						// usuarios
						.requestMatchers(HttpMethod.PUT, "/users/*").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/users/*/changePassword").hasRole("USER")

						// notificaciones
						.requestMatchers(HttpMethod.GET, "/notifications").hasRole("USER")
						.requestMatchers(HttpMethod.GET, "/notifications/*").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/notifications").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/notifications/*").hasRole("USER")
						.requestMatchers(HttpMethod.PUT, "/notifications/*").hasRole("USER")

						// equipos
						.requestMatchers(HttpMethod.POST, "/teams").hasRole("USER")
						.requestMatchers(HttpMethod.GET, "/teams").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/teams/*/invitations").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/teams/invitations/*/respond").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/teams/*/leave").hasRole("USER")
						.requestMatchers(HttpMethod.POST, "/teams/*/disband").hasRole("USER")

						// denegar el resto
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