package es.udc.agon.backend.rest.common;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

/**
 * Configuración para la autenticación mediante Google Identity Services (GIS).
 *
 * Proporciona un {@link GoogleIdTokenVerifier} que valida los ID Tokens que el
 * frontend obtiene tras el flujo "Sign in with Google". El verifier usa el
 * Client ID del proyecto OAuth (inyectado desde entorno) y los certificados
 * públicos de Google para comprobar la firma y la audiencia del token.
 */
@Configuration
public class GoogleAuthConfig {

    @Value("${project.google.client-id:}")
    private String googleClientId;

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier() throws GeneralSecurityException, IOException {
        List<String> audience = googleClientId == null || googleClientId.isBlank()
                ? Collections.emptyList()
                : Collections.singletonList(googleClientId);

        return new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                // Si no hay Client ID configurado, el verifier no podrá validar
                // tokens (la integración estará desactivada).
                .setAudience(audience)
                .build();
    }
}
