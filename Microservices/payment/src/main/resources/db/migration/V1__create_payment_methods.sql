CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    configuration JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_methods_provider ON payment_methods(provider);

