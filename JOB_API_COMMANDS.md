# JOB API COMMANDS - Test với Postman hoặc curl

## BASE URL: http://localhost:4000/api/jobs

## 1. GET ALL JOBS (Lấy danh sách tất cả job)
### URL: GET http://localhost:4000/api/jobs
### Query Parameters (tùy chọn):
- search: Tìm kiếm theo title, location, description
- jobType: Loại công việc (full-time, part-time, contract, etc.)
- experience: Kinh nghiệm (entry, mid, senior, etc.)
- isActive: true/false (job đang active hay không)
- location: Địa điểm
- minSalary: Lương tối thiểu
- maxSalary: Lương tối đa
- page: Trang (mặc định 1)
- limit: Số lượng job per page (mặc định 15)

### Example:
```
GET http://localhost:4000/api/jobs?search=developer&jobType=full-time&location=Hanoi&page=1&limit=10
```

## 2. CREATE NEW JOB (Tạo job mới)
### URL: POST http://localhost:4000/api/jobs/post
### Headers: Content-Type: application/json
### Body (JSON):
```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for a senior frontend developer...",
  "requirements": "React, JavaScript, TypeScript, 3+ years experience",
  "benefits": "Competitive salary, health insurance, flexible hours",
  "location": "Ho Chi Minh City",
  "jobType": "full-time",
  "experience": "senior",
  "minSalary": 20000000,
  "maxSalary": 35000000,
  "company": "COMPANY_ID_HERE",
  "recruiter": "RECRUITER_ID_HERE",
  "isActive": true,
  "applicationDeadline": "2024-12-31T23:59:59.000Z",
  "skills": ["React", "JavaScript", "TypeScript", "CSS"],
  "categories": ["IT", "Frontend"]
}
```

## 3. GET JOB BY ID (Lấy thông tin job theo ID)
### URL: GET http://localhost:4000/api/jobs/:id
### Example:
```
GET http://localhost:4000/api/jobs/60f7b3b3b3b3b3b3b3b3b3b3
```

## 4. UPDATE JOB (Cập nhật job)
### URL: PUT http://localhost:4000/api/jobs/edit/:id
### Headers: Content-Type: application/json
### Body (JSON) - chỉ gửi các field cần update:
```json
{
  "title": "Updated Job Title",
  "description": "Updated description...",
  "minSalary": 25000000,
  "maxSalary": 40000000,
  "isActive": false
}
```

## 5. DEACTIVATE JOB (Vô hiệu hóa job)
### URL: PATCH http://localhost:4000/api/jobs/deactivate/:id
### Example:
```
PATCH http://localhost:4000/api/jobs/deactivate/60f7b3b3b3b3b3b3b3b3b3b3
```

## 6. GET CANDIDATES FOR JOB (Lấy danh sách ứng viên cho job)
### URL: GET http://localhost:4000/api/jobs/:jobId/candidates
### Example:
```
GET http://localhost:4000/api/jobs/60f7b3b3b3b3b3b3b3b3b3b3/candidates
```

## POSTMAN COLLECTION SETUP:

### 1. Tạo Environment Variables:
- baseUrl: http://localhost:4000/api
- jobId: (sẽ được set sau khi tạo job)

### 2. Pre-request Scripts:
```javascript
// Set jobId từ response của create job
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("jobId", response.data._id);
}
```

### 3. Test Scripts:
```javascript
// Test cho GET all jobs
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has jobs array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.jobs).to.be.an('array');
});

// Test cho CREATE job
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Job created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.isOk).to.be.true;
});
```

## CURL COMMANDS:

### 1. Get all jobs:
```bash
curl -X GET "http://localhost:4000/api/jobs" \
  -H "Content-Type: application/json"
```

### 2. Get jobs with filters:
```bash
curl -X GET "http://localhost:4000/api/jobs?search=developer&jobType=full-time&location=Hanoi" \
  -H "Content-Type: application/json"
```

### 3. Create new job:
```bash
curl -X POST "http://localhost:4000/api/jobs/post" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Frontend Developer",
    "description": "We are looking for a senior frontend developer...",
    "requirements": "React, JavaScript, TypeScript, 3+ years experience",
    "benefits": "Competitive salary, health insurance, flexible hours",
    "location": "Ho Chi Minh City",
    "jobType": "full-time",
    "experience": "senior",
    "minSalary": 20000000,
    "maxSalary": 35000000,
    "isActive": true,
    "skills": ["React", "JavaScript", "TypeScript", "CSS"],
    "categories": ["IT", "Frontend"]
  }'
```

### 4. Get job by ID:
```bash
curl -X GET "http://localhost:4000/api/jobs/JOB_ID_HERE" \
  -H "Content-Type: application/json"
```

### 5. Update job:
```bash
curl -X PUT "http://localhost:4000/api/jobs/edit/JOB_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Job Title",
    "minSalary": 25000000,
    "maxSalary": 40000000
  }'
```

### 6. Deactivate job:
```bash
curl -X PATCH "http://localhost:4000/api/jobs/deactivate/JOB_ID_HERE" \
  -H "Content-Type: application/json"
```

### 7. Get candidates for job:
```bash
curl -X GET "http://localhost:4000/api/jobs/JOB_ID_HERE/candidates" \
  -H "Content-Type: application/json"
```

## RESPONSE FORMATS:

### Success Response:
```json
{
  "statusCode": 200,
  "msg": "Success message",
  "isOk": true,
  "isError": false,
  "data": {
    // Response data here
  }
}
```

### Error Response:
```json
{
  "statusCode": 400,
  "msg": "Error message",
  "isOk": false,
  "isError": true
}
```

## TESTING WORKFLOW:

1. **Create a job** → Lưu jobId từ response
2. **Get job by ID** → Verify job được tạo đúng
3. **Update job** → Modify một số fields
4. **Get all jobs** → Verify job xuất hiện trong list
5. **Get candidates** → Check candidates cho job
6. **Deactivate job** → Set isActive = false
7. **Get all jobs with isActive=false** → Verify job bị deactivate
