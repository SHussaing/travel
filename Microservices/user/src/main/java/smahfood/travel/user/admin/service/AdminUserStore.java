package smahfood.travel.user.admin.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import smahfood.travel.user.admin.model.AdminUserDto;
import smahfood.travel.user.admin.model.UpsertUserRequest;
import smahfood.travel.user.persistence.UserEntity;
import smahfood.travel.user.persistence.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Phase 1 store backed by PostgreSQL.
 */
@Component
public class AdminUserStore {

    private final UserRepository repository;

    public AdminUserStore(UserRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<AdminUserDto> findById(String id) {
        try {
            long longId = Long.parseLong(id);
            return repository.findById(longId).map(this::toDto);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    @Transactional
    public AdminUserDto create(UpsertUserRequest request) {
        UserEntity entity = new UserEntity();
        apply(entity, request);
        UserEntity saved = repository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public Optional<AdminUserDto> update(String id, UpsertUserRequest request) {
        try {
            long longId = Long.parseLong(id);
            return repository.findById(longId)
                    .map(entity -> {
                        apply(entity, request);
                        return repository.save(entity);
                    })
                    .map(this::toDto);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    @Transactional
    public boolean delete(String id) {
        try {
            long longId = Long.parseLong(id);
            if (!repository.existsById(longId)) return false;
            repository.deleteById(longId);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private void apply(UserEntity entity, UpsertUserRequest request) {
        entity.setEmail(request.email());
        entity.setEnabled(request.enabled());
        entity.setRoles(normalizeRoles(request.roles()));
    }

    private Set<String> normalizeRoles(Set<String> roles) {
        if (roles == null || roles.isEmpty()) return Set.of("USER");
        return roles.stream()
                .filter(r -> r != null && !r.isBlank())
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toUnmodifiableSet());
    }

    private AdminUserDto toDto(UserEntity entity) {
        return new AdminUserDto(
                entity.getId() == null ? null : String.valueOf(entity.getId()),
                entity.getEmail(),
                entity.isEnabled(),
                Set.copyOf(entity.getRoles())
        );
    }
}
