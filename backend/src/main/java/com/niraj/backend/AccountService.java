package com.niraj.backend;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final LoginAttemptLimiter limiter;

    public AccountService(UserRepository users, PasswordEncoder encoder, LoginAttemptLimiter limiter) {
        this.users = users;
        this.encoder = encoder;
        this.limiter = limiter;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        // Valid token but the user no longer exists: 401 makes the frontend log out.
        UserEntity user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String email = user.getEmail();
        if (limiter.isLocked(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts");
        }
        if (!encoder.matches(request.currentPassword(), user.getPasswordHash())) {
            limiter.recordFailure(email);
            // 403, not 401, so the frontend does not treat it as an expired login.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current password is wrong");
        }

        limiter.recordSuccess(email);
        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);
    }
}