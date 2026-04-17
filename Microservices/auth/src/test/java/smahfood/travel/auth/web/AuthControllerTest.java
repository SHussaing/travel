package smahfood.travel.auth.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import smahfood.travel.auth.web.dto.AdminLoginRequest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        properties = {
                "admin.bootstrap.username=admin",
                "admin.bootstrap.password=admin123",
                "jwt.secret=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678901234567890",
                "jwt.expiration=3600000"
        }
)
class AuthControllerTest {

    @Autowired
    AuthController controller;

    @Test
    void login_ok_returnsToken() {
        ResponseEntity<?> resp = controller.adminLogin(new AdminLoginRequest("admin", "admin123"));
        assertThat(resp.getStatusCode().value()).isEqualTo(200);
        assertThat(String.valueOf(resp.getBody())).contains("token");
    }

    @Test
    void login_badPassword_unauthorized() {
        ResponseEntity<?> resp = controller.adminLogin(new AdminLoginRequest("admin", "wrong"));
        assertThat(resp.getStatusCode().value()).isEqualTo(401);
    }
}
