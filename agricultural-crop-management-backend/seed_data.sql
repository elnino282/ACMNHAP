-- =========================================================
-- ACM Platform - Seed Data (MySQL Compatible)
-- =========================================================
-- This file contains INSERT statements for tables that require
-- existing data from: provinces, roles, user_roles, users, wards
-- 
-- Usage: Run this file AFTER the base data (provinces, roles, users, wards) 
--        has been loaded into the database.
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =========================================================
-- 1. FARMS
-- =========================================================
-- Sample farms owned by users (assuming user_id=2 is a farmer)
-- Note: Ensure users with IDs 2, 3, 4 exist before running this
INSERT INTO farms (owner_id, farm_name, province_id, ward_id, area, active) VALUES
(2, 'Nông trại Hoa Lan', 24, 25112, 12.50, TRUE),
(2, 'Nông trại Bình An', 24, 25112, 8.20, TRUE),
(2, 'Nông trại Thái Hòa', 24, 25112, 15.00, FALSE);

-- =========================================================
-- 2. PLOTS
-- =========================================================
-- Plots within farms. Plot areas should not exceed farm area.
INSERT INTO plots (farm_id, plot_name, area, soil_type, status, province_id, ward_id, created_by) VALUES
(1, 'Lô A1 - Thửa trồng rau', 2.50, 'LOAM', 'IN_USE', 24, 25112, 2),
(1, 'Lô A2 - Thửa trồng lúa', 3.00, 'CLAY', 'IN_USE', 24, 25112, 2),
(1, 'Lô A3 - Dự trữ', 2.00, 'SANDY', 'AVAILABLE', 24, 25112, 2),
(2, 'Lô B1 - Cà chua', 1.80, 'SANDY', 'IN_USE', 24, 25112, 2),
(2, 'Lô B2 - Dưa chuột', 2.50, 'LOAM', 'IN_USE', 24, 25112, 2);

-- =========================================================
-- 3. CROPS
-- =========================================================
-- Master data for crop types
INSERT INTO crops (crop_name, description) VALUES
('Lúa', 'Cây lương thực chính'),
('Cà chua', 'Cây rau ăn quả'),
('Xoài', 'Cây ăn trái'),
('Dưa chuột', 'Cây rau ăn quả'),
('Rau muống', 'Rau ăn lá');

-- =========================================================
-- 4. VARIETIES
-- =========================================================
-- Crop varieties belong to crops
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
-- Growing seasons for crops on plots
-- Column order MUST match the entity fields exactly
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
-- Tasks assigned to users for managing seasons
-- Task dates should align with season dates
INSERT INTO tasks (
  title, description, planned_date, due_date,
  status, actual_start_date, actual_end_date,
  notes, season_id, user_id, created_at
) VALUES
-- Tasks for Season 1 (Tomato - Plot A1)
('Chuẩn bị luống & tưới tiêu', 'Chuẩn bị luống ươm, kiểm tra đường ống tưới.',
 '2025-10-01', '2025-10-02',
 'PENDING', NULL, NULL,
 NULL, 1, 2, NOW()),

('Cấy mạ cà chua', 'Di chuyển mạ vào Lô A1, khoảng cách 40cm.',
 '2025-10-02', '2025-10-03',
 'DONE', '2025-10-02', '2025-10-03',
 'Hoàn thành đúng hạn.', 1, 2, NOW()),

('Bón phân NPK', 'Bón phân NPK, sau 2h tưới nước.',
 '2025-10-10', '2025-10-10',
 'IN_PROGRESS', '2025-10-10', NULL,
 'Sử dụng lô NPK-2025-01', 1, 2, NOW()),

('Phun thuốc trừ sâu', 'Phun thuốc phòng trừ rệp.',
 '2025-10-15', '2025-10-16',
 'PENDING', NULL, NULL,
 NULL, 1, 2, NOW()),

-- Tasks for Season 2 (Rice - Plot A2)
('Ngâm mạ lúa', 'Ngâm hạt giống lúa ST25.',
 '2025-09-15', '2025-09-16',
 'DONE', '2025-09-15', '2025-09-15',
 'Hoàn thành', 2, 2, NOW()),

('Làm đất và cày bừa', 'Cày bừa lô đất chuẩn bị gieo sạ.',
 '2025-09-18', '2025-09-20',
 'DONE', '2025-09-18', '2025-09-19',
 'Đất đã được làm kỹ', 2, 2, NOW()),

('Gieo sạ', 'Gieo sạ lúa vào ruộng.',
 '2025-09-20', '2025-09-21',
 'IN_PROGRESS', '2025-09-20', NULL,
 NULL, 2, 2, NOW());

-- =========================================================
-- 7. FIELD LOGS
-- =========================================================
-- Activity logs for seasons
-- Log dates should be within season date range
INSERT INTO field_logs (season_id, log_date, log_type, notes) VALUES
(1, '2025-10-03', 'TRANSPLANT', 'Cấy mạ hoàn tất; cây con trông khỏe mạnh'),
(1, '2025-10-10', 'FERTILIZE', 'Bón NPK; tưới nước sau khi bón'),
(1, '2025-10-15', 'PEST', 'Phát hiện một ít rệp trên lá'),
(1, '2025-10-20', 'WATER', 'Tưới nước thường xuyên do thời tiết nóng'),
(2, '2025-09-16', 'SOW', 'Gieo sạ hoàn tất'),
(2, '2025-10-01', 'FERTILIZE', 'Bón phân lót'),
(3, '2025-12-05', 'HARVEST', 'Thu hoạch đợt 1'),
(3, '2025-12-12', 'HARVEST', 'Thu hoạch đợt 2 - kết thúc vụ');

-- =========================================================
-- 8. EXPENSES
-- =========================================================
-- Expenses tracked per season. total_cost = quantity * unit_price
-- Expense dates should align with season dates
INSERT INTO expenses (expense_date, item_name, quantity, unit_price, total_cost, season_id, user_id) VALUES
-- Expenses for Season 1 (Tomato Season - Plot A1)
('2025-10-01', 'Mạ cà chua', 1200, 1500.00, 1800000.00, 1, 2),
('2025-10-05', 'Phân compost (bao)', 20, 45000.00, 900000.00, 1, 2),
('2025-10-10', 'Phân NPK (kg)', 50, 650.00, 32500.00, 1, 2),
('2025-10-15', 'Thuốc trừ rệp (ml)', 500, 100.00, 50000.00, 1, 2),
('2025-10-20', 'Bẫy dính (cái)', 20, 5000.00, 100000.00, 1, 2),

-- Expenses for Season 2 (Rice Season - Plot A2)
('2025-09-20', 'Hạt giống lúa ST25 (kg)', 60, 18000.00, 1080000.00, 2, 2),
('2025-10-01', 'Phân lót (bao)', 10, 120000.00, 1200000.00, 2, 2),

-- Expenses for Season 3 (Completed tomato)
('2025-09-25', 'Mạ cà chua Beef', 1150, 1800.00, 2070000.00, 3, 2),
('2025-10-05', 'Phân hữu cơ', 25, 50000.00, 1250000.00, 3, 2);

-- =========================================================
-- 9. WAREHOUSES
-- =========================================================
-- Storage facilities belonging to farms
-- Types: INPUT (supplies), PRODUCE (harvests), MIXED (both)
INSERT INTO warehouses (name, type, farm_id, province_id, ward_id) VALUES
('Kho vật tư - Nông trại Hoa Lan', 'INPUT', 1, 24, 25112),
('Kho nông sản - Nông trại Hoa Lan', 'PRODUCE', 1, 24, 25112),
('Kho tổng hợp - Nông trại Bình An', 'MIXED', 2, 24, 25112);

-- =========================================================
-- 10. STOCK LOCATIONS
-- =========================================================
-- Physical locations within warehouses (zone-aisle-shelf-bin structure)
INSERT INTO stock_locations (zone, aisle, shelf, bin, warehouse_id) VALUES
('Z1', 'A1', 'S1', 'B1', 1),
('Z1', 'A1', 'S1', 'B2', 1),
('Z1', 'A2', 'S1', 'B1', 1),
('Z1', 'A1', 'S2', 'B1', 1),
('Z1', 'A1', 'S1', 'B1', 2),
('Z1', 'A1', 'S2', 'B1', 2),
('Z1', 'A1', 'S1', 'B1', 3);

-- =========================================================
-- 11. SUPPLIERS
-- =========================================================
-- Suppliers of agricultural inputs
INSERT INTO suppliers (name, contact_phone, contact_email, license_no) VALUES
('Công ty TNHH Vật tư Nông nghiệp AgroPlus', '0900111222', 'contact@agroplus.vn', 'LIC-AG-001'),
('Công ty CP Giống cây trồng GreenSeed', '0900222333', 'sales@greenseed.vn', 'LIC-GS-002'),
('Chi nhánh Phân bón Việt Nam', '0900333444', 'support@phanbon.vn', 'LIC-PB-003');

-- =========================================================
-- 12. SUPPLY ITEMS
-- =========================================================
-- Master data for supply items (fertilizers, pesticides, tools)
-- restricted_flag: 0 = FALSE (không kiểm soát), 1 = TRUE (kiểm soát đặc biệt)
INSERT INTO supply_items (name, unit, active_ingredient, restricted_flag) VALUES
('Phân NPK 16-16-8', 'kg', NULL, 0),
('Phân compost hữu cơ', 'bao', NULL, 0),
('Thuốc trừ rệp Imidacloprid 200SL', 'ml', 'Imidacloprid', 1),
('Bẫy dính sâu bệnh', 'cái', NULL, 0),
('Phân lân siêu lân', 'kg', NULL, 0),
('Thuốc trừ cỏ Glyphosate', 'lít', 'Glyphosate', 1);

-- =========================================================
-- 13. SUPPLY LOTS
-- =========================================================
-- Batches of supply items with batch codes and expiry dates
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
-- Inventory movements: IN (receiving), OUT (usage), ADJUST (corrections)
-- Quantity: positive for IN, negative for OUT/ADJUST
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
-- Harvest records for seasons
-- Harvest dates should be within season date range
-- quantity: kg, unit: giá bán/kg (VND)
INSERT INTO harvests (season_id, harvest_date, quantity, unit, note) VALUES
(1, '2025-12-05', 120.50, 18000.00, 'Cà chua - thu hoạch đợt 1, chất lượng tốt'),
(1, '2025-12-12', 150.00, 17500.00, 'Cà chua - thu hoạch đợt 2, giá giảm nhẹ'),
(3, '2025-12-05', 300.00, 16000.00, 'Cà chua Beef - thu hoạch lần 1'),
(3, '2025-12-15', 350.50, 15500.00, 'Cà chua Beef - thu hoạch lần 2'),
(3, '2025-12-22', 300.00, 15000.00, 'Cà chua Beef - thu hoạch cuối vụ');

-- =========================================================
-- 16. INCIDENTS
-- =========================================================
-- Tracks incidents (pests, diseases, weather issues) reported for seasons
-- Severity: LOW, MEDIUM, HIGH. Status: OPEN, IN_PROGRESS, RESOLVED, CANCELLED
INSERT INTO incidents (
  season_id, reported_by, incident_type, severity,
  status, description, deadline, resolved_at
) VALUES
(1, 2, 'PEST_OUTBREAK', 'MEDIUM',
 'OPEN', 'Phát hiện rệp tăng trên lá cà chua; theo dõi hàng ngày và xử lý nếu cần.',
 '2025-10-20', NULL),

(2, 2, 'DISEASE', 'LOW',
 'RESOLVED', 'Một số cây lúa có dấu hiệu bệnh lùn, đã xử lý bằng thuốc.',
 '2025-10-10', '2025-10-12 00:00:00'),

(1, 2, 'WEATHER', 'HIGH',
 'RESOLVED', 'Mưa to gây úng nước, đã thoát nước kịp thời.',
 '2025-11-05', '2025-11-06 00:00:00');

-- =========================================================
-- 17. DOCUMENTS
-- =========================================================
-- System documents and content management
INSERT INTO documents (title, content) VALUES
('Hướng dẫn quản lý nông trại', 'Hướng dẫn cơ bản về quản lý nông trại và cây trồng.'),
('Quy trình phòng trừ sâu bệnh', 'Quy trình chuẩn về phòng trừ và xử lý sâu bệnh hại.'),
('Lịch bón phân cây trồng', 'Lịch trình bón phân theo từng loại cây và giai đoạn sinh trưởng.'),
('An toàn vệ sinh thực phẩm', 'Các nguyên tắc về an toàn vệ sinh trong sản xuất nông nghiệp.');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;



