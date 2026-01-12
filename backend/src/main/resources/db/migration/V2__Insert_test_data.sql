-- MapMyJourney - Datos de Prueba Iniciales
-- Version: 2.0
-- Fecha: 2026-01-11
-- Descripcion: Inserción de usuarios y datos de prueba para desarrollo

-- Usuarios de prueba
-- Contraseña de ejemplo: SecurePass123 (hasheada con BCrypt)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Juan García', 'juan@example.com', '$2a$10$K.CiBrJx.7U0mF/RaKSqruJNpVY0i4nxNAQrqFYfVVHIkxEL0p3uy', 'USER'),
(2, 'María López', 'maria@example.com', '$2a$10$K.CiBrJx.7U0mF/RaKSqruJNpVY0i4nxNAQrqFYfVVHIkxEL0p3uy', 'USER'),
(3, 'Carlos Rodríguez', 'carlos@example.com', '$2a$10$K.CiBrJx.7U0mF/RaKSqruJNpVY0i4nxNAQrqFYfVVHIkxEL0p3uy', 'USER'),
(4, 'Admin Sistema', 'admin@example.com', '$2a$10$K.CiBrJx.7U0mF/RaKSqruJNpVY0i4nxNAQrqFYfVVHIkxEL0p3uy', 'ADMIN');

-- Viajes
INSERT INTO trips (id, title, destination, description, start_date, end_date, budget, trip_code) VALUES
(1, 'Viaje a París', 'París, Francia', 'Fin de semana con amigos explorando la ciudad de la luz', '2025-06-01', '2025-06-05', 2000.00, 'PARIS25'),
(2, 'Barcelona Week', 'Barcelona, España', 'Una semana completa en la capital de Cataluña', '2025-07-15', '2025-07-22', 3500.00, 'BCN0725'),
(3, 'Tokyo Adventure', 'Tokio, Japón', 'Viaje épico a Japón durante dos semanas', '2025-08-10', '2025-08-25', 5000.00, 'TOKYO25');

-- Miembros de viaje
INSERT INTO trip_members (id, user_id, trip_id, role) VALUES
(1, 1, 1, 'OWNER'),
(2, 2, 1, 'EDITOR'),
(3, 3, 1, 'VIEWER'),
(4, 1, 2, 'OWNER'),
(5, 2, 2, 'EDITOR'),
(6, 1, 3, 'OWNER'),
(7, 3, 3, 'EDITOR');

-- Gastos
INSERT INTO expenses (id, trip_id, paid_by_user_id, description, amount, expense_date, split_type) VALUES
(1, 1, 1, 'Cena en restaurante "Chez Lucas"', 120.50, '2025-06-01', 'EQUAL'),
(2, 1, 2, 'Entradas al Museo del Louvre', 75.00, '2025-06-02', 'EQUAL'),
(3, 1, 1, 'Taxi del aeropuerto al hotel', 45.00, '2025-06-01', 'EQUAL'),
(4, 2, 2, 'Alojamiento en hotel boutique', 500.00, '2025-07-15', 'EQUAL'),
(5, 2, 3, 'Tours guiados por Barcelona', 200.00, '2025-07-16', 'EQUAL'),
(6, 3, 1, 'Vuelo Tokyo (aproximado)', 1200.00, '2025-08-10', 'EQUAL');

-- Divisiones de gastos
-- Gasto 1: €120.50 dividido en 3 = €40.17 cada uno
INSERT INTO expense_splits (id, expense_id, participant_user_id, amount, percentage, paid) VALUES
(1, 1, 1, 40.17, 33.33, TRUE),
(2, 1, 2, 40.17, 33.33, FALSE),
(3, 1, 3, 40.16, 33.34, FALSE);

-- Gasto 2: €75.00 dividido en 3 = €25.00 cada uno
INSERT INTO expense_splits (id, expense_id, participant_user_id, amount, percentage, paid) VALUES
(4, 2, 1, 25.00, 33.33, FALSE),
(5, 2, 2, 25.00, 33.33, TRUE),
(6, 2, 3, 25.00, 33.34, FALSE);

-- Gasto 3: €45.00 dividido en 3 = €15.00 cada uno
INSERT INTO expense_splits (id, expense_id, participant_user_id, amount, percentage, paid) VALUES
(7, 3, 1, 15.00, 33.33, TRUE),
(8, 3, 2, 15.00, 33.33, FALSE),
(9, 3, 3, 15.00, 33.34, FALSE);

-- Gasto 4: €500.00 dividido en 2 = €250.00 cada uno
INSERT INTO expense_splits (id, expense_id, participant_user_id, amount, percentage, paid) VALUES
(10, 4, 1, 250.00, 50.00, FALSE),
(11, 4, 2, 250.00, 50.00, TRUE);

-- Gasto 5: €200.00 dividido en 2 = €100.00 cada uno
INSERT INTO expense_splits (id, expense_id, participant_user_id, amount, percentage, paid) VALUES
(12, 5, 2, 100.00, 50.00, FALSE),
(13, 5, 3, 100.00, 50.00, TRUE);

-- Gasto 6: €1200.00 dividido en 3 = €400.00 cada uno
INSERT INTO expense_splits (id, expense_id, participant_user_id, amount, percentage, paid) VALUES
(14, 6, 1, 400.00, 33.33, TRUE),
(15, 6, 2, 400.00, 33.33, FALSE),
(16, 6, 3, 400.00, 33.34, FALSE);
