package smahfood.travel.auth.web.dto;

public record TokenResponse(String token, String tokenType) {
    public static TokenResponse bearer(String token) {
        return new TokenResponse(token, "Bearer");
    }
}

