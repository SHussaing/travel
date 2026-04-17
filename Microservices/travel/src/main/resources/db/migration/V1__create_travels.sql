CREATE TABLE IF NOT EXISTS travels (
    id BIGSERIAL PRIMARY KEY,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL,
    activities TEXT,
    accommodation TEXT,
    transportation TEXT
);

