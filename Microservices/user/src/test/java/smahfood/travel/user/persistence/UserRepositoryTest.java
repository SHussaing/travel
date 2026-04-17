package smahfood.travel.user.persistence;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import smahfood.travel.user.testutil.PostgresTestContainerConfig;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@ContextConfiguration(classes = PostgresTestContainerConfig.class)
class UserRepositoryTest {

    @Autowired
    UserRepository repository;

    @Test
    void saveAndLoad_userWithRoles_roundTrips() {
        UserEntity u = new UserEntity();
        u.setEmail("repo-test@example.com");
        u.setEnabled(true);
        u.setRoles(Set.of("ADMIN", "USER"));

        UserEntity saved = repository.save(u);

        UserEntity loaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(loaded.getEmail()).isEqualTo("repo-test@example.com");
        assertThat(loaded.getRoles()).containsExactlyInAnyOrder("ADMIN", "USER");
    }
}

