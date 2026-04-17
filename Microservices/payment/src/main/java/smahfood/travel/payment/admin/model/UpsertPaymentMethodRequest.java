package smahfood.travel.payment.admin.model;

import jakarta.validation.constraints.NotBlank;

public record UpsertPaymentMethodRequest(
        @NotBlank String provider,
        @NotBlank String displayName,
        boolean enabled,
        String configuration
) {
}

