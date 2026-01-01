-- =========================================================
-- ACM Platform - Seed Data (MySQL Compatible)
-- =========================================================
-- Version: 3.0 - Updated 2026-01-02
-- 
-- This file contains INSERT statements for all tables.
-- Prerequisites: provinces, roles, users, wards tables must have base data.
-- 
-- Default Admin: admin / Admin@123
-- Default Farmer: farmer / Farmer@123 (user_id = 2)
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =========================================================
-- 1. FARMS
-- =========================================================
-- Farms owned by farmer user (user_id = 2)
-- Entity: owner_id, farm_name, province_id, ward_id, area, active
INSERT INTO farms (owner_id, farm_name, province_id, ward_id, area, active) VALUES
(2, 'Nông trại Hoa Lan', 24, 25112, 12.50, TRUE),
(2, 'Nông trại Bình An', 24, 25112, 8.20, TRUE),
(2, 'Nông trại Thái Hòa', 24, 25112, 15.00, FALSE);

-- =========================================================
-- 2. PLOTS
-- =========================================================
-- Entity: created_by, farm_id, plot_name, area, soil_type, status, province_id, ward_id, created_at, updated_at
INSERT INTO plots (farm_id, plot_name, area, soil_type, status, province_id, ward_id, created_by, created_at, updated_at) VALUES
(1, 'Lô A1 - Thửa trồng rau', 2.50, 'LOAM', 'IN_USE', 24, 25112, 2, NOW(), NOW()),
(1, 'Lô A2 - Thửa trồng lúa', 3.00, 'CLAY', 'IN_USE', 24, 25112, 2, NOW(), NOW()),
(1, 'Lô A3 - Dự trữ', 2.00, 'SANDY', 'AVAILABLE', 24, 25112, 2, NOW(), NOW()),
(2, 'Lô B1 - Cà chua', 1.80, 'SANDY', 'IN_USE', 24, 25112, 2, NOW(), NOW()),
(2, 'Lô B2 - Dưa chuột', 2.50, 'LOAM', 'IN_USE', 24, 25112, 2, NOW(), NOW());

-- =========================================================
-- 3. CROPS
-- =========================================================
-- Entity: crop_name, description
INSERT INTO crops (crop_name, description) VALUES
('Lúa', 'Cây lương thực chính'),
('Cà chua', 'Cây rau ăn quả'),
('Xoài', 'Cây ăn trái'),
('Dưa chuột', 'Cây rau ăn quả'),
('Rau muống', 'Rau ăn lá');

-- =========================================================
-- 4. VARIETIES
-- =========================================================
-- Entity: crop_id, name, description  (id is auto-generated)
INSERT INTO varieties (crop_id, name, description) VALUES
(1, 'ST25', 'Giống lúa thơm đặc sản'),
(1, 'OM 5451', 'Giống lúa năng suất cao'),
(2, 'Cà chua Cherry', 'Cà chua bi ngọt'),
(2, 'Cà chua Beef', 'Cà chua to múi'),
(3, 'Xoài Cát Chu', 'Xoài đặc sản miền Tây'),
(4, 'Dưa chuột lai F1', 'Dưa chuột năng suất cao'),
(5, 'Rau muống lá tre', 'Rau muống cải tiến');

-- =========================================================
-- 5. SEASONS
-- =========================================================
-- Entity: season_name, plot_id, crop_id, variety_id, start_date, planned_harvest_date, end_date,
--         status, initial_plant_count, current_plant_count, expected_yield_kg, actual_yield_kg, notes, created_at
-- Status: PLANNED, ACTIVE, COMPLETED, CANCELLED, ARCHIVED
INSERT INTO seasons (
  season_name, plot_id, crop_id, variety_id,
  start_date, planned_harvest_date, end_date,
  status, initial_plant_count, current_plant_count,
  expected_yield_kg, actual_yield_kg, notes, created_at
) VALUES
-- Season 1: Active tomato season on Plot A1
('Vụ Cà chua - Lô A1 (Đông Xuân 2025)', 1, 2, 3,
 '2025-10-01', '2025-12-20', NULL,
 'ACTIVE', 1200, 1180,
 850.00, NULL, 'Tập trung phòng trừ sâu bệnh và kiểm tra hàng tuần.', NOW()),

-- Season 2: Active rice season on Plot A2
('Vụ Lúa - Lô A2 (Thu Đông 2025)', 2, 1, 1,
 '2025-09-15', '2025-12-25', NULL,
 'ACTIVE', 0, NULL,
 2200.00, NULL, 'Duy trì lịch tưới tiêu; theo dõi cỏ dại.', NOW()),

-- Season 3: Completed tomato season on Plot B1
('Vụ Cà chua - Lô B1 (Hè Thu 2025)', 4, 2, 4,
 '2025-09-20', '2025-12-20', '2025-12-28',
 'COMPLETED', 1150, 1100,
 900.00, 950.50, 'Hoàn thành với năng suất tốt. Có ít sâu bệnh.', NOW()),

-- Season 4: Planned cucumber season
('Vụ Dưa chuột - Lô B2 (2026)', 5, 4, 6,
 '2026-01-10', '2026-03-20', NULL,
 'PLANNED', 800, NULL,
 600.00, NULL, 'Chuẩn bị giống và phân bón.', NOW());

-- =========================================================
-- 6. TASKS
-- =========================================================
-- Entity: user_id, season_id, title, description, planned_date, due_date, status,
--         actual_start_date, actual_end_date, notes, created_at
-- Status: PENDING, IN_PROGRESS, DONE, OVERDUE, CANCELLED
INSERT INTO tasks (
  user_id, season_id, title, description,
  planned_date, due_date, status,
  actual_start_date, actual_end_date, notes, created_at
) VALUES
-- Tasks for Season 1 (Tomato - Plot A1)
(2, 1, 'Chuẩn bị luống & tưới tiêu', 'Chuẩn bị luống ươm, kiểm tra đường ống tưới.',
 '2025-10-01', '2025-10-02', 'PENDING',
 NULL, NULL, NULL, NOW()),

(2, 1, 'Cấy mạ cà chua', 'Di chuyển mạ vào Lô A1, khoảng cách 40cm.',
 '2025-10-02', '2025-10-03', 'DONE',
 '2025-10-02', '2025-10-03', 'Hoàn thành đúng hạn.', NOW()),

(2, 1, 'Bón phân NPK', 'Bón phân NPK, sau 2h tưới nước.',
 '2025-10-10', '2025-10-10', 'IN_PROGRESS',
 '2025-10-10', NULL, 'Sử dụng lô NPK-2025-01', NOW()),

(2, 1, 'Phun thuốc trừ sâu', 'Phun thuốc phòng trừ rệp.',
 '2025-10-15', '2025-10-16', 'PENDING',
 NULL, NULL, NULL, NOW()),

-- Tasks for Season 2 (Rice - Plot A2)
(2, 2, 'Ngâm mạ lúa', 'Ngâm hạt giống lúa ST25.',
 '2025-09-15', '2025-09-16', 'DONE',
 '2025-09-15', '2025-09-15', 'Hoàn thành', NOW()),

(2, 2, 'Làm đất và cày bừa', 'Cày bừa lô đất chuẩn bị gieo sạ.',
 '2025-09-18', '2025-09-20', 'DONE',
 '2025-09-18', '2025-09-19', 'Đất đã được làm kỹ', NOW()),

(2, 2, 'Gieo sạ', 'Gieo sạ lúa vào ruộng.',
 '2025-09-20', '2025-09-21', 'IN_PROGRESS',
 '2025-09-20', NULL, NULL, NOW()),

-- Tasks for Season 3 (Completed tomato)
(2, 3, 'Thu hoạch đợt 1', 'Thu hoạch cà chua Beef đợt 1.',
 '2025-12-05', '2025-12-05', 'DONE',
 '2025-12-05', '2025-12-05', 'Thu hoạch 300kg, chất lượng tốt.', NOW()),

(2, 3, 'Thu hoạch đợt 2', 'Thu hoạch cà chua Beef đợt 2.',
 '2025-12-15', '2025-12-15', 'DONE',
 '2025-12-15', '2025-12-15', 'Thu hoạch 350.5kg.', NOW());

-- =========================================================
-- 7. FIELD LOGS
-- =========================================================
-- Entity: season_id, log_date, log_type, notes, created_at
INSERT INTO field_logs (season_id, log_date, log_type, notes, created_at) VALUES
(1, '2025-10-03', 'TRANSPLANT', 'Cấy mạ hoàn tất; cây con trông khỏe mạnh', NOW()),
(1, '2025-10-10', 'FERTILIZE', 'Bón NPK; tưới nước sau khi bón', NOW()),
(1, '2025-10-15', 'PEST', 'Phát hiện một ít rệp trên lá', NOW()),
(1, '2025-10-20', 'WATER', 'Tưới nước thường xuyên do thời tiết nóng', NOW()),
(2, '2025-09-16', 'SOW', 'Gieo sạ hoàn tất', NOW()),
(2, '2025-10-01', 'FERTILIZE', 'Bón phân lót', NOW()),
(3, '2025-12-05', 'HARVEST', 'Thu hoạch đợt 1', NOW()),
(3, '2025-12-12', 'HARVEST', 'Thu hoạch đợt 2 - kết thúc vụ', NOW());

-- =========================================================
-- 8. EXPENSES
-- =========================================================
-- Entity: user_id, season_id, item_name, unit_price, quantity, total_cost, expense_date, created_at
-- Note: Entity has unitPrice before quantity
INSERT INTO expenses (user_id, season_id, item_name, unit_price, quantity, total_cost, expense_date, created_at) VALUES
-- Expenses for Season 1 (Tomato Season - Plot A1)
(2, 1, 'Mạ cà chua', 1500.00, 1200, 1800000.00, '2025-10-01', NOW()),
(2, 1, 'Phân compost (bao)', 45000.00, 20, 900000.00, '2025-10-05', NOW()),
(2, 1, 'Phân NPK (kg)', 650.00, 50, 32500.00, '2025-10-10', NOW()),
(2, 1, 'Thuốc trừ rệp (ml)', 100.00, 500, 50000.00, '2025-10-15', NOW()),
(2, 1, 'Bẫy dính (cái)', 5000.00, 20, 100000.00, '2025-10-20', NOW()),

-- Expenses for Season 2 (Rice Season - Plot A2)
(2, 2, 'Hạt giống lúa ST25 (kg)', 18000.00, 60, 1080000.00, '2025-09-20', NOW()),
(2, 2, 'Phân lót (bao)', 120000.00, 10, 1200000.00, '2025-10-01', NOW()),

-- Expenses for Season 3 (Completed tomato)
(2, 3, 'Mạ cà chua Beef', 1800.00, 1150, 2070000.00, '2025-09-25', NOW()),
(2, 3, 'Phân hữu cơ', 50000.00, 25, 1250000.00, '2025-10-05', NOW()),
(2, 3, 'Thuốc trừ bệnh', 85000.00, 5, 425000.00, '2025-10-15', NOW()),
(2, 3, 'Nhân công thu hoạch', 200000.00, 10, 2000000.00, '2025-12-20', NOW());

-- =========================================================
-- 9. WAREHOUSES
-- =========================================================
-- Entity: farm_id, name, type, province_id, ward_id
-- Types: INPUT (supplies), PRODUCE (harvests), MIXED (both)
INSERT INTO warehouses (farm_id, name, type, province_id, ward_id) VALUES
(1, 'Kho vật tư - Nông trại Hoa Lan', 'INPUT', 24, 25112),
(1, 'Kho nông sản - Nông trại Hoa Lan', 'PRODUCE', 24, 25112),
(2, 'Kho tổng hợp - Nông trại Bình An', 'MIXED', 24, 25112);

-- =========================================================
-- 10. STOCK LOCATIONS
-- =========================================================
-- Entity: warehouse_id, zone, aisle, shelf, bin (warehouse_id first)
INSERT INTO stock_locations (warehouse_id, zone, aisle, shelf, bin) VALUES
(1, 'Z1', 'A1', 'S1', 'B1'),
(1, 'Z1', 'A1', 'S1', 'B2'),
(1, 'Z1', 'A2', 'S1', 'B1'),
(1, 'Z1', 'A1', 'S2', 'B1'),
(2, 'Z1', 'A1', 'S1', 'B1'),
(2, 'Z1', 'A1', 'S2', 'B1'),
(3, 'Z1', 'A1', 'S1', 'B1');

-- =========================================================
-- 11. SUPPLIERS
-- =========================================================
-- Entity: name, license_no, contact_email, contact_phone
INSERT INTO suppliers (name, license_no, contact_email, contact_phone) VALUES
('Công ty TNHH Vật tư Nông nghiệp AgroPlus', 'LIC-AG-001', 'contact@agroplus.vn', '0900111222'),
('Công ty CP Giống cây trồng GreenSeed', 'LIC-GS-002', 'sales@greenseed.vn', '0900222333'),
('Chi nhánh Phân bón Việt Nam', 'LIC-PB-003', 'support@phanbon.vn', '0900333444');

-- =========================================================
-- 12. SUPPLY ITEMS
-- =========================================================
-- Entity: name, category, active_ingredient, unit, restricted_flag, description
-- Category: FERTILIZER, PESTICIDE, SEED, TOOL, OTHER
INSERT INTO supply_items (name, category, active_ingredient, unit, restricted_flag, description) VALUES
('Phân NPK 16-16-8', 'FERTILIZER', NULL, 'kg', FALSE, 'Phân bón tổng hợp NPK tỷ lệ 16-16-8'),
('Phân compost hữu cơ', 'FERTILIZER', NULL, 'bao', FALSE, 'Phân compost từ nguyên liệu hữu cơ'),
('Thuốc trừ rệp Imidacloprid 200SL', 'PESTICIDE', 'Imidacloprid', 'ml', TRUE, 'Thuốc trừ rệp công nghiệp, cần giấy phép'),
('Bẫy dính sâu bệnh', 'TOOL', NULL, 'cái', FALSE, 'Bẫy dính côn trùng màu vàng'),
('Phân lân siêu lân', 'FERTILIZER', NULL, 'kg', FALSE, 'Phân lân siêu hấp thụ'),
('Thuốc trừ cỏ Glyphosate', 'PESTICIDE', 'Glyphosate', 'lít', TRUE, 'Thuốc diệt cỏ không chọn lọc, kiểm soát đặc biệt');

-- =========================================================
-- 13. SUPPLY LOTS
-- =========================================================
-- Entity: supply_item_id, supplier_id, batch_code, expiry_date, status
INSERT INTO supply_lots (supply_item_id, supplier_id, batch_code, expiry_date, status) VALUES
(1, 1, 'NPK-2025-01', '2026-06-30', 'IN_STOCK'),
(2, 2, 'COMP-2025-01', '2026-12-31', 'IN_STOCK'),
(3, 1, 'APH-2025-01', '2026-03-31', 'IN_STOCK'),
(4, 2, 'TRAP-2025-01', '2028-12-31', 'IN_STOCK'),
(5, 3, 'SLAN-2025-01', '2027-12-31', 'IN_STOCK'),
(6, 1, 'GLY-2025-01', '2026-09-30', 'IN_STOCK');

-- =========================================================
-- 14. STOCK MOVEMENTS
-- =========================================================
-- Entity: supply_lot_id, warehouse_id, location_id, movement_type, quantity, movement_date, season_id, task_id, note
-- Type: IN, OUT, ADJUST
INSERT INTO stock_movements (
  warehouse_id, location_id, supply_lot_id, movement_type,
  quantity, movement_date, note, season_id, task_id
) VALUES
-- Initial stock receipts into Warehouse 1
(1, 1, 1, 'IN',
 100.000, '2025-10-05 09:00:00', 'Nhập kho lô phân NPK đầu tiên', NULL, NULL),

(1, 2, 3, 'IN',
 500.000, '2025-10-05 09:10:00', 'Nhập kho thuốc trừ rệp', NULL, NULL),

(1, 3, 2, 'IN',
 50.000, '2025-10-06 10:00:00', 'Nhập kho phân compost', NULL, NULL),

(1, 4, 4, 'IN',
 200.000, '2025-10-07 08:00:00', 'Nhập bẫy dính', NULL, NULL),

-- Stock usage linked to Season 1 and Task 3
(1, 1, 1, 'OUT',
 50.000, '2025-10-10 07:30:00', 'Xuất phân NPK cho vụ cà chua (Lô A1)', 1, 3),

(1, 2, 3, 'OUT',
 500.000, '2025-10-15 08:00:00', 'Xuất thuốc trừ rệp cho Lô A1', 1, 4),

-- Stock for Season 2 (Rice)
(1, 1, 1, 'OUT',
 30.000, '2025-10-01 06:00:00', 'Xuất phân lót cho lúa', 2, 6),

-- Inventory adjustment
(1, 1, 1, 'ADJUST',
 -2.000, '2025-10-16 17:00:00', 'Điều chỉnh kiểm kê (-2kg NPK bị thất thoát)', NULL, NULL),

-- Produce storage movements
(2, 5, NULL, 'IN',
 120.500, '2025-12-05 14:00:00', 'Nhập kho cà chua thu hoạch đợt 1', 1, NULL),

(2, 5, NULL, 'IN',
 150.000, '2025-12-12 15:00:00', 'Nhập kho cà chua thu hoạch đợt 2', 1, NULL);

-- =========================================================
-- 15. HARVESTS
-- =========================================================
-- Entity: season_id, harvest_date, quantity, unit (price per kg), note, created_at
INSERT INTO harvests (season_id, harvest_date, quantity, unit, note, created_at) VALUES
(1, '2025-12-05', 120.50, 18000.00, 'Cà chua - thu hoạch đợt 1, chất lượng tốt', NOW()),
(1, '2025-12-12', 150.00, 17500.00, 'Cà chua - thu hoạch đợt 2, giá giảm nhẹ', NOW()),
(3, '2025-12-05', 300.00, 16000.00, 'Cà chua Beef - thu hoạch lần 1', NOW()),
(3, '2025-12-15', 350.50, 15500.00, 'Cà chua Beef - thu hoạch lần 2', NOW()),
(3, '2025-12-22', 300.00, 15000.00, 'Cà chua Beef - thu hoạch cuối vụ', NOW());

-- =========================================================
-- 16. INCIDENTS
-- =========================================================
-- Entity: season_id, reported_by, incident_type, severity, description, status, deadline, assignee_id, version,
--         resolved_at, resolved_by, resolution_note, cancellation_reason, created_at
-- Severity: LOW, MEDIUM, HIGH
-- Status: OPEN, IN_PROGRESS, RESOLVED, CANCELLED
INSERT INTO incidents (
  season_id, reported_by, incident_type, severity, status,
  description, deadline, assignee_id, version,
  resolved_at, resolved_by, resolution_note, cancellation_reason, created_at
) VALUES
(1, 2, 'PEST_OUTBREAK', 'MEDIUM', 'OPEN',
 'Phát hiện rệp tăng trên lá cà chua; theo dõi hàng ngày và xử lý nếu cần.',
 '2025-10-20', NULL, 0, NULL, NULL, NULL, NULL, NOW()),

(2, 2, 'DISEASE', 'LOW', 'RESOLVED',
 'Một số cây lúa có dấu hiệu bệnh lùn, đã xử lý bằng thuốc.',
 '2025-10-10', 2, 0, '2025-10-12 00:00:00', 2, 'Đã phun thuốc trị bệnh thành công.', NULL, NOW()),

(1, 2, 'WEATHER', 'HIGH', 'RESOLVED',
 'Mưa to gây úng nước, đã thoát nước kịp thời.',
 '2025-11-05', 2, 0, '2025-11-06 00:00:00', 2, 'Đã khơi thông mương thoát nước.', NULL, NOW()),

(3, 2, 'PEST_OUTBREAK', 'LOW', 'RESOLVED',
 'Phát hiện sâu xanh trên một số cây cà chua.',
 '2025-11-20', 2, 0, '2025-11-22 00:00:00', 2, 'Đã phun thuốc sinh học, sâu đã giảm.', NULL, NOW());

-- =========================================================
-- 17. DOCUMENTS
-- =========================================================
-- Entity: title, description, document_url, document_type, status, created_by, created_at, updated_at
-- Type: POLICY, GUIDE, MANUAL, LEGAL, OTHER
-- Status: ACTIVE, INACTIVE
INSERT INTO documents (
  title, description, document_url, document_type, status, created_by, created_at, updated_at
) VALUES
('Hướng dẫn quản lý nông trại',
 'Hướng dẫn cơ bản về quản lý nông trại và cây trồng.',
 'https://docs.google.com/document/d/example1',
 'GUIDE', 'ACTIVE', 1, NOW(), NOW()),

('Quy trình phòng trừ sâu bệnh',
 'Quy trình chuẩn về phòng trừ và xử lý sâu bệnh hại.',
 'https://docs.google.com/document/d/example2',
 'MANUAL', 'ACTIVE', 1, NOW(), NOW()),

('Lịch bón phân cây trồng',
 'Lịch trình bón phân theo từng loại cây và giai đoạn sinh trưởng.',
 'https://docs.google.com/document/d/example3',
 'GUIDE', 'ACTIVE', 1, NOW(), NOW()),

('Chính sách an toàn lao động',
 'Các quy định về an toàn lao động trong sản xuất nông nghiệp.',
 'https://docs.google.com/document/d/example4',
 'POLICY', 'ACTIVE', 1, NOW(), NOW()),

('Điều khoản sử dụng hệ thống',
 'Điều khoản pháp lý khi sử dụng hệ thống quản lý nông nghiệp.',
 'https://docs.google.com/document/d/example5',
 'LEGAL', 'ACTIVE', 1, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
