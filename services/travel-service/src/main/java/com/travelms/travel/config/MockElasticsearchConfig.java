package com.travelms.travel.config;

import com.travelms.travel.model.document.TravelDocument;
import com.travelms.travel.repository.elasticsearch.TravelSearchRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import java.lang.reflect.Proxy;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Provides mock Elasticsearch repositories when Elasticsearch is disabled
 */
@Configuration
@Profile("docker")
public class MockElasticsearchConfig {

    @Bean
    @Primary
    public TravelSearchRepository mockTravelSearchRepository() {
        return (TravelSearchRepository) Proxy.newProxyInstance(
                TravelSearchRepository.class.getClassLoader(),
                new Class[]{TravelSearchRepository.class},
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    Class<?> returnType = method.getReturnType();

                    if ("save".equals(methodName) && args != null && args.length > 0) {
                        return args[0];
                    }
                    if ("saveAll".equals(methodName) && args != null && args.length > 0) {
                        return args[0];
                    }
                    if ("count".equals(methodName)) {
                        return 0L;
                    }

                    if (void.class.equals(returnType)) {
                        return null;
                    }
                    if (Optional.class.equals(returnType)) {
                        return Optional.empty();
                    }
                    if (boolean.class.equals(returnType) || Boolean.class.equals(returnType)) {
                        return false;
                    }
                    if (long.class.equals(returnType) || Long.class.equals(returnType)) {
                        return 0L;
                    }
                    if (int.class.equals(returnType) || Integer.class.equals(returnType)) {
                        return 0;
                    }
                    if (double.class.equals(returnType) || Double.class.equals(returnType)) {
                        return 0D;
                    }
                    if (float.class.equals(returnType) || Float.class.equals(returnType)) {
                        return 0F;
                    }
                    if (List.class.isAssignableFrom(returnType) || Iterable.class.isAssignableFrom(returnType)) {
                        return Collections.emptyList();
                    }
                    if (TravelDocument.class.isAssignableFrom(returnType) && args != null && args.length > 0
                            && args[0] instanceof TravelDocument) {
                        return args[0];
                    }

                    return null;
                });
    }
}

