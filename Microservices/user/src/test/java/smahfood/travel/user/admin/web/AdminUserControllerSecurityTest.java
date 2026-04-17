package smahfood.travel.user.admin.web;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import javax.crypto.SecretKey;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "jwt.secret=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678901234567890"
        }
)
class AdminUserControllerSecurityTest {

    @Value("${local.server.port}")
    int port;

    private final HttpClient client = HttpClient.newHttpClient();

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    private String jwt(List<String> roles) {
        SecretKey key = Keys.hmacShaKeyFor("mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678901234567890"
                .getBytes(StandardCharsets.UTF_8));
        Instant now = Instant.now();
        return Jwts.builder()
                .subject("admin")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(3600)))
                .claim("roles", roles)
                .signWith(key)
                .compact();
    }

    @Test
    void noToken_unauthorized() throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/users/admin/me"))
                .GET()
                .build();

        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertThat(resp.statusCode()).isEqualTo(401);
    }

    @Test
    void userRole_forbidden() throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/users/admin/me"))
                .header("Authorization", "Bearer " + jwt(List.of("USER")))
                .GET()
                .build();

        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertThat(resp.statusCode()).isEqualTo(403);
    }

    @Test
    void adminRole_ok_andCrudCreateOk() throws Exception {
        String token = jwt(List.of("ADMIN"));

        HttpRequest meReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/users/admin/me"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> meResp = client.send(meReq, HttpResponse.BodyHandlers.ofString());
        assertThat(meResp.statusCode()).isEqualTo(200);

        String body = "{\"email\":\"u1@example.com\",\"enabled\":true,\"roles\":[\"USER\"]}";
        HttpRequest createReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/users/admin/users"))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> createResp = client.send(createReq, HttpResponse.BodyHandlers.ofString());
        assertThat(createResp.statusCode()).isEqualTo(201);
    }
}
