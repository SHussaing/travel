package smahfood.travel.payment.admin.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import smahfood.travel.payment.admin.model.PaymentMethodDto;
import smahfood.travel.payment.admin.model.UpsertPaymentMethodRequest;
import smahfood.travel.payment.persistence.PaymentMethodEntity;
import smahfood.travel.payment.persistence.PaymentMethodRepository;

import java.util.List;
import java.util.Optional;

@Component
public class AdminPaymentMethodStore {

    private final PaymentMethodRepository repository;

    public AdminPaymentMethodStore(PaymentMethodRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public PaymentMethodDto create(UpsertPaymentMethodRequest request) {
        PaymentMethodEntity e = new PaymentMethodEntity();
        apply(e, request);
        return toDto(repository.save(e));
    }

    @Transactional
    public Optional<PaymentMethodDto> update(String id, UpsertPaymentMethodRequest request) {
        Long longId = parseId(id);
        if (longId == null) return Optional.empty();

        return repository.findById(longId)
                .map(e -> {
                    apply(e, request);
                    return repository.save(e);
                })
                .map(this::toDto);
    }

    @Transactional
    public boolean delete(String id) {
        Long longId = parseId(id);
        if (longId == null) return false;
        if (!repository.existsById(longId)) return false;
        repository.deleteById(longId);
        return true;
    }

    private void apply(PaymentMethodEntity e, UpsertPaymentMethodRequest r) {
        e.setProvider(r.provider().trim().toUpperCase());
        e.setDisplayName(r.displayName());
        e.setEnabled(r.enabled());
        e.setConfiguration(r.configuration());
    }

    private PaymentMethodDto toDto(PaymentMethodEntity e) {
        return new PaymentMethodDto(
                e.getId() == null ? null : String.valueOf(e.getId()),
                e.getProvider(),
                e.getDisplayName(),
                e.isEnabled(),
                e.getConfiguration()
        );
    }

    private Long parseId(String id) {
        try {
            return Long.parseLong(id);
        } catch (Exception ex) {
            return null;
        }
    }
}

