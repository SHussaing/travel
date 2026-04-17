package smahfood.travel.payment.admin.model;

public record PaymentMethodDto(
        String id,
        String provider,
        String displayName,
        boolean enabled,
        String configuration
) {
}

