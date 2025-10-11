// MongoDB Test Data Script - Fixed Version
// Chạy script này trong MongoDB Compass hoặc MongoDB Shell

// 1. XÓA TẤT CẢ DỮ LIỆU CŨ
db.users.deleteMany({});
db.roles.deleteMany({});
db.companies.deleteMany({});
db.recruiters.deleteMany({});
db.categories.deleteMany({});
db.jobs.deleteMany({});

print("✅ Đã xóa tất cả dữ liệu cũ");

// 2. THÊM ROLES VỚI OBJECTID THỰC
const adminRoleId = ObjectId();
const userRoleId = ObjectId();
const recruiterRoleId = ObjectId();
const guestRoleId = ObjectId();

const roles = [
  { _id: adminRoleId, name: "admin" },
  { _id: userRoleId, name: "user" },
  { _id: recruiterRoleId, name: "recruiter" },
  { _id: guestRoleId, name: "guest" }
];

db.roles.insertMany(roles);
print("✅ Đã thêm " + roles.length + " roles");

// 3. THÊM CATEGORIES
const categories = [
  { _id: ObjectId(), name: "Công nghệ thông tin", description: "Việc làm trong lĩnh vực IT" },
  { _id: ObjectId(), name: "Kinh doanh", description: "Việc làm trong lĩnh vực kinh doanh" },
  { _id: ObjectId(), name: "Marketing", description: "Việc làm trong lĩnh vực marketing" },
  { _id: ObjectId(), name: "Tài chính", description: "Việc làm trong lĩnh vực tài chính" },
  { _id: ObjectId(), name: "Nhân sự", description: "Việc làm trong lĩnh vực nhân sự" }
];

db.categories.insertMany(categories);
print("✅ Đã thêm " + categories.length + " categories");

// 4. THÊM COMPANIES
const companies = [
  { 
    _id: ObjectId(), 
    name: "FPT Software", 
    logo: "https://example.com/fpt-logo.png",
    description: "Công ty phần mềm hàng đầu Việt Nam",
    address: "Hà Nội, Việt Nam",
    industry: "Công nghệ thông tin"
  },
  { 
    _id: ObjectId(), 
    name: "Viettel Group", 
    logo: "https://example.com/viettel-logo.png",
    description: "Tập đoàn viễn thông lớn nhất Việt Nam",
    address: "Hà Nội, Việt Nam",
    industry: "Viễn thông"
  },
  { 
    _id: ObjectId(), 
    name: "VinGroup", 
    logo: "https://example.com/vingroup-logo.png",
    description: "Tập đoàn đa ngành hàng đầu Việt Nam",
    address: "Hà Nội, Việt Nam",
    industry: "Đa ngành"
  },
  { 
    _id: ObjectId(), 
    name: "Techcombank", 
    logo: "https://example.com/techcombank-logo.png",
    description: "Ngân hàng thương mại cổ phần",
    address: "TP. Hồ Chí Minh, Việt Nam",
    industry: "Ngân hàng"
  },
  { 
    _id: ObjectId(), 
    name: "Shopee Vietnam", 
    logo: "https://example.com/shopee-logo.png",
    description: "Nền tảng thương mại điện tử",
    address: "TP. Hồ Chí Minh, Việt Nam",
    industry: "Thương mại điện tử"
  }
];

db.companies.insertMany(companies);
print("✅ Đã thêm " + companies.length + " companies");

// 5. THÊM USERS VỚI MẬT KHẨU THẬT (KHÔNG HASH)
const users = [
  {
    _id: ObjectId(),
    role_id: adminRoleId, // Sử dụng ObjectId thực
    Email: "admin@test.com",
    Password: "admin123", // Mật khẩu thật
    Role: "admin",
    phone_number: "0123456789",
    IsActive: true,
    FullName: "Nguyễn Văn Admin",
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    role_id: userRoleId, // Sử dụng ObjectId thực
    Email: "user1@test.com",
    Password: "user123", // Mật khẩu thật
    Role: "user",
    phone_number: "0987654321",
    IsActive: true,
    FullName: "Trần Thị User",
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    role_id: userRoleId, // Sử dụng ObjectId thực
    Email: "user2@test.com",
    Password: "user123", // Mật khẩu thật
    Role: "user",
    phone_number: "0369852147",
    IsActive: true,
    FullName: "Lê Văn Candidate",
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    role_id: recruiterRoleId, // Sử dụng ObjectId thực
    Email: "recruiter1@fpt.com",
    Password: "recruiter123", // Mật khẩu thật
    Role: "recruiter",
    phone_number: "0123456780",
    IsActive: true,
    FullName: "Phạm Thị Recruiter",
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    role_id: recruiterRoleId, // Sử dụng ObjectId thực
    Email: "recruiter2@viettel.com",
    Password: "recruiter123", // Mật khẩu thật
    Role: "recruiter",
    phone_number: "0987654320",
    IsActive: true,
    FullName: "Hoàng Văn HR",
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    role_id: userRoleId, // Sử dụng ObjectId thực
    Email: "banned@test.com",
    Password: "banned123", // Mật khẩu thật
    Role: "user",
    phone_number: "0369852148",
    IsActive: false, // Bị ban
    FullName: "Nguyễn Văn Banned",
    createdAt: new Date()
  }
];

db.users.insertMany(users);
print("✅ Đã thêm " + users.length + " users");

// 6. THÊM RECRUITERS
const recruiters = [
  {
    _id: ObjectId(),
    user_id: users[3]._id, // recruiter1@fpt.com
    company_id: companies[0]._id, // FPT Software
    position: "Senior HR Manager"
  },
  {
    _id: ObjectId(),
    user_id: users[4]._id, // recruiter2@viettel.com
    company_id: companies[1]._id, // Viettel Group
    position: "HR Specialist"
  }
];

db.recruiters.insertMany(recruiters);
print("✅ Đã thêm " + recruiters.length + " recruiters");

// 7. THÊM JOBS
const jobs = [
  {
    _id: ObjectId(),
    company_id: companies[0]._id, // FPT Software
    recruiter_id: recruiters[0]._id,
    title: "Senior Full Stack Developer",
    description: "Phát triển ứng dụng web và mobile sử dụng React, Node.js",
    requirements: "3+ năm kinh nghiệm, thành thạo JavaScript, React, Node.js",
    benefits: "Lương cạnh tranh, bảo hiểm đầy đủ, môi trường làm việc năng động",
    salary_min: 20000000,
    salary_max: 35000000,
    location: "Hà Nội",
    job_type: "Full-time",
    experience_level: "Senior",
    isActive: true,
    category_id: categories[0]._id, // Công nghệ thông tin
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    company_id: companies[1]._id, // Viettel Group
    recruiter_id: recruiters[1]._id,
    title: "DevOps Engineer",
    description: "Quản lý hệ thống cloud và CI/CD pipeline",
    requirements: "2+ năm kinh nghiệm DevOps, AWS, Docker, Kubernetes",
    benefits: "Lương cao, thưởng theo dự án, đào tạo chuyên sâu",
    salary_min: 25000000,
    salary_max: 40000000,
    location: "TP. Hồ Chí Minh",
    job_type: "Full-time",
    experience_level: "Mid-level",
    isActive: true,
    category_id: categories[0]._id, // Công nghệ thông tin
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    company_id: companies[2]._id, // VinGroup
    title: "Marketing Manager",
    description: "Phát triển chiến lược marketing và quản lý team",
    requirements: "5+ năm kinh nghiệm marketing, leadership skills",
    benefits: "Lương hấp dẫn, cơ hội thăng tiến, môi trường quốc tế",
    salary_min: 30000000,
    salary_max: 50000000,
    location: "Hà Nội",
    job_type: "Full-time",
    experience_level: "Senior",
    isActive: true,
    category_id: categories[2]._id, // Marketing
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    company_id: companies[3]._id, // Techcombank
    title: "Financial Analyst",
    description: "Phân tích tài chính và đánh giá rủi ro",
    requirements: "CPA, CFA hoặc tương đương, 3+ năm kinh nghiệm",
    benefits: "Lương cạnh tranh, phụ cấp chứng chỉ, nghỉ phép đầy đủ",
    salary_min: 18000000,
    salary_max: 28000000,
    location: "TP. Hồ Chí Minh",
    job_type: "Full-time",
    experience_level: "Mid-level",
    isActive: false, // Job bị ẩn
    category_id: categories[3]._id, // Tài chính
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    company_id: companies[4]._id, // Shopee Vietnam
    title: "Product Manager",
    description: "Quản lý sản phẩm và phát triển tính năng mới",
    requirements: "MBA, 4+ năm kinh nghiệm product management",
    benefits: "Lương cao, stock options, môi trường startup",
    salary_min: 35000000,
    salary_max: 55000000,
    location: "TP. Hồ Chí Minh",
    job_type: "Full-time",
    experience_level: "Senior",
    isActive: true,
    category_id: categories[1]._id, // Kinh doanh
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    company_id: companies[0]._id, // FPT Software
    title: "Junior Frontend Developer",
    description: "Phát triển giao diện người dùng với React",
    requirements: "1+ năm kinh nghiệm, thành thạo HTML, CSS, JavaScript",
    benefits: "Đào tạo chuyên sâu, mentor hỗ trợ, cơ hội thăng tiến",
    salary_min: 12000000,
    salary_max: 18000000,
    location: "Đà Nẵng",
    job_type: "Full-time",
    experience_level: "Junior",
    isActive: true,
    category_id: categories[0]._id, // Công nghệ thông tin
    createdAt: new Date()
  }
];

db.jobs.insertMany(jobs);
print("✅ Đã thêm " + jobs.length + " jobs");

print("\n🎉 HOÀN THÀNH! Đã thêm dữ liệu test vào tất cả collections:");
print("- " + roles.length + " roles");
print("- " + categories.length + " categories");
print("- " + companies.length + " companies");
print("- " + users.length + " users");
print("- " + recruiters.length + " recruiters");
print("- " + jobs.length + " jobs");

print("\n📊 THỐNG KÊ:");
print("- Tổng users: " + users.length + " (Active: " + users.filter(u => u.IsActive).length + ", Banned: " + users.filter(u => !u.IsActive).length + ")");
print("- Tổng jobs: " + jobs.length + " (Active: " + jobs.filter(j => j.isActive).length + ", Hidden: " + jobs.filter(j => !j.isActive).length + ")");
print("- Admin users: " + users.filter(u => u.Role === "admin").length);
print("- Recruiter users: " + users.filter(u => u.Role === "recruiter").length);
print("- Regular users: " + users.filter(u => u.Role === "user").length);

print("\n🔑 THÔNG TIN ĐĂNG NHẬP:");
print("- Admin: admin@test.com / admin123");
print("- User: user1@test.com / user123");
print("- User 2: user2@test.com / user123");
print("- Recruiter: recruiter1@fpt.com / recruiter123");
print("- Recruiter 2: recruiter2@viettel.com / recruiter123");
print("- Banned User: banned@test.com / banned123 (bị ban)");
