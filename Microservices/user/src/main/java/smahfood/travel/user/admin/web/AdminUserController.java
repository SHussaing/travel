package smahfood.travel.user.admin.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import smahfood.travel.user.admin.model.AdminUserDto;
import smahfood.travel.user.admin.model.UpsertUserRequest;
import smahfood.travel.user.admin.service.AdminUserStore;

import java.util.List;

@RestController
@RequestMapping("/users/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserStore store;

    public AdminUserController(AdminUserStore store) {
        this.store = store;
    }

    @GetMapping("/me")
    public String me(Authentication authentication) {
        return authentication == null ? "anonymous" : authentication.getName();
    }

    @GetMapping("/users")
    public List<AdminUserDto> list() {
        return store.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserDto> create(@Valid @RequestBody UpsertUserRequest request) {
        AdminUserDto created = store.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> update(@PathVariable String id,
                                               @Valid @RequestBody UpsertUserRequest request) {
        return store.update(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean deleted = store.delete(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

