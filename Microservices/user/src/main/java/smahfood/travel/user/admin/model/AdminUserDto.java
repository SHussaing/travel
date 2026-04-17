package smahfood.travel.user.admin.model;

import java.util.Set;

public record AdminUserDto(String id, String email, boolean enabled, Set<String> roles) {
}

