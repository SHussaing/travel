package smahfood.travel.travel.admin.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import smahfood.travel.travel.admin.model.TravelDto;
import smahfood.travel.travel.admin.model.UpsertTravelRequest;
import smahfood.travel.travel.persistence.TravelEntity;
import smahfood.travel.travel.persistence.TravelRepository;

import java.util.List;
import java.util.Optional;

@Component
public class AdminTravelStore {

    private final TravelRepository repository;

    public AdminTravelStore(TravelRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TravelDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public TravelDto create(UpsertTravelRequest request) {
        TravelEntity e = new TravelEntity();
        apply(e, request);
        return toDto(repository.save(e));
    }

    @Transactional
    public Optional<TravelDto> update(String id, UpsertTravelRequest request) {
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

    private void apply(TravelEntity e, UpsertTravelRequest r) {
        e.setDestination(r.destination());
        e.setStartDate(r.startDate());
        e.setEndDate(r.endDate());
        e.setDurationDays(r.durationDays());
        e.setActivities(r.activities());
        e.setAccommodation(r.accommodation());
        e.setTransportation(r.transportation());
    }

    private TravelDto toDto(TravelEntity e) {
        return new TravelDto(
                e.getId() == null ? null : String.valueOf(e.getId()),
                e.getDestination(),
                e.getStartDate(),
                e.getEndDate(),
                e.getDurationDays(),
                e.getActivities(),
                e.getAccommodation(),
                e.getTransportation()
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

