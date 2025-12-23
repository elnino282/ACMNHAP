-- =========================================================
-- ACM Platform - Init Schema + Seed Data
-- =========================================================

DROP DATABASE IF EXISTS quanlymuavu;
CREATE DATABASE quanlymuavu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quanlymuavu;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1) TABLES
-- =========================================================

-- 1.1 Roles
CREATE TABLE roles (
  role_id     INT PRIMARY KEY,
  role_code   VARCHAR(50)  NOT NULL UNIQUE,
  role_name   VARCHAR(100) NOT NULL,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- 1.2 Users
CREATE TABLE users (
  user_id       BIGINT PRIMARY KEY,
  user_name     VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  full_name     VARCHAR(200),
  password_hash VARCHAR(255) NOT NULL,
  status        VARCHAR(20)  NOT NULL,
  province_id   INT          NOT NULL,
  ward_id       INT          NOT NULL
) ENGINE=InnoDB;

-- 1.3 User Roles (many-to-many)
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id INT    NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

-- 1.4 Farms
CREATE TABLE farms (
  farm_id     INT PRIMARY KEY,
  owner_id    BIGINT      NOT NULL,
  farm_name   VARCHAR(255) NOT NULL,
  province_id INT         NOT NULL,
  ward_id     INT         NOT NULL,
  area        DECIMAL(10,2),
  active      TINYINT(1)  NOT NULL DEFAULT 1,
  CONSTRAINT fk_farms_owner FOREIGN KEY (owner_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 1.5 Plots
CREATE TABLE plots (
  plot_id     INT PRIMARY KEY,
  farm_id     INT          NOT NULL,
  plot_name   VARCHAR(255) NOT NULL,
  area        DECIMAL(10,2),
  soil_type   VARCHAR(50),
  status      VARCHAR(20),
  province_id INT          NOT NULL,
  ward_id     INT          NOT NULL,
  created_by  BIGINT       NOT NULL,
  CONSTRAINT fk_plots_farm   FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
  CONSTRAINT fk_plots_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 1.6 Crops
CREATE TABLE crops (
  crop_id     INT PRIMARY KEY,
  crop_name   VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

-- 1.7 Varieties
CREATE TABLE varieties (
  id          INT PRIMARY KEY,
  crop_id     INT NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  CONSTRAINT fk_varieties_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB;

-- 1.8 Seasons
CREATE TABLE seasons (
  season_id            INT AUTO_INCREMENT PRIMARY KEY,
  actual_yield_kg      DECIMAL(38,2),
  created_at           TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  current_plant_count  INT,
  end_date             DATE,
  expected_yield_kg    DECIMAL(38,2),
  initial_plant_count  INT NOT NULL,
  notes                TEXT,
  planned_harvest_date DATE,
  season_name          VARCHAR(255),
  start_date           DATE NOT NULL,
  status               ENUM('ACTIVE','ARCHIVED','CANCELLED','COMPLETED','PLANNED') NOT NULL,
  crop_id              INT NOT NULL,
  plot_id              INT NOT NULL,
  variety_id           INT,
  KEY idx_seasons_crop (crop_id),
  KEY idx_seasons_plot (plot_id),
  KEY idx_seasons_var  (variety_id),
  CONSTRAINT fk_seasons_crop    FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
  CONSTRAINT fk_seasons_plot    FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
  CONSTRAINT fk_seasons_variety FOREIGN KEY (variety_id) REFERENCES varieties(id)
) ENGINE=InnoDB;

-- 1.9 Tasks
CREATE TABLE tasks (
  task_id           INT AUTO_INCREMENT PRIMARY KEY,
  actual_end_date   DATE,
  actual_start_date DATE,
  created_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  description       TEXT,
  due_date          DATE,
  notes             TEXT,
  planned_date      DATE,
  status            ENUM('CANCELLED','DONE','IN_PROGRESS','OVERDUE','PENDING') DEFAULT 'PENDING',
  title             VARCHAR(255) NOT NULL,
  season_id         INT,
  user_id           BIGINT NOT NULL,
  KEY idx_tasks_season (season_id),
  KEY idx_tasks_user   (user_id),
  CONSTRAINT fk_tasks_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_tasks_user   FOREIGN KEY (user_id)   REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 1.10 Field Logs
CREATE TABLE field_logs (
  field_log_id INT PRIMARY KEY,
  season_id    INT  NOT NULL,
  log_date     DATE NOT NULL,
  log_type     VARCHAR(50) NOT NULL,
  notes        TEXT,
  KEY idx_field_logs_season (season_id),
  CONSTRAINT fk_field_logs_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB;

-- 1.11 Expenses
CREATE TABLE expenses (
  expense_id   INT AUTO_INCREMENT PRIMARY KEY,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  expense_date DATE NOT NULL,
  item_name    VARCHAR(255) NOT NULL,
  quantity     INT NOT NULL,
  total_cost   DECIMAL(38,2),
  unit_price   DECIMAL(38,2) NOT NULL,
  season_id    INT NOT NULL,
  user_id      BIGINT NOT NULL,
  KEY idx_expenses_season (season_id),
  KEY idx_expenses_user   (user_id),
  CONSTRAINT fk_expenses_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_expenses_user   FOREIGN KEY (user_id)   REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 1.12 Warehouses
CREATE TABLE warehouses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  type        VARCHAR(20),
  farm_id     INT NOT NULL,
  province_id INT,
  ward_id     INT,
  KEY idx_wh_farm (farm_id),
  CONSTRAINT fk_warehouses_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
) ENGINE=InnoDB;

-- 1.13 Stock Locations
CREATE TABLE stock_locations (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  aisle        VARCHAR(20),
  bin          VARCHAR(20),
  shelf        VARCHAR(20),
  zone         VARCHAR(20),
  warehouse_id INT NOT NULL,
  KEY idx_locations_wh (warehouse_id),
  CONSTRAINT fk_stock_locations_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
) ENGINE=InnoDB;

-- 1.14 Suppliers
CREATE TABLE suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(30),
  license_no    VARCHAR(100),
  name          VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

-- 1.15 Supply Items
CREATE TABLE supply_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  active_ingredient VARCHAR(150),
  name              VARCHAR(150) NOT NULL,
  restricted_flag   BIT(1),
  unit              VARCHAR(20)
) ENGINE=InnoDB;

-- 1.16 Supply Lots
CREATE TABLE supply_lots (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  batch_code    VARCHAR(100),
  expiry_date   DATE,
  status        VARCHAR(20),
  supplier_id   INT,
  supply_item_id INT NOT NULL,
  KEY idx_supply_lots_supplier (supplier_id),
  KEY idx_supply_lots_item     (supply_item_id),
  CONSTRAINT fk_supply_lots_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  CONSTRAINT fk_supply_lots_item     FOREIGN KEY (supply_item_id) REFERENCES supply_items(id)
) ENGINE=InnoDB;

-- 1.17 Stock Movements
CREATE TABLE stock_movements (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  movement_date DATETIME(6) NOT NULL,
  movement_type ENUM('ADJUST','IN','OUT') NOT NULL,
  note          TEXT,
  quantity      DECIMAL(14,3) NOT NULL,
  location_id   INT,
  season_id     INT,
  supply_lot_id INT NOT NULL,
  task_id       INT,
  warehouse_id  INT NOT NULL,
  KEY idx_sm_loc  (location_id),
  KEY idx_sm_sea  (season_id),
  KEY idx_sm_lot  (supply_lot_id),
  KEY idx_sm_task (task_id),
  KEY idx_sm_wh   (warehouse_id),
  CONSTRAINT fk_sm_location FOREIGN KEY (location_id) REFERENCES stock_locations(id),
  CONSTRAINT fk_sm_season   FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_sm_lot      FOREIGN KEY (supply_lot_id) REFERENCES supply_lots(id),
  CONSTRAINT fk_sm_task     FOREIGN KEY (task_id) REFERENCES tasks(task_id),
  CONSTRAINT fk_sm_wh       FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
) ENGINE=InnoDB;

-- 1.18 Harvests
CREATE TABLE harvests (
  harvest_id   INT AUTO_INCREMENT PRIMARY KEY,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  harvest_date DATE NOT NULL,
  note         VARCHAR(255),
  quantity     DECIMAL(38,2) NOT NULL,
  unit         DECIMAL(38,2) NOT NULL,
  season_id    INT,
  KEY idx_harvests_season (season_id),
  CONSTRAINT fk_harvests_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB;

-- 1.19 Incidents
CREATE TABLE incidents (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  deadline      DATE,
  description   TEXT,
  incident_type VARCHAR(50),
  resolved_at   DATETIME(6),
  severity      ENUM('HIGH','LOW','MEDIUM'),
  status        ENUM('CANCELLED','IN_PROGRESS','OPEN','RESOLVED'),
  reported_by   BIGINT,
  season_id     INT NOT NULL,
  KEY idx_incidents_season (season_id),
  KEY idx_incidents_user   (reported_by),
  CONSTRAINT fk_incidents_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_incidents_user   FOREIGN KEY (reported_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- =========================================================
-- 2) SEED DATA (the data you provided, made consistent)
-- =========================================================

-- 2.1 Roles
INSERT INTO roles (role_id, role_code, role_name, description) VALUES
(1, 'ADMIN',  'Administrator', 'System administrator'),
(2, 'FARMER', 'Farmer',        'Farm owner / farmer');

-- 2.2 Users
-- Password hashing: BCrypt with strength 10
-- Plain passwords for reference: admin123, 12345678
INSERT INTO users (user_id, user_name, email, phone, full_name, password_hash, status, province_id, ward_id) VALUES
(1, 'admin', 'admin@acm.local', '0900000000', 'System Administrator', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ACTIVE', 24, 25112),
(2, 'farmer0', 'farmer1@acm.local', '0900000001', 'Nguyen Van T', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cit0qry6BvMS5Ctr.OC0sxaVDClgI', 'ACTIVE', 24, 25112),
(3, 'farmer2', 'farmer2@acm.local', '0900000002', 'Nguyen Van A', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cit0qry6BvMS5Ctr.OC0sxaVDClgI', 'ACTIVE', 24, 25112),
(4, 'farmer3', 'farmer3@acm.local', '0900000003', 'Tran Thi B',   '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cit0qry6BvMS5Ctr.OC0sxaVDClgI', 'ACTIVE', 24, 25112);

-- (Fix) Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),  -- admin -> ADMIN role
(2, 2),  -- farmer0 -> FARMER role
(3, 2),  -- farmer2 -> FARMER role
(4, 2);  -- farmer3 -> FARMER role


-- 2.3 Farms / Plots
INSERT INTO farms (farm_id, owner_id, farm_name, province_id, ward_id, area, active) VALUES
(1, 2, 'Farm A', 24, 25112, 12.50, 1),
(2, 2, 'Farm B', 24, 25112,  8.20, 0);

INSERT INTO plots (plot_id, farm_id, plot_name, area, soil_type, status, province_id, ward_id, created_by) VALUES
(1, 1, 'Plot A1', 2.50, 'LOAM',  'IN_USE', 24, 25112, 2),
(2, 1, 'Plot A2', 3.00, 'CLAY',  'IN_USE', 24, 25112, 2),
(3, 2, 'Plot B1', 1.80, 'SANDY', 'IN_USE', 24, 25112, 2);

-- 2.4 Crops / Varieties
INSERT INTO crops (crop_id, crop_name, description) VALUES
(1, 'Rice',   'Paddy crop'),
(2, 'Tomato', 'Vegetable crop'),
(3, 'Mango',  'Fruit crop');

INSERT INTO varieties (id, crop_id, name, description) VALUES
(1, 1, 'ST25',          'Fragrant rice variety'),
(2, 2, 'Cherry Tomato', 'Small sweet tomato'),
(3, 2, 'Beef Tomato',   'Large tomato'),
(4, 3, 'Cat Chu',       'Popular mango variety');

-- 2.5 Seasons
INSERT INTO seasons (
  actual_yield_kg, created_at, current_plant_count, end_date,
  expected_yield_kg, initial_plant_count, notes, planned_harvest_date,
  season_name, start_date, status, crop_id, plot_id, variety_id
) VALUES
(NULL, NOW(), NULL, NULL, 800.00, 1200, 'Planned tomato season. Prepare beds & irrigation.',
 '2026-03-10', 'Tomato Season - Plot A1 (2026)', '2026-01-05', 'PLANNED', 2, 1, 2),

(NULL, NOW(), 1180, NULL, 850.00, 1200, 'Focus on pest prevention and weekly inspection.',
 '2025-12-20', 'Tomato Season - Plot A1 (2025)', '2025-10-01', 'ACTIVE', 2, 1, 2),

(NULL, NOW(), NULL, NULL, 2200.00, 0, 'Maintain irrigation schedule; monitor weeds.',
 '2025-12-25', 'Rice Season - Plot A2 (2025)', '2025-09-15', 'ACTIVE', 1, 2, 1),

(950.50, NOW(), 1100, '2025-12-28', 900.00, 1150, 'Completed with good yield. Minor pest issues.',
 '2025-12-20', 'Tomato Season - Plot B1 (2025)', '2025-09-20', 'COMPLETED', 2, 3, 3);

-- 2.6 Tasks
-- NOTE: after insert, task_id will be 1..4
INSERT INTO tasks (
  actual_end_date, actual_start_date, created_at,
  description, due_date, notes, planned_date,
  status, title, season_id, user_id
) VALUES
(NULL, NULL, NOW(), 'Prepare seedling beds, check irrigation lines.',
 '2025-10-02', NULL, '2025-10-01', 'PENDING', 'Prepare beds & irrigation', 2, 2),

('2025-10-03', '2025-10-02', NOW(), 'Move seedlings to Plot A1, spacing 40cm.',
 '2025-10-03', 'Completed on time.', '2025-10-02', 'DONE', 'Transplant seedlings', 2, 2),

(NULL, '2025-10-10', NOW(), 'Apply NPK fertilizer, then water after 2 hours.',
 '2025-10-10', 'Use lot NPK-2025-01', '2025-10-10', 'IN_PROGRESS', 'Fertilize (NPK)', 2, 2),

(NULL, NULL, NOW(), 'Inspect leaves and stems, record any pest signs.',
 '2025-10-15', 'Focus on aphids and whiteflies.', '2025-10-15', 'PENDING', 'Pest inspection', 2, 2);

-- 2.7 Field Logs
INSERT INTO field_logs (field_log_id, season_id, log_date, log_type, notes) VALUES
(1, 2, '2025-10-03', 'TRANSPLANT', 'Transplant completed; plants look healthy'),
(2, 2, '2025-10-10', 'FERTILIZE',  'Applied NPK; watered after application'),
(3, 2, '2025-10-15', 'PEST',       'Observed mild aphids on some leaves');

-- 2.8 Expenses
INSERT INTO expenses (expense_date, item_name, quantity, total_cost, unit_price, season_id, user_id) VALUES
('2025-10-01', 'Tomato seedlings',      1200, 1200 * 1500.00, 1500.00, 2, 2),
('2025-10-05', 'Compost (bags)',          20,   20 * 45000.00,45000.00, 2, 2),
('2025-10-10', 'NPK fertilizer (kg)',     50,   50 * 650.00,    650.00, 2, 2),
('2025-10-12', 'Pest sticky traps',       10,   10 * 12000.00,12000.00, 2, 2),
('2025-10-18', 'Labor (day)',              3,    3 * 250000.00,250000.00,2, 2),
('2025-09-16', 'Tractor service',          1,    1 * 500000.00,500000.00,3, 2),
('2025-09-20', 'Rice seed (kg)',          60,   60 * 18000.00, 18000.00, 3, 2);

-- 2.9 Warehouses -> Stock Locations
INSERT INTO warehouses (name, type, farm_id, province_id, ward_id) VALUES
('Farm A - Input Warehouse',   'INPUT',   1, 24, 25112),
('Farm A - Produce Storage',   'PRODUCE', 1, 24, 25112),
('Farm B - Mixed Warehouse',   'MIXED',   2, 24, 25112);

-- warehouse_id will be 1..3
INSERT INTO stock_locations (aisle, bin, shelf, zone, warehouse_id) VALUES
('A1', 'B1', 'S1', 'Z1', 1),
('A1', 'B2', 'S1', 'Z1', 1),
('A2', 'B1', 'S1', 'Z1', 1),
('A1', 'B1', 'S1', 'Z1', 2),
('A1', 'B2', 'S1', 'Z1', 2);

-- 2.10 Suppliers -> Supply Items -> Supply Lots
INSERT INTO suppliers (contact_email, contact_phone, license_no, name) VALUES
('contact@agroplus.local', '0900111222', 'LIC-AG-001', 'AgroPlus Supplier'),
('sales@greenseed.local',  '0900222333', 'LIC-GS-002', 'GreenSeed Co.'),
('support@farmchem.local', '0900333444', 'LIC-FC-003', 'FarmChem Distribution');

INSERT INTO supply_items (active_ingredient, name, restricted_flag, unit) VALUES
(NULL,          'NPK Fertilizer', b'0', 'kg'),
(NULL,          'Compost',       b'0', 'bag'),
('Imidacloprid', 'Aphid Control', b'1', 'ml'),
(NULL,          'Sticky Traps',  b'0', 'pcs');

-- supply_item_id will be 1..4, supplier_id will be 1..3
INSERT INTO supply_lots (batch_code, expiry_date, status, supplier_id, supply_item_id) VALUES
('NPK-2025-01',  '2026-06-30', 'IN_STOCK', 1, 1),
('COMP-2025-01', '2026-12-31', 'IN_STOCK', 2, 2),
('APH-2025-01',  '2026-03-31', 'IN_STOCK', 3, 3),
('TRAP-2025-01', '2028-12-31', 'IN_STOCK', 2, 4);

-- 2.11 Stock Movements
-- supply_lot_id NOT NULL, warehouse_id NOT NULL
-- task_id is nullable because some movements are not tied to a task
INSERT INTO stock_movements (
  movement_date, movement_type, note, quantity,
  location_id, season_id, supply_lot_id, task_id, warehouse_id
) VALUES
('2025-10-05 09:00:00.000000', 'IN',  'Initial stock IN for NPK lot',        100.000,
 1, NULL, 1, NULL, 1),

('2025-10-05 09:10:00.000000', 'IN',  'Initial stock IN for pesticide lot',  500.000,
 2, NULL, 3, NULL, 1),

('2025-10-10 07:30:00.000000', 'OUT', 'Used NPK for fertilizing (Season 2)',   50.000,
 1, 2, 1, 3, 1),

('2025-10-15 07:00:00.000000', 'OUT', 'Used aphid control (Season 2)',        120.000,
 2, 2, 3, 4, 1),

('2025-10-16 17:00:00.000000', 'ADJUST', 'Audit correction (-2kg NPK)',       -2.000,
 1, NULL, 1, NULL, 1);

-- 2.12 Harvests
INSERT INTO harvests (harvest_date, note, quantity, unit, season_id) VALUES
('2025-12-05', 'Tomato - first harvest',  120.50, 18000.00, 2),
('2025-12-12', 'Tomato - second harvest', 150.00, 17500.00, 2);

-- 2.13 Incidents
INSERT INTO incidents
(deadline, description, incident_type, resolved_at, severity, status, reported_by, season_id)
VALUES
('2025-10-20',
 'Aphids increasing on tomato leaves; monitor daily and apply treatment if needed.',
 'PEST_OUTBREAK',
 NULL,
 'MEDIUM',
 'OPEN',
 2,
 2);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
