package smahfood.travel.travel.admin.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import smahfood.travel.travel.admin.model.TravelDto;
import smahfood.travel.travel.admin.model.UpsertTravelRequest;
import smahfood.travel.travel.admin.service.AdminTravelStore;

import java.util.List;

@RestController
@RequestMapping("/travel/admin/travels")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTravelController {

    private final AdminTravelStore store;

    public AdminTravelController(AdminTravelStore store) {
        this.store = store;
    }

    @GetMapping
    public List<TravelDto> list() {
        return store.list();
    }

    @PostMapping
    public ResponseEntity<TravelDto> create(@Valid @RequestBody UpsertTravelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(store.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TravelDto> update(@PathVariable String id, @Valid @RequestBody UpsertTravelRequest request) {
        return store.update(id, request).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return store.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

