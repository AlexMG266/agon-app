package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.User;

public class UserConversor {

	private UserConversor() {
	}

	public final static UserDto toUserDto(User user) {
		return new UserDto(user.getId(), user.getElo(), user.getNombre(), user.getEmail(), user.getImagenPerfil(),
				user.getFechaNacimiento(), user.isEloProvisional(), user.isNotificacionesPartidos(),
				user.getDiasAntelacionPartidos());
	}

	public final static User toUser(UserDto userDto) {

		User user = new User(userDto.getElo(), userDto.getNombre(), userDto.getEmail(), userDto.getImagenPerfil(),
				userDto.getPassword(), userDto.getFechaNacimiento(), userDto.isEloProvisional());
		user.setNotificacionesPartidos(userDto.isNotificacionesPartidos());
		user.setDiasAntelacionPartidos(userDto.getDiasAntelacionPartidos());
		return user;
	}

	public final static AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, User user) {

		return new AuthenticatedUserDto(serviceToken, toUserDto(user));

	}

}
