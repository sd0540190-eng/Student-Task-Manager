package NeuroNex.Student_Task_Manager_2.Service;

import NeuroNex.Student_Task_Manager_2.Entity.User;
import NeuroNex.Student_Task_Manager_2.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String username, String password) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }

        String normalizedUsername = username.trim();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Username already exists");
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User(normalizedUsername, hashedPassword);

        return userRepository.save(user);
    }


}

