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

-- 1.0 Provinces
-- Vietnamese provinces and cities. Must be created before users, farms, plots, warehouses.
-- This table typically contains pre-loaded location data from Vietnam administrative divisions.
CREATE TABLE provinces (
  Id           INT PRIMARY KEY,
  Name         VARCHAR(128) NOT NULL,
  Slug         VARCHAR(128) NOT NULL,
  Type         VARCHAR(32) NOT NULL,
  NameWithType VARCHAR(256) NOT NULL
) ENGINE=InnoDB;

-- 1.0.1 Wards
-- Vietnamese wards/communes (xã/phường). Must be created before users, farms, plots, warehouses.
-- Each ward belongs to a province. This table typically contains pre-loaded location data.
CREATE TABLE wards (
  Id           INT PRIMARY KEY,
  Name         VARCHAR(255) NOT NULL,
  Slug         VARCHAR(255) NOT NULL,
  Type         VARCHAR(64) NOT NULL,
  NameWithType VARCHAR(512) NOT NULL,
  ProvinceId   INT NOT NULL,
  CONSTRAINT fk_wards_province FOREIGN KEY (ProvinceId) REFERENCES provinces(Id)
) ENGINE=InnoDB;

-- 1.1 Roles
-- System roles for access control. Users can have multiple roles (many-to-many).
CREATE TABLE roles (
  role_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_code   VARCHAR(50)  NOT NULL UNIQUE,
  role_name   VARCHAR(100) NOT NULL,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- 1.2 Users
-- System users including administrators and farmers.
-- Location fields (province_id, ward_id) are optional to allow flexible user registration.
CREATE TABLE users (
  user_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_name     VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  full_name     VARCHAR(200),
  password_hash VARCHAR(255) NOT NULL,
  status        VARCHAR(20)  NOT NULL,
  province_id   INT,
  ward_id       INT,
  KEY idx_users_province (province_id),
  KEY idx_users_ward (ward_id),
  KEY idx_users_status (status),
  CONSTRAINT fk_users_province FOREIGN KEY (province_id) REFERENCES provinces(Id),
  CONSTRAINT fk_users_ward FOREIGN KEY (ward_id) REFERENCES wards(Id)
) ENGINE=InnoDB;

-- 1.3 User Roles (many-to-many)
-- Junction table linking users to roles. Users can have multiple roles.
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

-- 1.4 Farms
-- Represents farms owned by users. Each farm can have multiple plots.
CREATE TABLE farms (
  farm_id     INT PRIMARY KEY AUTO_INCREMENT,
  owner_id    BIGINT      NOT NULL,
  farm_name   VARCHAR(255) NOT NULL,
  province_id INT         NOT NULL,
  ward_id     INT         NOT NULL,
  area        DECIMAL(10,2),
  active      TINYINT(1)  NOT NULL DEFAULT 1,
  KEY idx_farms_owner (owner_id),
  KEY idx_farms_province (province_id),
  KEY idx_farms_ward (ward_id),
  CONSTRAINT fk_farms_owner FOREIGN KEY (owner_id) REFERENCES users(user_id),
  CONSTRAINT fk_farms_province FOREIGN KEY (province_id) REFERENCES provinces(Id),
  CONSTRAINT fk_farms_ward FOREIGN KEY (ward_id) REFERENCES wards(Id)
) ENGINE=InnoDB;

-- 1.5 Plots
-- Represents individual plots within a farm where crops are grown.
-- Each plot belongs to a farm and tracks its location, soil type, and status.
CREATE TABLE plots (
  plot_id     INT PRIMARY KEY AUTO_INCREMENT,
  farm_id     INT          NOT NULL,
  plot_name   VARCHAR(255) NOT NULL,
  area        DECIMAL(10,2),
  soil_type   VARCHAR(50),
  status      VARCHAR(30) NOT NULL DEFAULT 'IN_USE',
  province_id INT          NOT NULL,
  ward_id     INT          NOT NULL,
  created_by  BIGINT       NOT NULL,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_plots_farm (farm_id),
  KEY idx_plots_creator (created_by),
  KEY idx_plots_status (status),
  CONSTRAINT fk_plots_farm   FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
  CONSTRAINT fk_plots_creator FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_plots_province FOREIGN KEY (province_id) REFERENCES provinces(Id),
  CONSTRAINT fk_plots_ward FOREIGN KEY (ward_id) REFERENCES wards(Id)
) ENGINE=InnoDB;

-- 1.6 Crops
-- Master data for crop types (e.g., Rice, Tomato, Mango).
CREATE TABLE crops (
  crop_id     INT PRIMARY KEY AUTO_INCREMENT,
  crop_name   VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

-- 1.7 Varieties
-- Crop varieties belong to crops. Multiple varieties can exist for the same crop.
CREATE TABLE varieties (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  crop_id     INT NOT NULL,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  CONSTRAINT fk_varieties_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
) ENGINE=InnoDB;

-- 1.8 Seasons
-- Represents a growing season for a crop on a specific plot.
-- Tracks planting dates, yields, and status throughout the season lifecycle.
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
  KEY idx_seasons_status (status),
  KEY idx_seasons_dates (start_date, end_date),
  CONSTRAINT fk_seasons_crop    FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
  CONSTRAINT fk_seasons_plot    FOREIGN KEY (plot_id) REFERENCES plots(plot_id),
  CONSTRAINT fk_seasons_variety FOREIGN KEY (variety_id) REFERENCES varieties(id)
) ENGINE=InnoDB;

-- 1.9 Tasks
-- Tasks assigned to users for managing seasons and farm operations.
-- Tasks can be linked to seasons and track completion status.
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
  KEY idx_tasks_status (status),
  KEY idx_tasks_due_date (due_date),
  CONSTRAINT fk_tasks_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_tasks_user   FOREIGN KEY (user_id)   REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 1.10 Field Logs
-- Activity logs for seasons (transplanting, fertilizing, pest observations, etc.).
-- Used to track day-to-day field operations and observations.
CREATE TABLE field_logs (
  field_log_id INT PRIMARY KEY AUTO_INCREMENT,
  season_id    INT  NOT NULL,
  log_date     DATE NOT NULL,
  log_type     VARCHAR(50) NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_field_logs_season (season_id),
  CONSTRAINT fk_field_logs_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB;

-- 1.11 Expenses
-- Expenses tracked per season. total_cost = quantity * unit_price.
-- Used for cost analysis and profitability calculations.
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
-- Storage facilities belonging to farms. Types: INPUT (supplies), PRODUCE (harvests), MIXED (both).
CREATE TABLE warehouses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  type        VARCHAR(20),
  farm_id     INT NOT NULL,
  province_id INT,
  ward_id     INT,
  KEY idx_wh_farm (farm_id),
  CONSTRAINT fk_warehouses_farm FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
  CONSTRAINT fk_warehouses_province FOREIGN KEY (province_id) REFERENCES provinces(Id),
  CONSTRAINT fk_warehouses_ward FOREIGN KEY (ward_id) REFERENCES wards(Id)
) ENGINE=InnoDB;

-- 1.13 Stock Locations
-- Physical locations within warehouses (zone-aisle-shelf-bin structure).
-- Used for precise inventory tracking and organization.
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
-- Suppliers of agricultural inputs (fertilizers, pesticides, seeds, etc.).
CREATE TABLE suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(30),
  license_no    VARCHAR(100),
  name          VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

-- 1.15 Supply Items
-- Master data for supply items (fertilizers, pesticides, tools, etc.).
-- restricted_flag indicates controlled substances requiring special handling.
CREATE TABLE supply_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  active_ingredient VARCHAR(150),
  name              VARCHAR(150) NOT NULL,
  restricted_flag   BIT(1),
  unit              VARCHAR(20)
) ENGINE=InnoDB;

-- 1.16 Supply Lots
-- Batches of supply items with batch codes and expiry dates for traceability.
-- Used for inventory tracking and quality control.
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
-- Inventory movements: IN (receiving), OUT (usage), ADJUST (corrections).
-- Tracks all inventory transactions with links to seasons and tasks for traceability.
CREATE TABLE stock_movements (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  movement_date DATETIME(6) NOT NULL,
  movement_type VARCHAR(10) NOT NULL,
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
  KEY idx_sm_type (movement_type),
  KEY idx_sm_date (movement_date),
  CONSTRAINT fk_sm_location FOREIGN KEY (location_id) REFERENCES stock_locations(id),
  CONSTRAINT fk_sm_season   FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_sm_lot      FOREIGN KEY (supply_lot_id) REFERENCES supply_lots(id),
  CONSTRAINT fk_sm_task     FOREIGN KEY (task_id) REFERENCES tasks(task_id),
  CONSTRAINT fk_sm_wh       FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
) ENGINE=InnoDB;

-- 1.18 Harvests
-- Harvest records for seasons. Tracks quantity harvested and unit price.
-- Used for yield analysis and revenue calculations.
CREATE TABLE harvests (
  harvest_id   INT AUTO_INCREMENT PRIMARY KEY,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  harvest_date DATE NOT NULL,
  note         VARCHAR(255),
  quantity     DECIMAL(38,2) NOT NULL,
  unit         DECIMAL(38,2) NOT NULL,
  season_id    INT,
  KEY idx_harvests_season (season_id),
  KEY idx_harvests_date (harvest_date),
  CONSTRAINT fk_harvests_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
) ENGINE=InnoDB;

-- 1.19 Incidents
-- Tracks incidents (pests, diseases, weather issues) reported for seasons.
-- Supports severity levels and resolution tracking.
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
  KEY idx_incidents_status (status),
  KEY idx_incidents_severity (severity),
  CONSTRAINT fk_incidents_season FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  CONSTRAINT fk_incidents_user   FOREIGN KEY (reported_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 1.20 Documents
-- System documents and content management.
CREATE TABLE documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  content     TEXT
) ENGINE=InnoDB;

-- 1.21 Invalidated Tokens
-- JWT tokens that have been invalidated (logout, token refresh).
-- Used for token blacklisting in authentication systems.
CREATE TABLE invalidated_tokens (
  id          VARCHAR(255) PRIMARY KEY,
  expiry_time DATETIME
) ENGINE=InnoDB;

-- =========================================================
-- 2) SEED DATA
-- =========================================================
-- Seed data for development and testing purposes.
-- All foreign key references are validated to ensure data integrity.

-- 2.1 Roles
-- System roles: ADMIN for administrators, FARMER for farm owners
INSERT INTO roles (role_id, role_code, role_name, description) VALUES
(1, 'ADMIN',  'Administrator', 'System administrator'),
(2, 'FARMER', 'Farmer',        'Farm owner / farmer');

-- 2.2 Users
-- Sample users for testing. Passwords are BCrypt hashed with strength 10.
-- Plain passwords for reference: admin123, 12345678
-- Note: province_id and ward_id are optional but provided here for complete test data.
-- Location references (24 = Ho Chi Minh City, 25112 = specific ward) should exist in provinces/wards tables.
INSERT INTO users (user_id, user_name, email, phone, full_name, password_hash, status, province_id, ward_id) VALUES
(1, 'admin', 'admin@acm.local', '0900000000', 'System Administrator', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ACTIVE', 24, 25112),
(2, 'farmer0', 'farmer1@acm.local', '0900000001', 'Nguyen Van T', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cit0qry6BvMS5Ctr.OC0sxaVDClgI', 'ACTIVE', 24, 25112),
(3, 'farmer2', 'farmer2@acm.local', '0900000002', 'Nguyen Van A', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cit0qry6BvMS5Ctr.OC0sxaVDClgI', 'ACTIVE', 24, 25112),
(4, 'farmer3', 'farmer3@acm.local', '0900000003', 'Tran Thi B',   '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cit0qry6BvMS5Ctr.OC0sxaVDClgI', 'ACTIVE', 24, 25112);

-- 2.2.1 User Roles Assignment
-- Assign roles to users (many-to-many relationship)
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),  -- admin -> ADMIN role
(2, 2),  -- farmer0 -> FARMER role
(3, 2),  -- farmer2 -> FARMER role
(4, 2);  -- farmer3 -> FARMER role

-- 2.3 Farms / Plots
-- Sample farms owned by farmer0 (user_id=2)
-- Farm A is active, Farm B is inactive
INSERT INTO farms (farm_id, owner_id, farm_name, province_id, ward_id, area, active) VALUES
(1, 2, 'Farm A', 24, 25112, 12.50, 1),
(2, 2, 'Farm B', 24, 25112,  8.20, 0);

-- Plots within farms. All plots have status 'IN_USE' by default.
-- Plot areas sum should not exceed farm area (for data consistency).
INSERT INTO plots (plot_id, farm_id, plot_name, area, soil_type, status, province_id, ward_id, created_by) VALUES
(1, 1, 'Plot A1', 2.50, 'LOAM',  'IN_USE', 24, 25112, 2),
(2, 1, 'Plot A2', 3.00, 'CLAY',  'IN_USE', 24, 25112, 2),
(3, 2, 'Plot B1', 1.80, 'SANDY', 'IN_USE', 24, 25112, 2);

-- 2.4 Crops / Varieties
-- Master data for crops and their varieties
INSERT INTO crops (crop_id, crop_name, description) VALUES
(1, 'Rice',   'Paddy crop'),
(2, 'Tomato', 'Vegetable crop'),
(3, 'Mango',  'Fruit crop');

-- Varieties belong to crops. Multiple varieties can exist for the same crop.
INSERT INTO varieties (id, crop_id, name, description) VALUES
(1, 1, 'ST25',          'Fragrant rice variety'),
(2, 2, 'Cherry Tomato', 'Small sweet tomato'),
(3, 2, 'Beef Tomato',   'Large tomato'),
(4, 3, 'Cat Chu',       'Popular mango variety');

-- 2.5 Seasons
-- Sample seasons showing different statuses: PLANNED, ACTIVE, COMPLETED
-- Date consistency: start_date <= planned_harvest_date, start_date <= end_date (for completed seasons)
INSERT INTO seasons (
  actual_yield_kg, created_at, current_plant_count, end_date,
  expected_yield_kg, initial_plant_count, notes, planned_harvest_date,
  season_name, start_date, status, crop_id, plot_id, variety_id
) VALUES
-- Season 1: Planned future season
(NULL, NOW(), NULL, NULL, 800.00, 1200, 'Planned tomato season. Prepare beds & irrigation.',
 '2026-03-10', 'Tomato Season - Plot A1 (2026)', '2026-01-05', 'PLANNED', 2, 1, 2),

-- Season 2: Active tomato season (referenced by tasks, expenses, etc.)
(NULL, NOW(), 1180, NULL, 850.00, 1200, 'Focus on pest prevention and weekly inspection.',
 '2025-12-20', 'Tomato Season - Plot A1 (2025)', '2025-10-01', 'ACTIVE', 2, 1, 2),

-- Season 3: Active rice season
(NULL, NOW(), NULL, NULL, 2200.00, 0, 'Maintain irrigation schedule; monitor weeds.',
 '2025-12-25', 'Rice Season - Plot A2 (2025)', '2025-09-15', 'ACTIVE', 1, 2, 1),

-- Season 4: Completed tomato season with actual yield
(950.50, NOW(), 1100, '2025-12-28', 900.00, 1150, 'Completed with good yield. Minor pest issues.',
 '2025-12-20', 'Tomato Season - Plot B1 (2025)', '2025-09-20', 'COMPLETED', 2, 3, 3);

-- 2.6 Tasks
-- Tasks for Season 2 (Tomato Season - Plot A1). Tasks show different statuses.
-- Task dates should align with season dates (within season start_date to end_date or planned_harvest_date).
INSERT INTO tasks (
  actual_end_date, actual_start_date, created_at,
  description, due_date, notes, planned_date,
  status, title, season_id, user_id
) VALUES
-- Task 1: Pending task
(NULL, NULL, NOW(), 'Prepare seedling beds, check irrigation lines.',
 '2025-10-02', NULL, '2025-10-01', 'PENDING', 'Prepare beds & irrigation', 2, 2),

-- Task 2: Completed task
('2025-10-03', '2025-10-02', NOW(), 'Move seedlings to Plot A1, spacing 40cm.',
 '2025-10-03', 'Completed on time.', '2025-10-02', 'DONE', 'Transplant seedlings', 2, 2),

-- Task 3: In progress task (referenced by stock_movements)
(NULL, '2025-10-10', NOW(), 'Apply NPK fertilizer, then water after 2 hours.',
 '2025-10-10', 'Use lot NPK-2025-01', '2025-10-10', 'IN_PROGRESS', 'Fertilize (NPK)', 2, 2),

-- Task 4: Pending task (referenced by stock_movements)
(NULL, NULL, NOW(), 'Inspect leaves and stems, record any pest signs.',
 '2025-10-15', 'Focus on aphids and whiteflies.', '2025-10-15', 'PENDING', 'Pest inspection', 2, 2);

-- 2.7 Field Logs
-- Field activity logs for Season 2. Log dates should be within season date range.
INSERT INTO field_logs (field_log_id, season_id, log_date, log_type, notes) VALUES
(1, 2, '2025-10-03', 'TRANSPLANT', 'Transplant completed; plants look healthy'),
(2, 2, '2025-10-10', 'FERTILIZE',  'Applied NPK; watered after application'),
(3, 2, '2025-10-15', 'PEST',       'Observed mild aphids on some leaves');

-- 2.8 Expenses
-- Expenses tracked for seasons. total_cost = quantity * unit_price.
-- Expense dates should align with season dates.
INSERT INTO expenses (expense_date, item_name, quantity, total_cost, unit_price, season_id, user_id) VALUES
-- Expenses for Season 2 (Tomato Season - Plot A1)
('2025-10-01', 'Tomato seedlings',      1200, 1800000.00, 1500.00, 2, 2),
('2025-10-05', 'Compost (bags)',          20,   900000.00, 45000.00, 2, 2),
('2025-10-10', 'NPK fertilizer (kg)',     50,    32500.00,   650.00, 2, 2),
('2025-10-12', 'Pest sticky traps',       10,   120000.00, 12000.00, 2, 2),
('2025-10-18', 'Labor (day)',              3,   750000.00, 250000.00, 2, 2),
-- Expenses for Season 3 (Rice Season - Plot A2)
('2025-09-16', 'Tractor service',          1,   500000.00, 500000.00, 3, 2),
('2025-09-20', 'Rice seed (kg)',          60,  1080000.00,  18000.00, 3, 2);

-- 2.9 Warehouses -> Stock Locations
-- Warehouses belong to farms. Types: INPUT (supplies), PRODUCE (harvests), MIXED (both).
INSERT INTO warehouses (name, type, farm_id, province_id, ward_id) VALUES
('Farm A - Input Warehouse',   'INPUT',   1, 24, 25112),
('Farm A - Produce Storage',   'PRODUCE', 1, 24, 25112),
('Farm B - Mixed Warehouse',   'MIXED',   2, 24, 25112);

-- Stock locations within warehouses (warehouse_id 1..3)
-- Locations use zone-aisle-shelf-bin structure for organization.
INSERT INTO stock_locations (aisle, bin, shelf, zone, warehouse_id) VALUES
('A1', 'B1', 'S1', 'Z1', 1),
('A1', 'B2', 'S1', 'Z1', 1),
('A2', 'B1', 'S1', 'Z1', 1),
('A1', 'B1', 'S1', 'Z1', 2),
('A1', 'B2', 'S1', 'Z1', 2);

-- 2.10 Suppliers -> Supply Items -> Supply Lots
-- Suppliers provide supply items. Each lot has batch tracking and expiry dates.
INSERT INTO suppliers (contact_email, contact_phone, license_no, name) VALUES
('contact@agroplus.local', '0900111222', 'LIC-AG-001', 'AgroPlus Supplier'),
('sales@greenseed.local',  '0900222333', 'LIC-GS-002', 'GreenSeed Co.'),
('support@farmchem.local', '0900333444', 'LIC-FC-003', 'FarmChem Distribution');

-- Supply items: fertilizers, pesticides, tools. restricted_flag indicates controlled substances.
INSERT INTO supply_items (active_ingredient, name, restricted_flag, unit) VALUES
(NULL,          'NPK Fertilizer', b'0', 'kg'),
(NULL,          'Compost',       b'0', 'bag'),
('Imidacloprid', 'Aphid Control', b'1', 'ml'),
(NULL,          'Sticky Traps',  b'0', 'pcs');

-- Supply lots with batch codes and expiry dates for traceability.
-- Lots are referenced by stock_movements for inventory tracking.
INSERT INTO supply_lots (batch_code, expiry_date, status, supplier_id, supply_item_id) VALUES
('NPK-2025-01',  '2026-06-30', 'IN_STOCK', 1, 1),
('COMP-2025-01', '2026-12-31', 'IN_STOCK', 2, 2),
('APH-2025-01',  '2026-03-31', 'IN_STOCK', 3, 3),
('TRAP-2025-01', '2028-12-31', 'IN_STOCK', 2, 4);

-- 2.11 Stock Movements
-- Inventory movements: IN (receiving), OUT (usage), ADJUST (corrections).
-- Movements can be linked to seasons and tasks for traceability.
-- Quantity: positive for IN, negative for OUT/ADJUST.
INSERT INTO stock_movements (
  movement_date, movement_type, note, quantity,
  location_id, season_id, supply_lot_id, task_id, warehouse_id
) VALUES
-- Initial stock receipts
('2025-10-05 09:00:00.000000', 'IN',  'Initial stock IN for NPK lot',        100.000,
 1, NULL, 1, NULL, 1),

('2025-10-05 09:10:00.000000', 'IN',  'Initial stock IN for pesticide lot',  500.000,
 2, NULL, 3, NULL, 1),

-- Stock usage linked to Season 2 and tasks
('2025-10-10 07:30:00.000000', 'OUT', 'Used NPK for fertilizing (Season 2)',   50.000,
 1, 2, 1, 3, 1),

('2025-10-15 07:00:00.000000', 'OUT', 'Used aphid control (Season 2)',        120.000,
 2, 2, 3, 4, 1),

-- Inventory adjustment (audit correction)
('2025-10-16 17:00:00.000000', 'ADJUST', 'Audit correction (-2kg NPK)',       -2.000,
 1, NULL, 1, NULL, 1);

-- 2.12 Harvests
-- Harvest records for Season 2. Harvest dates should be within season date range.
-- Quantity in kg, unit is price per kg (VND).
INSERT INTO harvests (harvest_date, note, quantity, unit, season_id) VALUES
('2025-12-05', 'Tomato - first harvest',  120.50, 18000.00, 2),
('2025-12-12', 'Tomato - second harvest', 150.00, 17500.00, 2);

-- 2.13 Incidents
-- Incident reported for Season 2. Tracks pest outbreaks, diseases, weather issues.
-- Severity: LOW, MEDIUM, HIGH. Status: OPEN, IN_PROGRESS, RESOLVED, CANCELLED.
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
