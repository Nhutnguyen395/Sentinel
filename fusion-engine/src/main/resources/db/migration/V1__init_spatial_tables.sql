CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE raw_sensor_pings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id VARCHAR(50) NOT NULL,
    ping_timestamp BIGINT NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index (GIST) to query "find targets within x meters"
CREATE INDEX idx_raw_pings_location ON raw_sensor_pings USING GIST(location);