-- Script para crear la tabla de actividades del itinerario

CREATE SEQUENCE IF NOT EXISTS activities_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ACTIVITY', 'TRANSITION')),
    start_time VARCHAR(5) NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 1440),
    location VARCHAR(255),
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    day_index INTEGER NOT NULL CHECK (day_index >= 0),
    activity_date DATE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL CHECK (order_index >= 0),
    category VARCHAR(50),
    trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índices para optimizar las búsquedas
CREATE INDEX idx_activity_trip ON activities(trip_id);
CREATE INDEX idx_activity_date ON activities(activity_date);
CREATE INDEX idx_activity_trip_date ON activities(trip_id, activity_date);
CREATE INDEX idx_activity_trip_day ON activities(trip_id, day_index);
