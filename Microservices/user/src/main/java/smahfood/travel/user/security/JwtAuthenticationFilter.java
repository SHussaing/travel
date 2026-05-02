package smahfood.travel.user.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final SecretKey key;

    public JwtAuthenticationFilter(String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        System.out.println("[JwtAuthenticationFilter] Authorization header: " + (header != null ? "present" : "missing"));
        
        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("[JwtAuthenticationFilter] No valid Bearer token found");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring("Bearer ".length()).trim();
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String subject = claims.getSubject();
            Collection<? extends GrantedAuthority> authorities = extractAuthorities(claims);
            
            System.out.println("[JwtAuthenticationFilter] Token valid. Subject: " + subject);
            System.out.println("[JwtAuthenticationFilter] Authorities: " + authorities);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(subject, null, authorities);
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            System.out.println("[JwtAuthenticationFilter] Token validation failed: " + e.getMessage());
            // Invalid token: don't authenticate, let Spring Security handle authorization
        }

        filterChain.doFilter(request, response);
    }

    @SuppressWarnings("unchecked")
    private Collection<? extends GrantedAuthority> extractAuthorities(Claims claims) {
        Object rolesObj = claims.get("roles");
        System.out.println("[JwtAuthenticationFilter] Raw roles from token: " + rolesObj);
        
        if (rolesObj instanceof List<?> list) {
            var authorities = list.stream()
                    .filter(r -> r != null)
                    .map(Object::toString)
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                    .map(SimpleGrantedAuthority::new)
                    .toList();
            System.out.println("[JwtAuthenticationFilter] Extracted authorities: " + authorities);
            return authorities;
        }
        System.out.println("[JwtAuthenticationFilter] No roles found in token");
        return Collections.emptyList();
    }
}

