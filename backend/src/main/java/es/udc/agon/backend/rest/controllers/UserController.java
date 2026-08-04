package es.udc.agon.backend.rest.controllers;

import static es.udc.agon.backend.rest.dtos.EloHistorialConversor.toEloHistorialDtos;
import static es.udc.agon.backend.rest.dtos.UserConversor.toAuthenticatedUserDto;
import static es.udc.agon.backend.rest.dtos.UserConversor.toUser;
import static es.udc.agon.backend.rest.dtos.UserConversor.toUserDto;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.HashMap;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.udc.agon.backend.model.entities.User;
import es.udc.agon.backend.model.exceptions.DuplicateInstanceException;
import es.udc.agon.backend.model.exceptions.IncorrectLoginException;
import es.udc.agon.backend.model.exceptions.IncorrectPasswordException;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.UserService;
import es.udc.agon.backend.rest.common.ErrorsDto;
import es.udc.agon.backend.rest.common.JwtGenerator;
import es.udc.agon.backend.rest.common.JwtInfo;
import es.udc.agon.backend.model.services.IEncuentroService;
import es.udc.agon.backend.rest.dtos.AuthenticatedUserDto;
import es.udc.agon.backend.rest.dtos.ChangePasswordParamsDto;
import es.udc.agon.backend.rest.dtos.EloHistorialDto;
import es.udc.agon.backend.rest.dtos.GoogleLoginParamsDto;
import es.udc.agon.backend.rest.dtos.LoginParamsDto;
import es.udc.agon.backend.rest.dtos.UserDto;

@RestController
@RequestMapping("/users")
@Tag(name = "User Controller", description = "Endpoints de gestión de cuentas, autenticación, sesión y perfiles de usuarios")
public class UserController {

    private final static String INCORRECT_LOGIN_EXCEPTION_CODE = "project.exceptions.IncorrectLoginException";
    private final static String INCORRECT_PASSWORD_EXCEPTION_CODE = "project.exceptions.IncorrectPasswordException";
    private final static String SERVICE_ROLE = "USER";

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private JwtGenerator jwtGenerator;

    @Autowired
    private UserService userService;

    @Autowired
    private IEncuentroService encuentroService;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return errors;
    }

    @ExceptionHandler(IncorrectLoginException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleIncorrectLoginException(IncorrectLoginException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INCORRECT_LOGIN_EXCEPTION_CODE, null,
                INCORRECT_LOGIN_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleIncorrectPasswordException(IncorrectPasswordException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INCORRECT_PASSWORD_EXCEPTION_CODE, null,
                INCORRECT_PASSWORD_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @PostMapping("/signup")
    @Operation(summary = "Registrar un nuevo usuario", description = "Crea un nuevo perfil en el sistema, inicializa su ELO inicial y devuelve el token de sesión.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado con éxito",
                    content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o faltantes",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "El nombre de usuario o el email ya están en uso",
                    content = @Content)
    })
    public ResponseEntity<AuthenticatedUserDto> signUp(
            @Validated({ UserDto.AllValidations.class }) @RequestBody UserDto userDto)
            throws DuplicateInstanceException {

        User user = toUser(userDto);
        userService.signUp(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(user.getId()).toUri();

        return ResponseEntity.created(location).body(toAuthenticatedUserDto(generateServiceToken(user), user));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión mediante credenciales", description = "Valida el nombre de usuario y contraseña y devuelve el token de acceso junto al perfil.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Autenticación exitosa",
                    content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
            @ApiResponse(responseCode = "400", description = "Formato de credenciales no válido",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado o contraseña incorrecta",
                    content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    public AuthenticatedUserDto login(@Validated @RequestBody LoginParamsDto params)
            throws IncorrectLoginException {
        User user = userService.login(params.getNombre(), params.getPassword());
        return toAuthenticatedUserDto(generateServiceToken(user), user);
    }

    @PostMapping("/google")
    @Operation(summary = "Iniciar sesión con cuenta de Google", description = "Valida el ID Token de Google en el servidor y, si el usuario no existe todavía, lo registra automáticamente. Devuelve el token de acceso junto al perfil.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Autenticación con Google exitosa",
                    content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
            @ApiResponse(responseCode = "400", description = "ID Token de Google no válido o faltante",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "No se pudo verificar el ID Token de Google",
                    content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    public AuthenticatedUserDto loginWithGoogle(@Validated @RequestBody GoogleLoginParamsDto params)
            throws IncorrectLoginException {
        User user = userService.loginWithGoogle(params.getGoogleToken());
        return toAuthenticatedUserDto(generateServiceToken(user), user);
    }

    @PostMapping("/loginFromServiceToken")
    @Operation(
            summary = "Reautenticar mediante token de sesión",
            description = "Permite al cliente renovar la sesión o recuperar el perfil si ya cuenta con un token JWT válido.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reautenticación exitosa",
                    content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
            @ApiResponse(responseCode = "401", description = "Token JWT no válido o expirado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "El usuario asociado al token no existe",
                    content = @Content)
    })
    public AuthenticatedUserDto loginFromServiceToken(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(hidden = true) @RequestAttribute String serviceToken) throws InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        return toAuthenticatedUserDto(serviceToken, user);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar perfil de usuario",
            description = "Permite a un usuario modificar su nombre, email, imagen de perfil y fecha de nacimiento.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente",
                    content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Campos enviados incorrectos o inválidos",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Intento de modificar un perfil ajeno (Fallo de permisos)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario a actualizar no encontrado",
                    content = @Content)
    })
    public UserDto updateProfile(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del usuario a actualizar", example = "42") @PathVariable Long id,
            @Validated({ UserDto.UpdateValidations.class }) @RequestBody UserDto userDto)
            throws InstanceNotFoundException, PermissionException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        return toUserDto(userService.updateProfile(id, userDto.getNombre(), userDto.getEmail(),
                userDto.getImagenPerfil(), userDto.getFechaNacimiento(),
                userDto.isNotificacionesPartidos(), userDto.getDiasAntelacionPartidos()));
    }

    @PostMapping("/{id}/changePassword")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Cambiar contraseña del usuario",
            description = "Actualiza la credencial de acceso del usuario tras validar la contraseña antigua.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Contraseña cambiada con éxito (Sin contenido de retorno)"),
            @ApiResponse(responseCode = "400", description = "Formatos de contraseña no cumplen con los requisitos",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para modificar este perfil",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Contraseña antigua incorrecta o usuario no encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    public void changePassword(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del usuario del que se cambiará la contraseña", example = "42") @PathVariable Long id,
            @Validated @RequestBody ChangePasswordParamsDto params)
            throws PermissionException, InstanceNotFoundException, IncorrectPasswordException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        userService.changePassword(id, params.getOldPassword(), params.getNewPassword());
    }

    @GetMapping("/{id}/elo-history")
    @Operation(
            summary = "Consultar historial de ELO",
            description = "Devuelve el historial de subidas y bajadas de ELO del usuario, ordenado cronológicamente.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historial de ELO obtenido correctamente",
                    content = @Content(schema = @Schema(implementation = EloHistorialDto.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para consultar este historial",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado",
                    content = @Content)
    })
    public List<EloHistorialDto> getEloHistory(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del usuario del que se consulta el historial de ELO", example = "42") @PathVariable Long id)
            throws PermissionException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        return toEloHistorialDtos(encuentroService.consultarHistorialElo(id));
    }

    private String generateServiceToken(User user) {
        JwtInfo jwtInfo = new JwtInfo(user.getId(), SERVICE_ROLE);
        return jwtGenerator.generate(jwtInfo);
    }
}