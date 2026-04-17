package smahfood.travel.payment.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Long> {
    boolean existsByProviderIgnoreCase(String provider);
}

