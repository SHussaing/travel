package smahfood.travel.auth.web;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import smahfood.travel.auth.jwt.JwtService;
import smahfood.travel.auth.web.dto.AdminLoginRequest;
import smahfood.travel.auth.web.dto.TokenResponse;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final String adminUsername;
    private final String adminPassword;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(@Value("${admin.bootstrap.username}") String adminUsername,
                          @Value("${admin.bootstrap.password}") String adminPassword,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/admin/login")
    public ResponseEntity<TokenResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        // Phase 1: bootstrap admin from config/env. We'll switch to persistent admin users later.
        boolean usernameOk = adminUsername.equals(request.username());

        // Support both plain-text env password (default) and a pre-hashed value if you choose later.
        boolean passwordOk = adminPassword.equals(request.password())
                || passwordEncoder.matches(request.password(), adminPassword);

        if (!usernameOk || !passwordOk) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = jwtService.generateToken(adminUsername, List.of("ADMIN"));
        return ResponseEntity.ok(TokenResponse.bearer(token));
    }
}

