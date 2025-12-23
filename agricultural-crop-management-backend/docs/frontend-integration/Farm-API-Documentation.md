# 📋 TỔNG HỢP CHỨC NĂNG FARM - API DOCUMENTATION

> **Tài liệu thiết kế Frontend cho module Farm**  
> Ngày tạo: 14/12/2025

---

## 1. Quản lý Farm (Nông trại)

### 🔗 Base URL
```
/api/v1/farms
```

### 🔐 Yêu cầu xác thực
- **Role**: `FARMER`
- **Header**: `Authorization: Bearer <token>`

---

### 📌 Danh sách API

| STT | Chức năng | Method | Endpoint | Mô tả |
|-----|-----------|--------|----------|-------|
| 1 | Danh sách Farm | `GET` | `/api/v1/farms` | Lấy danh sách farm của farmer đăng nhập |
| 2 | Tạo Farm mới | `POST` | `/api/v1/farms` | Tạo nông trại mới |
| 3 | Chi tiết Farm | `GET` | `/api/v1/farms/{id}` | Xem chi tiết 1 farm |
| 4 | Cập nhật Farm | `PUT` | `/api/v1/farms/{id}` | Cập nhật thông tin farm |
| 5 | Xóa Farm | `DELETE` | `/api/v1/farms/{id}` | Soft delete (vô hiệu hóa) farm |

---

## 2. Chi tiết từng API

### 2.1 Lấy danh sách Farm

**Endpoint:** `GET /api/v1/farms`

**Query Parameters:**

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `keyword` | String | No | null | Tìm kiếm theo tên farm |
| `active` | Boolean | No | null | Lọc theo trạng thái (true/false) |
| `page` | int | No | 0 | Số trang (0-based) |
| `size` | int | No | 20 | Số item mỗi trang |

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "currentPage": 0,
    "totalPages": 5,
    "pageSize": 20,
    "totalElements": 100,
    "data": [
      {
        "id": 1,
        "name": "Nông trại A",
        "addressId": 123,
        "area": 100.5,
        "active": true
      },
      {
        "id": 2,
        "name": "Nông trại B",
        "addressId": 124,
        "area": 200.0,
        "active": true
      }
    ]
  }
}
```

---

### 2.2 Tạo Farm mới

**Endpoint:** `POST /api/v1/farms`

**Request Body:**
```json
{
  "name": "Nông trại mới",
  "addressId": 123,
  "area": 150.5
}
```

**Validation Rules:**

| Field | Rule | Message |
|-------|------|---------|
| `name` | Bắt buộc, max 255 ký tự | KEY_INVALID |
| `area` | Nếu có phải > 0 | INVALID_PLOT_AREA |

**Response Success (201):**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": 10,
    "name": "Nông trại mới",
    "addressId": 123,
    "area": 150.5,
    "active": true,
    "ownerUsername": "farmer01"
  }
}
```

**Response Error - Trùng tên (409):**
```json
{
  "code": 1009,
  "message": "Farm name already exists"
}
```

---

### 2.3 Xem chi tiết Farm

**Endpoint:** `GET /api/v1/farms/{id}`

**Path Parameters:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | Integer | ID của farm |

**Response Success (200):**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": 1,
    "name": "Nông trại A",
    "addressId": 123,
    "area": 100.5,
    "active": true,
    "ownerUsername": "farmer01"
  }
}
```

**Response Error - Không tìm thấy (404):**
```json
{
  "code": 1008,
  "message": "Farm not found"
}
```

---

### 2.4 Cập nhật Farm

**Endpoint:** `PUT /api/v1/farms/{id}`

**Path Parameters:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | Integer | ID của farm |

**Request Body:**
```json
{
  "name": "Nông trại A - Updated",
  "addressId": 125,
  "area": 180.0
}
```

**Response Success (200):**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": 1,
    "name": "Nông trại A - Updated",
    "addressId": 125,
    "area": 180.0,
    "active": true,
    "ownerUsername": "farmer01"
  }
}
```

---

### 2.5 Xóa Farm (Soft Delete)

**Endpoint:** `DELETE /api/v1/farms/{id}`

**Path Parameters:**

| Param | Type | Mô tả |
|-------|------|-------|
| `id` | Integer | ID của farm |

**Response Success (200):**
```json
{
  "code": 1000,
  "message": "Success",
  "result": null
}
```

**Response Error - Còn dữ liệu liên quan (400):**
```json
{
  "code": 1010,
  "message": "Farm has child records (plots or seasons)"
}
```

---

## 3. Quản lý Thành viên Farm (Farm Members)

### 🔗 Base URL
```
/api/v1/farms/{farmId}/members
```

### 🔐 Yêu cầu xác thực
- **Role**: `ADMIN` hoặc `FARMER`
- Chỉ owner của farm hoặc Admin mới được thêm/sửa/xóa thành viên

---

### 📌 Danh sách API

| STT | Chức năng | Method | Endpoint | Mô tả |
|-----|-----------|--------|----------|-------|
| 1 | Danh sách thành viên | `GET` | `/api/v1/farms/{farmId}/members` | Liệt kê thành viên của farm |
| 2 | Thêm thành viên | `POST` | `/api/v1/farms/{farmId}/members` | Thêm user vào farm |
| 3 | Cập nhật vai trò | `PUT` | `/api/v1/farms/{farmId}/members/{userId}` | Cập nhật role trong farm |
| 4 | Xóa thành viên | `DELETE` | `/api/v1/farms/{farmId}/members/{userId}` | Xóa thành viên khỏi farm |

---

## 4. Chi tiết API Farm Members

### 4.1 Lấy danh sách thành viên

**Endpoint:** `GET /api/v1/farms/{farmId}/members`

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": [
    {
      "farmId": 1,
      "userId": 123,
      "username": "worker01",
      "fullName": "Nguyễn Văn A",
      "roleInFarm": "WORKER",
      "joinedAt": "2025-01-15T10:30:00"
    },
    {
      "farmId": 1,
      "userId": 124,
      "username": "supervisor01",
      "fullName": "Trần Thị B",
      "roleInFarm": "SUPERVISOR",
      "joinedAt": "2025-02-20T08:00:00"
    }
  ]
}
```

---

### 4.2 Thêm thành viên

**Endpoint:** `POST /api/v1/farms/{farmId}/members`

**Request Body:**
```json
{
  "userId": 125,
  "roleInFarm": "WORKER"
}
```

**Response Success:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "farmId": 1,
    "userId": 125,
    "username": "newworker",
    "fullName": "Lê Văn C",
    "roleInFarm": "WORKER",
    "joinedAt": "2025-12-14T14:30:00"
  }
}
```

**Response Error - Đã là thành viên (409):**
```json
{
  "code": 1006,
  "message": "Duplicate resource"
}
```

---

### 4.3 Cập nhật vai trò thành viên

**Endpoint:** `PUT /api/v1/farms/{farmId}/members/{userId}`

**Request Body:**
```json
{
  "userId": 125,
  "roleInFarm": "SUPERVISOR"
}
```

**Response Success:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "farmId": 1,
    "userId": 125,
    "username": "newworker",
    "fullName": "Lê Văn C",
    "roleInFarm": "SUPERVISOR",
    "joinedAt": "2025-12-14T14:30:00"
  }
}
```

---

### 4.4 Xóa thành viên

**Endpoint:** `DELETE /api/v1/farms/{farmId}/members/{userId}`

**Response Success:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": null
}
```

---

## 5. Data Models

### 5.1 FarmResponse
```typescript
interface FarmResponse {
  id: number;
  name: string;
  addressId: number | null;
  area: number | null;
  active: boolean;
}
```

### 5.2 FarmDetailResponse
```typescript
interface FarmDetailResponse {
  id: number;
  name: string;
  addressId: number | null;
  area: number | null;
  active: boolean;
  ownerUsername: string;
}
```

### 5.3 FarmCreateRequest
```typescript
interface FarmCreateRequest {
  name: string;           // Required, max 255
  addressId?: number;     // Optional
  area?: number;          // Optional, must be > 0
}
```

### 5.4 FarmUpdateRequest
```typescript
interface FarmUpdateRequest {
  name: string;           // Required
  addressId?: number;     // Optional
  area?: number;          // Optional, must be > 0
}
```

### 5.5 FarmMemberRequest
```typescript
interface FarmMemberRequest {
  userId: number;         // Required
  roleInFarm?: string;    // Optional
}
```

### 5.6 FarmMemberResponse
```typescript
interface FarmMemberResponse {
  farmId: number;
  userId: number;
  username: string;
  fullName: string;
  roleInFarm: string | null;
  joinedAt: string;       // ISO DateTime format
}
```

### 5.7 PageResponse
```typescript
interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}
```

---

## 6. Database Schema

### 6.1 Table: `farms`
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `farm_id` | INT (PK, Auto) | No | ID farm |
| `owner_id` | BIGINT (FK) | No | ID chủ farm → users.user_id |
| `farm_name` | VARCHAR(255) | No | Tên farm |
| `address_id` | BIGINT (FK) | Yes | ID địa chỉ → addresses.id |
| `area` | DECIMAL | Yes | Diện tích (ha) |
| `active` | BOOLEAN | No | Trạng thái hoạt động |

### 6.2 Table: `farm_members`
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `farm_id` | INT (PK, FK) | No | ID farm → farms.farm_id |
| `user_id` | BIGINT (PK, FK) | No | ID user → users.user_id |
| `role_in_farm` | VARCHAR(50) | Yes | Vai trò trong farm |
| `joined_at` | DATETIME | Yes | Thời gian tham gia |

---

## 7. Business Rules

### 7.1 Farm
1. **Tên Farm**: 
   - Bắt buộc nhập
   - Tối đa 255 ký tự
   - Không được trùng với farm khác của cùng owner

2. **Diện tích**: 
   - Không bắt buộc
   - Nếu có phải lớn hơn 0

3. **Xóa Farm**:
   - Thực hiện soft delete (set `active = false`)
   - Không xóa được nếu farm còn **plots** hoặc **seasons** liên quan

### 7.2 Farm Members
1. **Quyền thêm/sửa/xóa thành viên**: Chỉ owner của farm hoặc Admin
2. **Không thêm trùng**: Một user chỉ có thể là thành viên 1 lần trong 1 farm
3. **Quyền xem danh sách**: Owner và Admin đều có thể xem

---

## 8. Error Codes

| Code | HTTP Status | Message | Mô tả |
|------|-------------|---------|-------|
| 1000 | 200 | Success | Thành công |
| 1006 | 409 | Duplicate resource | Tài nguyên đã tồn tại |
| 1008 | 404 | Farm not found | Không tìm thấy farm |
| 1009 | 409 | Farm name already exists | Tên farm đã tồn tại |
| 1010 | 400 | Farm has child records | Farm còn dữ liệu liên quan |
| 1003 | 401 | Unauthorized | Chưa đăng nhập |
| 1004 | 403 | Forbidden | Không có quyền truy cập |

---

## 9. Gợi ý UI Components

### 9.1 Trang danh sách Farm
- 🔍 Search box (tìm theo tên)
- 🎛️ Filter dropdown (Active / Inactive / All)
- 📊 Table với pagination
- ➕ Nút "Tạo Farm mới"
- 👁️ Nút xem chi tiết
- ✏️ Nút sửa
- 🗑️ Nút xóa

### 9.2 Form tạo/sửa Farm
- 📝 Input: Tên farm (required)
- 📍 Dropdown/Autocomplete: Chọn địa chỉ
- 📐 Input number: Diện tích (ha)
- ✅ Nút Lưu
- ❌ Nút Hủy

### 9.3 Trang chi tiết Farm
- 📋 Card hiển thị thông tin farm
- 👥 Tab/Section quản lý thành viên
- ✏️ Nút Edit
- 🗑️ Nút Delete

### 9.4 Quản lý thành viên
- 📊 Table danh sách thành viên
- ➕ Modal thêm thành viên (search user + chọn role)
- ✏️ Inline edit hoặc modal edit role
- 🗑️ Nút xóa thành viên với confirm dialog

---

## 10. Example API Calls (JavaScript/TypeScript)

### 10.1 Lấy danh sách Farm
```javascript
const response = await fetch('/api/v1/farms?keyword=&active=true&page=0&size=20', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### 10.2 Tạo Farm mới
```javascript
const response = await fetch('/api/v1/farms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Nông trại mới',
    addressId: 123,
    area: 150.5
  })
});
const data = await response.json();
```

### 10.3 Thêm thành viên vào Farm
```javascript
const farmId = 1;
const response = await fetch(`/api/v1/farms/${farmId}/members`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 125,
    roleInFarm: 'WORKER'
  })
});
const data = await response.json();
```

---

> **Ghi chú**: Tài liệu này được tạo tự động từ source code backend. Vui lòng liên hệ team backend nếu có thắc mắc.
