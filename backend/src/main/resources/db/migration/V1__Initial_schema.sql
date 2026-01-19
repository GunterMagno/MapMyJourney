-- MapMyJourney - Schema Inicial Flyway
-- Version: 1.0
-- Fecha: 2025-12-15
-- Descripcion: Creacion inicial de todas las tablas de la aplicacion

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);

-- Tabla de viajes
CREATE TABLE IF NOT EXISTS trips (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    trip_code VARCHAR(8) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date >= start_date),
    CHECK (budget > 0)
);
CREATE INDEX IF NOT EXISTS idx_trip_code ON trips(trip_code);
CREATE INDEX IF NOT EXISTS idx_created_at ON trips(created_at);

-- Tabla de miembros de viaje (Many-to-Many)
CREATE TABLE IF NOT EXISTS trip_members (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    role VARCHAR(20) DEFAULT 'VIEWER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_trip ON trip_members(user_id, trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_id_members ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_user_id_members ON trip_members(user_id);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    paid_by_user_id BIGINT NOT NULL,
    description VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    split_type VARCHAR(20) DEFAULT 'EQUAL',
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CHECK (amount > 0.01)
);
CREATE INDEX IF NOT EXISTS idx_trip_id_expenses ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_paid_by_user_id ON expenses(paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expenses(expense_date);

-- Tabla de divisiones de gastos
CREATE TABLE IF NOT EXISTS expense_splits (
    id BIGSERIAL PRIMARY KEY,
    expense_id BIGINT NOT NULL,
    participant_user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2),
    paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_expense_participant ON expense_splits(expense_id, participant_user_id);
CREATE INDEX IF NOT EXISTS idx_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_participant_user_id ON expense_splits(participant_user_id);
CREATE INDEX IF NOT EXISTS idx_paid ON expense_splits(paid);
CREATE INDEX IF NOT EXISTS idx_user_debt ON expense_splits(participant_user_id, paid);
CREATE INDEX IF NOT EXISTS idx_trip_expenses ON expenses(trip_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_trip_member_role ON trip_members(trip_id, role);
