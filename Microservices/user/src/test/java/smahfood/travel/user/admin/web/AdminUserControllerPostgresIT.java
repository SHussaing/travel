package smahfood.travel.user.admin.web;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import smahfood.travel.user.testutil.PostgresTestContainerConfig;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "jwt.secret=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678901234567890"
        }
)
@Import(PostgresTestContainerConfig.class)
class AdminUserControllerPostgresIT {

    @LocalServerPort
    int port;

    @Autowired
    RestClient.Builder restClientBuilder;

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

    private RestClient adminClient() {
        return restClientBuilder
                .baseUrl(baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + jwt(List.of("ADMIN")))
                .build();
    }

    @Test
    void adminCrud_persistsInPostgres() {
        RestClient client = adminClient();

        // CREATE
        Map<?, ?> created = client.post()
                .uri("/users/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"email\":\"it-smoke@example.com\",\"enabled\":true,\"roles\":[\"USER\"]}")
                .retrieve()
                .body(Map.class);

        assertThat(created).isNotNull();
        assertThat(created.get("id")).isNotNull();
        String id = created.get("id").toString();

        // LIST contains it
        List<?> list1 = client.get()
                .uri("/users/admin/users")
                .retrieve()
                .body(List.class);
        assertThat(list1).isNotNull();
        assertThat(list1.size()).isGreaterThanOrEqualTo(1);

        // UPDATE
        Map<?, ?> updated = client.put()
                .uri("/users/admin/users/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"email\":\"it-smoke2@example.com\",\"enabled\":false,\"roles\":[\"ADMIN\",\"USER\"]}")
                .retrieve()
                .body(Map.class);
        assertThat(updated).isNotNull();
        assertThat(updated.get("email")).isEqualTo("it-smoke2@example.com");

        // DELETE
        ResponseEntity<Void> del = client.method(HttpMethod.DELETE)
                .uri("/users/admin/users/{id}", id)
                .retrieve()
                .toBodilessEntity();
        assertThat(del.getStatusCode().value()).isEqualTo(204);

        // DELETE again => 404
        assertThatThrownBy(() -> client.method(HttpMethod.DELETE)
                .uri("/users/admin/users/{id}", id)
                .retrieve()
                .toBodilessEntity())
                .isInstanceOf(RestClientResponseException.class)
                .satisfies(ex -> assertThat(((RestClientResponseException) ex).getStatusCode().value()).isEqualTo(404));
    }

    @Test
    void nonAdmin_forbidden() {
        RestClient nonAdmin = restClientBuilder
                .baseUrl(baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + jwt(List.of("USER")))
                .build();

        assertThatThrownBy(() -> nonAdmin.get().uri("/users/admin/me").retrieve().toBodilessEntity())
                .isInstanceOf(RestClientResponseException.class)
                .satisfies(ex -> assertThat(((RestClientResponseException) ex).getStatusCode().value()).isEqualTo(403));
    }

    @Test
    void noToken_unauthorized() {
        RestClient anon = restClientBuilder.baseUrl(baseUrl()).build();

        assertThatThrownBy(() -> anon.get().uri("/users/admin/me").retrieve().toBodilessEntity())
                .isInstanceOf(RestClientResponseException.class)
                .satisfies(ex -> assertThat(((RestClientResponseException) ex).getStatusCode().value()).isEqualTo(401));
    }
}

