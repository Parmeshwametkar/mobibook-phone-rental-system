package com.phonebooking.controller;

import com.phonebooking.dto.AuthResponse;
import com.phonebooking.dto.LoginRequest;
import com.phonebooking.dto.RegisterRequest;
import com.phonebooking.model.Role;
import com.phonebooking.model.User;
import com.phonebooking.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Username is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Email is already in use!");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword()); // In production, use BCryptPasswordEncoder

        Role role = Role.USER;
        if (registerRequest.getRole() != null) {
            try {
                role = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Default to USER
            }
        }
        user.setRole(role);

        User savedUser = userRepository.save(user);

        // Generate simulated token
        String token = savedUser.getId() + "-" + savedUser.getUsername() + "-" + savedUser.getRole();

        AuthResponse authResponse = new AuthResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                token
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsernameOrEmail(
                loginRequest.getUsernameOrEmail(), 
                loginRequest.getUsernameOrEmail()
        ).orElse(null);

        if (user == null || !user.getPassword().equals(loginRequest.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Invalid username or password!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Generate simulated token
        String token = user.getId() + "-" + user.getUsername() + "-" + user.getRole();

        AuthResponse authResponse = new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                token
        );

        return ResponseEntity.ok(authResponse);
    }
}
