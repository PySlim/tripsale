

-- Insertar usuarios
INSERT INTO Users (firstName, secondName, document, email, password)
VALUES
('John', 'Doe', 12345678, 'john.doe@example.com', 'password123'),
('Jane', 'Smith', 87654321, 'jane.smith@example.com', 'password456'),
('Alice', 'Johnson', 23456789, 'alice.johnson@example.com', 'password789'),
('Bob', 'Brown', 34567890, 'bob.brown@example.com', 'password101'),
('Charlie', 'Davis', 45678901, 'charlie.davis@example.com', 'password102');


-- Insertar proveedores
INSERT INTO Providers (name, code, active)
VALUES
('Provider A', 'xr3j',true),
('Provider B', 'xr4j',true),
('Provider C', 'xr5j',true),
('Provider D',  'xr6j',true),
('Provider E', 'xr7j',true);


-- Insertar categorías
INSERT INTO Categories (name)
VALUES
('Sedan'),
('SUV'),
('Truck'),
('Van'),
('Luxury');


-- Insertar vehículos
INSERT INTO Vehicles (name, code, capacity, isActive, description, providerId, categoryId)
VALUES
('Vehicle 1', 'V001', 4, true, 'Comfortable sedan', 1, 1),
('Vehicle 2', 'V002', 6, true, 'Spacious SUV', 2, 2),
('Vehicle 3', 'V003', 2, true, 'Compact truck', 3, 3),
('Vehicle 4', 'V004', 8, true, 'Large van', 4, 4),
('Vehicle 5', 'V005', 5, true, 'Luxury sedan', 5, 5);


-- Insertar lugares (places)
INSERT INTO Places (name, code, type, latitude, longitude, isActive, description) VALUES
('Central Park', 'CP001', 'ORIGIN', 40.785091, -73.968285, 1, 'Famous park in New York City');

INSERT INTO Places (name, code, type, latitude, longitude, isActive, description) VALUES
('Golden Gate Bridge', 'GGB002', 'DESTINATION', 37.819929, -122.478255, 1, 'Iconic suspension bridge in San Francisco');

INSERT INTO Places (name, code, type, latitude, longitude, isActive, description) VALUES
('Eiffel Tower', 'ET003', 'BOTH', 48.858844, 2.294351, 1, 'Historic landmark in Paris, France');

INSERT INTO Places (name, code, type, latitude, longitude, isActive, description) VALUES
('Colosseum', 'COL004', 'ORIGIN', 41.890251, 12.492373, 1, 'Ancient amphitheater in Rome, Italy');

INSERT INTO Places (name, code, type, latitude, longitude, isActive, description) VALUES
('Sydney Opera House', 'SOH005', 'DESTINATION', -33.856784, 151.215297, 1, 'Famous performing arts center in Sydney, Australia');


-- Inserción de registros en la tabla Coverages
INSERT INTO Coverages (startTime, duration, isActive, providerId, vehicleId)
VALUES ('2024-10-23 10:00:00', 60, 1, 1, 1);

INSERT INTO Coverages (startTime, duration, isActive, providerId, vehicleId)
VALUES ('2024-10-24 12:30:00', 90, 1, 2, 3);

INSERT INTO Coverages (startTime, duration, isActive, providerId, vehicleId)
VALUES ('2024-10-25 15:00:00', 45, 0, 3, 2);

INSERT INTO Coverages (startTime, duration, isActive, providerId, vehicleId)
VALUES ('2024-10-26 08:00:00', 120, 1, 1, 4);

INSERT INTO Coverages (startTime, duration, isActive, providerId, vehicleId)
VALUES ('2024-10-27 11:00:00', 75, 1, 4, 2);





-- Insertar precios
INSERT INTO Prices (amount, currency, validFrom, validTo, isActive, coverageId) VALUES
(100.00, 'USD', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 1, 1);

INSERT INTO Prices (amount, currency, validFrom, validTo, isActive, coverageId) VALUES
(150.50, 'EUR', '2024-06-01 00:00:00', '2024-12-31 23:59:59', 1, 2);

INSERT INTO Prices (amount, currency, validFrom, validTo, isActive, coverageId) VALUES
(200.75, 'GBP', '2024-03-01 00:00:00', '2024-09-30 23:59:59', 1, 3);

INSERT INTO Prices (amount, currency, validFrom, validTo, isActive, coverageId) VALUES
(1200.00, 'USD', '2024-05-15 00:00:00', '2024-11-15 23:59:59', 1, 4);

INSERT INTO Prices (amount, currency, validFrom, validTo, isActive, coverageId) VALUES
(80.99, 'CAD', '2024-07-01 00:00:00', '2025-01-01 23:59:59', 1, 5);

