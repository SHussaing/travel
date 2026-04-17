package smahfood.travel.graph.admin.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import smahfood.travel.graph.admin.model.PlaceDto;
import smahfood.travel.graph.admin.model.UpsertPlaceRequest;
import smahfood.travel.graph.persistence.PlaceNode;
import smahfood.travel.graph.persistence.PlaceRepository;

import java.util.List;
import java.util.Optional;

@Component
public class AdminPlaceStore {

    private final PlaceRepository repository;

    public AdminPlaceStore(PlaceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PlaceDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public PlaceDto create(UpsertPlaceRequest request) {
        PlaceNode node = new PlaceNode();
        apply(node, request);
        return toDto(repository.save(node));
    }

    @Transactional
    public Optional<PlaceDto> update(String id, UpsertPlaceRequest request) {
        Long longId = parseId(id);
        if (longId == null) return Optional.empty();

        return repository.findById(longId)
                .map(node -> {
                    apply(node, request);
                    return repository.save(node);
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

    private void apply(PlaceNode node, UpsertPlaceRequest request) {
        node.setName(request.name());
        node.setCountry(request.country());
    }

    private PlaceDto toDto(PlaceNode node) {
        return new PlaceDto(node.getId() == null ? null : String.valueOf(node.getId()), node.getName(), node.getCountry());
    }

    private Long parseId(String id) {
        try {
            return Long.parseLong(id);
        } catch (Exception ex) {
            return null;
        }
    }
}

