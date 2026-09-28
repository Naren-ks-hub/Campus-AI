package com.campusai.controller;

import com.campusai.model.User;
import com.campusai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    public static class LoginRequest {
        private String username;
        private String password;
        private String role;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(request.getPassword())) {
                if (request.getRole() != null && !request.getRole().isEmpty() && !user.getRole().name().equalsIgnoreCase(request.getRole())) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("message", "User exists but role does not match " + request.getRole());
                    return ResponseEntity.badRequest().body(err);
                }
                
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("message", "Login successful");
                resp.put("user", user);
                // Return demo token for auth
                resp.put("token", "campusai-jwt-token-" + user.getId() + "-" + System.currentTimeMillis());
                return ResponseEntity.ok(resp);
            }
        }

        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", "Invalid username or password");
        return ResponseEntity.status(401).body(err);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Username already exists");
            return ResponseEntity.badRequest().body(err);
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Email already registered");
            return ResponseEntity.badRequest().body(err);
        }

        User saved = userRepository.save(user);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Account created successfully");
        resp.put("user", saved);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/users/current")
    public ResponseEntity<?> getCurrentUser(@RequestParam Long userId) {
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
