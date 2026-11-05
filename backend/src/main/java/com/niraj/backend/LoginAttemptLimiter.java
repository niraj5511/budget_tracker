package com.niraj.backend;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Remembers failed logins per email, in memory. After MAX_FAILURES in a row
 * the email is locked for LOCK_TIME. A successful login clears the count.
 *
 * The counts live only in this running server, so a restart clears them.
 * Emails that do not exist are counted like any other, so a lockout never
 * reveals whether an email is registered.
 */
@Component
public class LoginAttemptLimiter {

    static final int MAX_FAILURES = 5;
    static final Duration LOCK_TIME = Duration.ofMinutes(15);

    // Housekeeping so a flood of made-up emails cannot grow the map forever.
    private static final int PURGE_ABOVE = 1_000;
    private static final int MAX_ENTRIES = 10_000;

    private record Attempts(int failures, Instant lastFailure, Instant lockedUntil) {
    }

    private final ConcurrentHashMap<String, Attempts> attempts = new ConcurrentHashMap<>();

    public boolean isLocked(String email) {
        Attempts found = attempts.get(email);
        return found != null && found.lockedUntil() != null && now().isBefore(found.lockedUntil());
    }

    public void recordFailure(String email) {
        Instant now = now();
        if (attempts.size() > PURGE_ABOVE) {
            attempts.entrySet().removeIf(entry -> isStale(entry.getValue(), now));
        }
        if (attempts.size() >= MAX_ENTRIES && !attempts.containsKey(email)) {
            return;
        }
        attempts.compute(email, (key, old) -> {
            int failures = (old == null || isStale(old, now)) ? 1 : old.failures() + 1;
            Instant lockedUntil = failures >= MAX_FAILURES ? now.plus(LOCK_TIME) : null;
            return new Attempts(failures, now, lockedUntil);
        });
    }

    public void recordSuccess(String email) {
        attempts.remove(email);
    }

    // A count whose last failure is older than LOCK_TIME no longer matters.
    private static boolean isStale(Attempts found, Instant now) {
        return found.lastFailure().plus(LOCK_TIME).isBefore(now);
    }

    // Overridable so a test can move the clock.
    Instant now() {
        return Instant.now();
    }
}