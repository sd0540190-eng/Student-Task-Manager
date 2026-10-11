package NeuroNex.Student_Task_Manager_2.Controller;

import NeuroNex.Student_Task_Manager_2.Entity.User;
import NeuroNex.Student_Task_Manager_2.Service.JwtService;
import NeuroNex.Student_Task_Manager_2.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {

        try {
            String username = request.get("username");
            String password = request.get("password");

            User user = userService.registerUser(username, password);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Registration successful",
                            "username", user.getUsername()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.get("username"),
                                    request.get("password")
                            )
                    );

            String token = jwtService.generateToken(
                    authentication.getName()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful",
                            "username", authentication.getName(),
                            "token", token,
                            "tokenType", "Bearer"
                    )
            );

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid username or password"
                    ));
        }
    }
}





