package smahfood.travel.graph.admin.model;

import jakarta.validation.constraints.NotBlank;

public record UpsertPlaceRequest(
        @NotBlank String name,
        @NotBlank String country
) {
}

