package smahfood.travel.user.admin.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record UpsertUserRequest(
        @Email @NotBlank String email,
        boolean enabled,
        Set<@NotBlank String> roles
) {
}

