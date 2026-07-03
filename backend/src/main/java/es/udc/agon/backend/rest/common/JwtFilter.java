package es.udc.agon.backend.rest.common;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.servlet.http.HttpFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public class JwtFilter extends HttpFilter {
	
	private JwtGenerator jwtGenerator;

	public JwtFilter(JwtGenerator jwtGenerator) {

		this.jwtGenerator = jwtGenerator;
		
	}

	@Override
	protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		
		String authHeaderValue = request.getHeader(HttpHeaders.AUTHORIZATION);
		
		if (authHeaderValue == null || !authHeaderValue.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}
		
		try {
			
			String serviceToken = authHeaderValue.replace("Bearer ", "");
			JwtInfo jwtInfo = jwtGenerator.getInfo(serviceToken);
			
			request.setAttribute("serviceToken", serviceToken);
			request.setAttribute("userId", jwtInfo.getUserId());
			
			configureSecurityContext(jwtInfo.getRole());
			
		} catch (Exception e) {
			 response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			 return;
		}
		
		filterChain.doFilter(request, response);
		
	}
	
	private void configureSecurityContext(String role) {
		
		Set<GrantedAuthority> authorities = new HashSet<>();
		
		authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
		
		SecurityContextHolder.getContext().setAuthentication(
			new UsernamePasswordAuthenticationToken(null, null, authorities));
		
	}

}
