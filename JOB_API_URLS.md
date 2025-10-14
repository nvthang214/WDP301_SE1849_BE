# JOB API URLs - Danh sách đầy đủ các endpoints

## BASE URL: http://localhost:4000/api/jobs

## 1. GET ALL JOBS
**URL:** `GET /api/jobs`
**Description:** Lấy danh sách tất cả job với pagination và filters
**Query Parameters:**
- `search` (string): Tìm kiếm theo title, location, description
- `jobType` (string): Loại công việc (full-time, part-time, contract, internship)
- `experience` (string): Kinh nghiệm (entry, mid, senior, executive)
- `isActive` (boolean): Job đang active hay không
- `location` (string): Địa điểm làm việc
- `minSalary` (number): Lương tối thiểu
- `maxSalary` (number): Lương tối đa
- `page` (number): Trang hiện tại (mặc định: 1)
- `limit` (number): Số job per page (mặc định: 15)

**Example URLs:**
```
GET /api/jobs
GET /api/jobs?search=developer
GET /api/jobs?jobType=full-time&location=Hanoi
GET /api/jobs?minSalary=20000000&maxSalary=50000000
GET /api/jobs?page=2&limit=10
GET /api/jobs?search=react&jobType=full-time&experience=senior&isActive=true
```

## 2. CREATE NEW JOB
**URL:** `POST /api/jobs/post`
**Description:** Tạo job mới
**Headers:** `Content-Type: application/json`
**Body:** JSON object với job data

**Example URL:**
```
POST /api/jobs/post
```

## 3. GET JOB BY ID
**URL:** `GET /api/jobs/:id`
**Description:** Lấy thông tin chi tiết của một job
**Path Parameters:**
- `id` (string): Job ID

**Example URLs:**
```
GET /api/jobs/60f7b3b3b3b3b3b3b3b3b3b3
GET /api/jobs/507f1f77bcf86cd799439011
```

## 4. UPDATE JOB
**URL:** `PUT /api/jobs/edit/:id`
**Description:** Cập nhật thông tin job
**Path Parameters:**
- `id` (string): Job ID
**Headers:** `Content-Type: application/json`
**Body:** JSON object với fields cần update

**Example URLs:**
```
PUT /api/jobs/edit/60f7b3b3b3b3b3b3b3b3b3b3
PUT /api/jobs/edit/507f1f77bcf86cd799439011
```

## 5. DEACTIVATE JOB
**URL:** `PATCH /api/jobs/deactivate/:id`
**Description:** Vô hiệu hóa job (set isActive = false)
**Path Parameters:**
- `id` (string): Job ID

**Example URLs:**
```
PATCH /api/jobs/deactivate/60f7b3b3b3b3b3b3b3b3b3b3
PATCH /api/jobs/deactivate/507f1f77bcf86cd799439011
```

## 6. GET CANDIDATES FOR JOB
**URL:** `GET /api/jobs/:jobId/candidates`
**Description:** Lấy danh sách ứng viên đã apply cho job
**Path Parameters:**
- `jobId` (string): Job ID

**Example URLs:**
```
GET /api/jobs/60f7b3b3b3b3b3b3b3b3b3b3/candidates
GET /api/jobs/507f1f77bcf86cd799439011/candidates
```

## COMPLETE URL EXAMPLES:

### Development Environment:
```
http://localhost:4000/api/jobs
http://localhost:4000/api/jobs?search=developer&page=1&limit=10
http://localhost:4000/api/jobs/post
http://localhost:4000/api/jobs/60f7b3b3b3b3b3b3b3b3b3b3
http://localhost:4000/api/jobs/edit/60f7b3b3b3b3b3b3b3b3b3b3
http://localhost:4000/api/jobs/deactivate/60f7b3b3b3b3b3b3b3b3b3b3
http://localhost:4000/api/jobs/60f7b3b3b3b3b3b3b3b3b3b3/candidates
```

### Production Environment (thay đổi domain):
```
https://your-domain.com/api/jobs
https://your-domain.com/api/jobs?search=developer&page=1&limit=10
https://your-domain.com/api/jobs/post
https://your-domain.com/api/jobs/60f7b3b3b3b3b3b3b3b3b3b3
https://your-domain.com/api/jobs/edit/60f7b3b3b3b3b3b3b3b3b3b3
https://your-domain.com/api/jobs/deactivate/60f7b3b3b3b3b3b3b3b3b3b3
https://your-domain.com/api/jobs/60f7b3b3b3b3b3b3b3b3b3b3/candidates
```

## FRONTEND SERVICE URLs (cho React app):

### JobService URLs:
```javascript
// Trong src/services/JobService/urls.js
export const getAll = "/jobs";
export const getById = (id) => `/jobs/${id}`;
export const create = "/jobs/post";
export const update = (id) => `/jobs/edit/${id}`;
export const deactivate = (id) => `/jobs/deactivate/${id}`;
export const getCandidates = (jobId) => `/jobs/${jobId}/candidates`;
```

### Frontend Routes (React Router):
```javascript
// Trong src/router/ROUTER.js
const ROUTER = {
  JOBS: "/jobs",
  JOB_DETAILS: "/jobs/:id",
  JOB_POST: "/jobs/post",
  JOB_EDIT: "/jobs/edit/:id",
  JOB_DEACTIVATE: "/jobs/deactivate/:id"
};
```

## TESTING URLs với Postman:

### Collection Setup:
1. **Base URL:** `{{baseUrl}}/jobs`
2. **Environment Variables:**
   - `baseUrl`: `http://localhost:4000/api`
   - `jobId`: (sẽ được set từ response)

### Request URLs:
1. **Get All Jobs:** `{{baseUrl}}/jobs`
2. **Get Jobs with Filter:** `{{baseUrl}}/jobs?search={{searchTerm}}&jobType={{jobType}}`
3. **Create Job:** `{{baseUrl}}/jobs/post`
4. **Get Job by ID:** `{{baseUrl}}/jobs/{{jobId}}`
5. **Update Job:** `{{baseUrl}}/jobs/edit/{{jobId}}`
6. **Deactivate Job:** `{{baseUrl}}/jobs/deactivate/{{jobId}}`
7. **Get Candidates:** `{{baseUrl}}/jobs/{{jobId}}/candidates`

## QUICK TEST COMMANDS:

### PowerShell (Windows):
```powershell
# Get all jobs
Invoke-WebRequest -Uri "http://localhost:4000/api/jobs" -Method GET

# Get jobs with search
Invoke-WebRequest -Uri "http://localhost:4000/api/jobs?search=developer" -Method GET

# Create job
$body = @{
    title = "Test Job"
    description = "Test Description"
    location = "Hanoi"
    jobType = "full-time"
    experience = "mid"
    minSalary = 20000000
    maxSalary = 30000000
    isActive = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/jobs/post" -Method POST -ContentType "application/json" -Body $body
```

### cURL (Linux/Mac):
```bash
# Get all jobs
curl -X GET "http://localhost:4000/api/jobs"

# Get jobs with search
curl -X GET "http://localhost:4000/api/jobs?search=developer"

# Create job
curl -X POST "http://localhost:4000/api/jobs/post" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","description":"Test Description","location":"Hanoi","jobType":"full-time","experience":"mid","minSalary":20000000,"maxSalary":30000000,"isActive":true}'
```
