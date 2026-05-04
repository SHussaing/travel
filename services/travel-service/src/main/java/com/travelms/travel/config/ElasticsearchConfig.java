package com.travelms.travel.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Disables Elasticsearch repositories in Docker profile
 * This prevents Spring Data from trying to connect to Elasticsearch
 */
@Configuration
@ConditionalOnProperty(name = "spring.elasticsearch.enabled", havingValue = "true")
@EnableElasticsearchRepositories(basePackages = "com.travelms.travel.repository.elasticsearch")
public class ElasticsearchConfig {
    // Empty configuration - used only to conditionally enable ES repositories
}
