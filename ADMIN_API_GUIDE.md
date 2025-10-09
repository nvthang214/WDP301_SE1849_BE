# Hướng dẫn Setup và Test Admin API với JWT Authentication

## 1. Cài đặt Environment Variables

Tạo file `.env` trong thư mục gốc của project với nội dung:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your-super-secret-jwt-key-here
```

## 2. Cài đặt Dependencies

Chạy lệnh sau để cài đặt các dependencies cần thiết:

```bash
npm install jsonwebtoken
```

## 3. Khởi động Server

```bash
npm start
```

Server sẽ chạy trên port 3000 (hoặc port được cấu hình trong .env).

## 4. Chuẩn bị Dữ liệu Test

### Tạo Roles trong MongoDB:

1. Mở MongoDB Compass hoặc MongoDB Shell
2. Kết nối đến database của bạn
3. Tạo collection `roles` với dữ liệu:

```javascript
db.roles.insertMany([
  { _id: ObjectId(), name: "admin" },
  { _id: ObjectId(), name: "user" },
  { _id: ObjectId(), name: "recruiter" },
  { _id: ObjectId(), name: "guest" }
])
```

### Tạo Users trong MongoDB:

```javascript
// Tạo admin user
db.users.insertOne({
  role_id: ObjectId("role_admin_id"), // Thay bằng ID của role admin
  Email: "admin@example.com",
  Password: "admin123",
  Role: "admin",
  phone_number: "0123456789",
  IsActive: true,
  FullName: "Admin User"
})

// Tạo user thường
db.users.insertOne({
  role_id: ObjectId("role_user_id"), // Thay bằng ID của role user
  Email: "user@example.com",
  Password: "user123",
  Role: "user",
  phone_number: "0987654321",
  IsActive: true,
  FullName: "Normal User"
})
```

## 5. Test API với Postman

### Base URL: `http://localhost:3000/api`

### 5.1. Đăng nhập để lấy JWT Token

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Headers: 
  - `Content-Type: application/json`
- Body: 
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68e76f2c7af8a1b433e7bf53",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin",
      "roleId": "68e76e346cfbfc4391a64dd9",
      "phoneNumber": "0123456789",
      "isActive": true
    }
  }
}
```

**Lưu token này để sử dụng cho các request tiếp theo!**

### 5.2. Lấy danh sách tất cả Roles

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/admin/roles`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- Body: `None` (GET request không cần body)

### 5.3. Lấy danh sách tất cả Users

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/admin/users`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- Body: `None` (GET request không cần body)

### 5.4. Lấy thông tin User theo ID

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/admin/users/USER_ID`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- Body: `None` (GET request không cần body)

### 5.5. Ban/Unban User

**Request:**
- Method: `PUT`
- URL: `http://localhost:3000/api/admin/users/USER_ID/ban`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
  - `Content-Type: application/json`
- Body: 
```json
{
  "isActive": false
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "User has been banned successfully",
  "data": {
    "userId": "USER_ID",
    "email": "user@example.com",
    "fullName": "Normal User",
    "isActive": false
  }
}
```

### 5.6. Cập nhật Role của User

**Request:**
- Method: `PUT`
- URL: `http://localhost:3000/api/admin/users/USER_ID/role`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
  - `Content-Type: application/json`
- Body: 
```json
{
  "roleId": "NEW_ROLE_ID"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "userId": "USER_ID",
    "email": "user@example.com",
    "fullName": "Normal User",
    "roleId": "NEW_ROLE_ID",
    "roleName": "recruiter"
  }
}
```

### 5.7. Đăng ký User mới (Optional)

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers: 
  - `Content-Type: application/json`
- Body: 
```json
{
  "email": "newuser@example.com",
  "password": "newuser123",
  "fullName": "New User",
  "phoneNumber": "0123456789",
  "roleName": "user"
}
```

### 5.8. Verify Token

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/api/auth/verify`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- Body: `None`

## 6. Các Response Error thường gặp

### 6.1. Không có token
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 6.2. Token không hợp lệ
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 6.3. Token hết hạn
```json
{
  "success": false,
  "message": "Token expired"
}
```

### 6.4. Không có quyền admin
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

### 6.5. User không tồn tại
```json
{
  "success": false,
  "message": "User not found"
}
```

### 6.6. Role không tồn tại
```json
{
  "success": false,
  "message": "Role not found"
}
```

### 6.7. Đăng nhập sai
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## 7. Lưu ý quan trọng

1. **JWT Token**: Phải được lấy từ API login trước khi sử dụng các admin API
2. **Authorization Header**: Format phải là `Bearer YOUR_JWT_TOKEN`
3. **GET Requests**: Không cần body JSON, chỉ cần Authorization header
4. **PUT Requests**: Cần body JSON với dữ liệu cần cập nhật
5. **Token Expiry**: Token có thời hạn 24 giờ, cần login lại khi hết hạn
6. **Admin Role**: Chỉ user có role "admin" mới có thể truy cập admin API

## 8. Thứ tự test khuyến nghị

1. **Login** để lấy JWT token
2. **Get roles** để lấy danh sách roles và role IDs
3. **Get users** để lấy danh sách users và user IDs
4. **Ban user** với isActive: false
5. **Update role** của user
6. **Unban user** với isActive: true
7. **Verify token** để kiểm tra token còn hợp lệ

## 9. Cách sử dụng Token trong Postman

1. Sau khi login thành công, copy token từ response
2. Vào tab **Authorization** trong Postman
3. Chọn **Type**: Bearer Token
4. Paste token vào ô **Token**
5. Hoặc thêm header thủ công: `Authorization: Bearer YOUR_TOKEN`
