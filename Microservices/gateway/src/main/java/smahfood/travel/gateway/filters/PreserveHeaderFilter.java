package smahfood.travel.gateway.filters;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter to ensure Authorization headers are preserved and forwarded
 * to downstream microservices in the request pipeline.
 */
@Component
public class PreserveHeaderFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // The Authorization header should be automatically forwarded by Spring Cloud Gateway,
        // but this filter ensures it's available for downstream services to validate
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader != null) {
            // Add to the request attributes for potential downstream use
            exchange.getAttributes().put("Authorization", authHeader);
        }
        
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // High order to ensure this runs early in the filter chain
        return -100;
    }
}
