# Hướng Dẫn Sử Dụng Weather Widget

## Tổng Quan

Weather Widget đã được tích hợp hoàn toàn với API thời tiết thực từ WeatherAPI.com, loại bỏ hoàn toàn dữ liệu mock.

## Cách Hoạt Động

### 1. Khởi Động Tự Động
- Widget tự động tải dữ liệu thời tiết cho "Vietnam" khi lần đầu mở
- Dữ liệu thật 100% từ WeatherAPI.com

### 2. Tìm Kiếm Địa Điểm

**Bước 1:** Click vào tên địa điểm (ví dụ: "Vietnam")

**Bước 2:** Gõ tên địa điểm bạn muốn tìm:
- "Ho Chi Minh" → Hiện gợi ý "Ho Chi Minh City, Vietnam"
- "Hanoi" → Hiện gợi ý "Hanoi, Vietnam"
- "Da Nang" → Hiện gợi ý "Da Nang, Vietnam"

**Bước 3:** Chọn địa điểm từ danh sách gợi ý
- Click vào gợi ý
- Hoặc dùng phím mũi tên ↑↓ và Enter

**Bước 4:** Thời tiết tự động cập nhật!

### 3. Các Phím Tắt

- **Enter**: Xác nhận địa điểm đang chọn
- **Escape**: Hủy bỏ tìm kiếm
- **↑↓**: Di chuyển trong danh sách gợi ý

### 4. Làm Mới Dữ Liệu

Click vào icon 🔄 ở góc phải trên để cập nhật dữ liệu thời tiết mới nhất.

## Dữ Liệu Hiển Thị

### Thời Tiết Hiện Tại
- **Nhiệt độ**: Nhiệt độ thực tế (°C)
- **Cảm giác như**: Nhiệt độ cảm nhận (°C)
- **Điều kiện**: Mô tả thời tiết (Sunny, Cloudy, Rainy, v.v.)
- **Cao/Thấp**: Nhiệt độ cao nhất và thấp nhất trong ngày
- **Lượng mưa**: Xác suất mưa (%)

### Dự Báo 3 Ngày
- Ngày mai + 2 ngày tiếp theo
- Nhiệt độ cao/thấp
- Xác suất mưa

### Thông Tin Chi Tiết
- **Độ ẩm**: % độ ẩm không khí
- **Tốc độ gió**: km/h và hướng gió (N, NE, E, SE, S, SW, W, NW)
- **Chỉ số UV**: Với cảnh báo mức độ (Low, Moderate, High, Very High)
- **Tầm nhìn xa**: km

### Thông Tin Bổ Sung
- **Áp suất**: milibar (mb)
- **Mặt trời mọc/lặn**: Giờ chính xác
- **Khoảng nhiệt độ**: Thấp nhất - Cao nhất trong ngày

### Cảnh Báo Nông Nghiệp

Widget tự động phát hiện và cảnh báo:

#### 🌡️ Cảnh Báo Nóng
- **Xuất hiện khi**: Nhiệt độ > 30°C
- **Mức độ Cao**: Nhiệt độ > 35°C
- **Khuyến nghị**: Tăng tưới tiêu cho cây nhạy cảm

#### ❄️ Cảnh Báo Sương Giá
- **Xuất hiện khi**: Nhiệt độ thấp < 5°C
- **Mức độ Cao**: Nhiệt độ < 0°C
- **Khuyến nghị**: Bảo vệ cây trồng nhạy cảm

#### 💨 Cảnh Báo Gió
- **Gió mạnh**: Tốc độ gió > 15 km/h (Không nên phun thuốc)
- **Gió lớn**: Tốc độ gió > 25 km/h (Cảnh báo cao)
- **Điều kiện tốt**: 5-15 km/h (Lý tưởng để phun thuốc)

#### 🌧️ Cảnh Báo Mưa
- **Xuất hiện khi**: Lượng mưa > 10mm
- **Mức độ Cao**: Lượng mưa > 50mm
- **Khuyến nghị**: Hoãn phun thuốc, kiểm tra thoát nước

### Điều Kiện Ruộng Đất

#### Điều Kiện Phun Thuốc
- **Excellent** (Xuất sắc): Gió nhẹ, độ ẩm và nhiệt độ lý tưởng
- **Fair** (Khá): Điều kiện chấp nhận được
- **Poor** (Kém): Gió quá mạnh hoặc nhiệt độ quá cao

**Điều kiện tối ưu cho phun thuốc:**
- Tốc độ gió: 5-15 km/h
- Độ ẩm: 50-70%
- Nhiệt độ: < 30°C

## Lưu Ý Kỹ Thuật

### API Key
- Đã được cấu hình: `7ad902a7acdf44d791675824251212`
- Endpoint: `https://api.weatherapi.com/v1/`

### Tần Suất Cập Nhật
- **Tìm kiếm**: Debounce 300ms (tránh gọi API quá nhiều)
- **Làm mới**: Theo yêu cầu người dùng
- **Tự động**: Khi thay đổi địa điểm

### Xử Lý Lỗi
- Mất kết nối mạng → Hiện thông báo lỗi
- Địa điểm không hợp lệ → Yêu cầu chọn lại
- Không có gợi ý → Thông báo "No results"

## Các Tính Năng Đã Loại Bỏ

### ❌ Soil Moisture (Độ Ẩm Đất)
- **Lý do**: Weather API không cung cấp dữ liệu độ ẩm đất
- **Giải pháp**: Nếu cần, có thể tích hợp:
  - Cảm biến IoT độ ẩm đất
  - API khác chuyên về dữ liệu nông nghiệp
  - Tính toán ước lượng dựa trên lượng mưa và bốc hơi

## Troubleshooting

### Widget không hiển thị dữ liệu?
1. Kiểm tra kết nối internet
2. Mở Console (F12) xem có lỗi API không
3. Thử làm mới (click icon 🔄)

### Autocomplete không hoạt động?
1. Chờ ít nhất 300ms sau khi gõ
2. Đảm bảo gõ ít nhất 2-3 ký tự
3. Kiểm tra tên địa điểm có chính xác không

### Dữ liệu không chính xác?
1. Kiểm tra địa điểm đã chọn đúng chưa
2. Làm mới để cập nhật dữ liệu mới nhất
3. Weather API cập nhật mỗi 15 phút

## Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log (F12) để xem lỗi chi tiết
2. Network tab để xem API response
3. Đảm bảo API key còn hoạt động

## Cập Nhật Trong Tương Lai

Các tính năng có thể thêm:
- [ ] Dự báo theo giờ (Hourly forecast)
- [ ] Lịch sử thời tiết
- [ ] Bản đồ radar thời tiết
- [ ] Thông báo đẩy cho cảnh báo nghiêm trọng
- [ ] Khuyến nghị theo từng loại cây trồng
- [ ] Tích hợp cảm biến IoT cho độ ẩm đất













