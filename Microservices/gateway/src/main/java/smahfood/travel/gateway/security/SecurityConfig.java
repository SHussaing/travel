package smahfood.travel.gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import reactor.core.publisher.Mono;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http,
                                                     JwtAuthenticationManager authenticationManager,
                                                     JwtServerAuthenticationConverter authenticationConverter) {

        AuthenticationWebFilter bearerAuthFilter = new AuthenticationWebFilter(authenticationManager);
        bearerAuthFilter.setServerAuthenticationConverter(authenticationConverter);
        // Require authentication for all paths EXCEPT /auth/** and /actuator/**
        bearerAuthFilter.setRequiresAuthenticationMatcher(
                new NegatedServerWebExchangeMatcher(
                        new OrServerWebExchangeMatcher(
                                ServerWebExchangeMatchers.pathMatchers("/auth/**"),
                                ServerWebExchangeMatchers.pathMatchers("/actuator/**")
                        )
                )
        );

        // Don't redirect or trigger Basic auth challenges; just return 401.
        bearerAuthFilter.setAuthenticationFailureHandler(unauthorizedFailureHandler());
        bearerAuthFilter.setAuthenticationSuccessHandler(noopSuccessHandler());

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .addFilterAt(bearerAuthFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((exchange, e) -> {
                            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                            return exchange.getResponse().setComplete();
                        })
                        .accessDeniedHandler((exchange, e) -> {
                            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                            return exchange.getResponse().setComplete();
                        }))
                .authorizeExchange(ex -> ex
                        .pathMatchers("/auth/**", "/actuator/**").permitAll()
                        // Let admin paths through the gateway and let microservices validate JWT
                        .pathMatchers("/users/**", "/travel/**", "/payment/**", "/graph/**").permitAll()
                        .anyExchange().authenticated())
                .build();
    }

    private static ServerAuthenticationFailureHandler unauthorizedFailureHandler() {
        return (webFilterExchange, exception) -> {
            webFilterExchange.getExchange().getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return webFilterExchange.getExchange().getResponse().setComplete();
        };
    }

    private static ServerAuthenticationSuccessHandler noopSuccessHandler() {
        return (webFilterExchange, authentication) -> Mono.empty();
    }
}
