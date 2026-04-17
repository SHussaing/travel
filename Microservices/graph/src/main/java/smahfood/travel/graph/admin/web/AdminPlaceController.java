package smahfood.travel.graph.admin.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import smahfood.travel.graph.admin.model.PlaceDto;
import smahfood.travel.graph.admin.model.UpsertPlaceRequest;
import smahfood.travel.graph.admin.service.AdminPlaceStore;

import java.util.List;

@RestController
@RequestMapping("/graph/admin/places")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPlaceController {

    private final AdminPlaceStore store;

    public AdminPlaceController(AdminPlaceStore store) {
        this.store = store;
    }

    @GetMapping
    public List<PlaceDto> list() {
        return store.list();
    }

    @PostMapping
    public ResponseEntity<PlaceDto> create(@Valid @RequestBody UpsertPlaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(store.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaceDto> update(@PathVariable String id, @Valid @RequestBody UpsertPlaceRequest request) {
        return store.update(id, request).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return store.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

