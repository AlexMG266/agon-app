package es.udc.agon.backend.rest.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthenticatedUserDto {
	
	private String serviceToken;
	private UserDto userDto;

	public AuthenticatedUserDto() {}
	
	public AuthenticatedUserDto(String serviceToken, UserDto userDto) {
		
		this.serviceToken = serviceToken;
		this.userDto = userDto;
		
	}

	public String getServiceToken() {
		return serviceToken;
	}

	public void setServiceToken(String serviceToken) {
		this.serviceToken = serviceToken;
	}

	@JsonProperty("user")
	public UserDto getUserDto() {
		return userDto;
	}

	public void setUserDto(UserDto userDto) {
		this.userDto = userDto;
	}

}
