-- MapMyJourney - Datos de Prueba Iniciales
-- Usuario de prueba: userTest@example.com / userTest@123
-- Hash BCrypt generado para: userTest@123

-- Insertar usuario de prueba
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES ('Test User', 'userTest@example.com', '$2a$10$ZLWXqb5pppv5Y5Ax7VlKiuZXO/lLhAXEYEDKvr9Lp4c6X.d4S5K/q', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Viaje 1: Viaje a Barcelona
INSERT INTO trips (title, destination, description, start_date, end_date, budget, trip_code, created_at, updated_at)
VALUES ('Viaje Barcelona', 'Barcelona, España', 'Fin de semana explorando la ciudad condal con museos, playas y gastronomía', '2025-02-01', '2025-02-05', 1500.00, 'BCN123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Viaje 2: Viaje a París
INSERT INTO trips (title, destination, description, start_date, end_date, budget, trip_code, created_at, updated_at)
VALUES ('Viaje París', 'París, Francia', 'Semana romántica visitando la Torre Eiffel, Louvre y catacumbas', '2025-03-10', '2025-03-17', 2500.00, 'PAR456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Viaje 3: Viaje a Tokio
INSERT INTO trips (title, destination, description, start_date, end_date, budget, trip_code, created_at, updated_at)
VALUES ('Viaje Tokio', 'Tokio, Japón', 'Dos semanas en Japón explorando templos, rascacielos y cultura local', '2025-05-01', '2025-05-14', 4000.00, 'TYO789', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Viaje 4: Viaje a Nueva York
INSERT INTO trips (title, destination, description, start_date, end_date, budget, trip_code, created_at, updated_at)
VALUES ('Viaje NYC', 'Nueva York, USA', 'Una semana en la gran manzana visitando museos, Broadway y miradores', '2025-06-15', '2025-06-22', 3000.00, 'NYC111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Viaje 5: Viaje a Amsterdam
INSERT INTO trips (title, destination, description, start_date, end_date, budget, trip_code, created_at, updated_at)
VALUES ('Viaje Amsterdam', 'Amsterdam, Holanda', 'Paseo por canales, museos de arte y degustación de comida local', '2025-07-05', '2025-07-12', 1800.00, 'AMS222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Agregar usuario a todos los viajes como ADMIN
INSERT INTO trip_members (user_id, trip_id, role, joined_at)
SELECT u.id, t.id, 'ADMIN', CURRENT_TIMESTAMP
FROM users u, trips t
WHERE u.email = 'userTest@example.com' AND t.trip_code IN ('BCN123', 'PAR456', 'TYO789', 'NYC111', 'AMS222');

-- Viaje 1: Barcelona - Gastos
INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Hotel Barcelona 4 noches', 400.00, '2025-02-01', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'BCN123' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Vuelo Barcelona', 250.00, '2025-02-01', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'BCN123' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Entrada Sagrada Familia', 35.00, '2025-02-02', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'BCN123' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Comida en restaurante típico', 85.50, '2025-02-03', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'BCN123' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Tour por las playas', 60.00, '2025-02-04', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'BCN123' AND u.email = 'userTest@example.com';

-- Viaje 2: París - Gastos
INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Vuelo Madrid-París', 350.00, '2025-03-10', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'PAR456' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Hotel París 7 noches', 700.00, '2025-03-10', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'PAR456' AND u.email = 'userTest@example.com';

-- ... (así sucesivamente para el resto si es necesario, pero simplificaré para que funcione el concepto)


INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Entrada Louvre', 17.00, '2025-03-11', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'PAR456' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Cena en Montmartre', 120.00, '2025-03-12', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'PAR456' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Tour en barco por el Sena', 45.00, '2025-03-13', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'PAR456' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Visita a las Catacumbas', 28.00, '2025-03-14', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'PAR456' AND u.email = 'userTest@example.com';

-- Viaje 3: Tokio - Gastos
INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Vuelo España-Tokio', 900.00, '2025-05-01', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'TYO789' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Hotel Tokio 14 noches', 1200.00, '2025-05-01', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'TYO789' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'JR Pass para transporte', 280.00, '2025-05-01', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'TYO789' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Templo Senso-ji y compras', 150.00, '2025-05-02', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'TYO789' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Comida en restaurante Michelin', 250.00, '2025-05-05', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'TYO789' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Excursión a Monte Fuji', 220.00, '2025-05-08', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'TYO789' AND u.email = 'userTest@example.com';

-- Viaje 4: Nueva York - Gastos
INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Vuelo España-NYC', 850.00, '2025-06-15', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'NYC111' AND u.email = 'userTest@example.com';

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
SELECT t.id, u.id, 'Hotel NYC 7 noches', 1400.00, '2025-06-15', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM trips t, users u WHERE t.trip_code = 'NYC111' AND u.email = 'userTest@example.com';

VALUES (4, 1, 'Vuelo a Nueva York', 800.00, '2025-06-15', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (4, 1, 'Hotel NYC 7 noches', 1100.00, '2025-06-15', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (4, 1, 'Entrada Empire State Building', 35.00, '2025-06-16', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (4, 1, 'Entrada Metropolitan Museum', 27.00, '2025-06-17', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (4, 1, 'Entrada Broadway Show', 150.00, '2025-06-19', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (4, 1, 'Comida en Times Square', 80.00, '2025-06-20', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Viaje 5: Amsterdam - Gastos
INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (5, 1, 'Vuelo a Amsterdam', 450.00, '2025-07-05', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (5, 1, 'Hotel Amsterdam 7 noches', 700.00, '2025-07-05', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (5, 1, 'Tour en barco por los canales', 40.00, '2025-07-06', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (5, 1, 'Museo Van Gogh', 22.00, '2025-07-07', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO expenses (trip_id, paid_by_user_id, description, amount, expense_date, split_type, created_at, updated_at)
VALUES (5, 1, 'Cena de comida holandesa típica', 85.00, '2025-07-09', 'EQUAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Agregar splits para todos los gastos (el usuario participa en cada gasto)
-- Viaje 1 - Barcelona
INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (1, 1, 400.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (2, 1, 250.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (3, 1, 35.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (4, 1, 85.50, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (5, 1, 60.00, 100.00, false, CURRENT_TIMESTAMP);

-- Viaje 2 - París
INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (6, 1, 350.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (7, 1, 700.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (8, 1, 17.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (9, 1, 120.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (10, 1, 45.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (11, 1, 28.00, 100.00, false, CURRENT_TIMESTAMP);

-- Viaje 3 - Tokio
INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (12, 1, 900.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (13, 1, 1200.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (14, 1, 280.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (15, 1, 150.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (16, 1, 250.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (17, 1, 220.00, 100.00, false, CURRENT_TIMESTAMP);

-- Viaje 4 - Nueva York
INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (18, 1, 800.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (19, 1, 1100.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (20, 1, 35.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (21, 1, 27.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (22, 1, 150.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (23, 1, 80.00, 100.00, false, CURRENT_TIMESTAMP);

-- Viaje 5 - Amsterdam
INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (24, 1, 450.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (25, 1, 700.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (26, 1, 40.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (27, 1, 22.00, 100.00, false, CURRENT_TIMESTAMP);

INSERT INTO expense_splits (expense_id, participant_user_id, amount, percentage, paid, created_at)
VALUES (28, 1, 85.00, 100.00, false, CURRENT_TIMESTAMP);
