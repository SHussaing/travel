package smahfood.travel.graph.persistence;

import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface PlaceRepository extends Neo4jRepository<PlaceNode, Long> {
}

