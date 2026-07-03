package es.udc.agon.backend.rest.common;

public interface JwtGenerator {
	
	String generate(JwtInfo info);
	
	JwtInfo getInfo(String token);

}
