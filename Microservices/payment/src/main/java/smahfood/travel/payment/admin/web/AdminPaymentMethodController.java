package smahfood.travel.payment.admin.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import smahfood.travel.payment.admin.model.PaymentMethodDto;
import smahfood.travel.payment.admin.model.UpsertPaymentMethodRequest;
import smahfood.travel.payment.admin.service.AdminPaymentMethodStore;

import java.util.List;

@RestController
@RequestMapping("/payment/admin/methods")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentMethodController {

    private final AdminPaymentMethodStore store;

    public AdminPaymentMethodController(AdminPaymentMethodStore store) {
        this.store = store;
    }

    @GetMapping
    public List<PaymentMethodDto> list() {
        return store.list();
    }

    @PostMapping
    public ResponseEntity<PaymentMethodDto> create(@Valid @RequestBody UpsertPaymentMethodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(store.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethodDto> update(@PathVariable String id,
                                                   @Valid @RequestBody UpsertPaymentMethodRequest request) {
        return store.update(id, request).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return store.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

