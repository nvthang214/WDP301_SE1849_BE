# Test Company API với Authentication

## 1. Login để lấy token
### URL: POST http://localhost:4000/api/auth/login
### Body:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### Response sẽ có:
```json
{
  "statusCode": 200,
  "msg": "Đăng nhập thành công",
  "isOk": true,
  "isError": false,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 2. Copy token từ response và dùng cho các API calls

## 3. Test Company Creation với token
### URL: POST http://localhost:4000/api/companies/create
### Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

### Body:
```json
{
  "name": "Test Company",
  "description": "Test company description",
  "industry": "Technology",
  "teamSize": 50,
  "address": "123 Test Street, Hanoi",
  "contact": {
    "email": "test@company.com",
    "phone": "0123456789",
    "website": "https://testcompany.com"
  },
  "social": {
    "facebook": "https://facebook.com/testcompany",
    "linkedin": "https://linkedin.com/company/testcompany"
  },
  "benefits": "Great benefits package",
  "vision": "Our company vision"
}
```

## PowerShell Commands để test:

### 1. Login và lấy token:
```powershell
$loginBody = @{
    username = "your_username"
    password = "your_password"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.data.token
Write-Host "Token: $token"
```

### 2. Tạo company với token:
```powershell
$companyBody = @{
    name = "Test Company"
    description = "Test company description"
    industry = "Technology"
    teamSize = 50
    address = "123 Test Street, Hanoi"
    contact = @{
        email = "test@company.com"
        phone = "0123456789"
        website = "https://testcompany.com"
    }
    social = @{
        facebook = "https://facebook.com/testcompany"
        linkedin = "https://linkedin.com/company/testcompany"
    }
    benefits = "Great benefits package"
    vision = "Our company vision"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$companyResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/companies/create" -Method POST -Headers $headers -Body $companyBody
$companyData = $companyResponse.Content | ConvertFrom-Json
Write-Host "Company created: $($companyData.data.name)"
```

## cURL Commands:

### 1. Login:
```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 2. Tạo company (thay YOUR_TOKEN bằng token từ login):
```bash
curl -X POST "http://localhost:4000/api/companies/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "description": "Test company description",
    "industry": "Technology",
    "teamSize": 50,
    "address": "123 Test Street, Hanoi",
    "contact": {
      "email": "test@company.com",
      "phone": "0123456789",
      "website": "https://testcompany.com"
    },
    "social": {
      "facebook": "https://facebook.com/testcompany",
      "linkedin": "https://linkedin.com/company/testcompany"
    },
    "benefits": "Great benefits package",
    "vision": "Our company vision"
  }'
```

## Debug Steps:

1. **Kiểm tra token có được lưu không:**
   - Mở Developer Console (F12)
   - Chạy: `localStorage.getItem("accessToken")`
   - Nếu null thì login chưa thành công

2. **Kiểm tra token có hợp lệ không:**
   - Copy token từ localStorage
   - Test với Postman hoặc curl
   - Nếu lỗi 401 thì token không hợp lệ hoặc đã hết hạn

3. **Kiểm tra backend logs:**
   - Xem console của backend server
   - Tìm lỗi authentication hoặc database

## Troubleshooting:

### Lỗi "Token không hợp lệ":
- Token đã hết hạn → Login lại
- Token không đúng format → Kiểm tra localStorage
- Backend không nhận diện token → Kiểm tra JWT_SECRET

### Lỗi "Path 'recruiter' is required":
- User chưa được authenticate → Kiểm tra token
- req.user không có _id → Kiểm tra auth middleware
- Company model yêu cầu recruiter → Đã sửa trong controller
