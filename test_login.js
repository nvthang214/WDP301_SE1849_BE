// Test Login Script - Chạy trong MongoDB Shell để kiểm tra users
// Chạy script này sau khi chạy mongodb_test_data_fixed.js

print("🔍 KIỂM TRA USERS TRONG DATABASE:");
print("");

// Kiểm tra tất cả users
const allUsers = db.users.find({}).toArray();
print("📋 DANH SÁCH TẤT CẢ USERS:");
allUsers.forEach((user, index) => {
  print(`${index + 1}. Email: ${user.Email}`);
  print(`   Password: ${user.Password}`);
  print(`   Role: ${user.Role}`);
  print(`   FullName: ${user.FullName}`);
  print(`   IsActive: ${user.IsActive}`);
  print(`   Role ID: ${user.role_id}`);
  print("");
});

print("🔍 KIỂM TRA ROLES:");
const allRoles = db.roles.find({}).toArray();
allRoles.forEach((role, index) => {
  print(`${index + 1}. Role ID: ${role._id}`);
  print(`   Role Name: ${role.name}`);
  print("");
});

print("✅ TEST LOGIN:");
print("Bây giờ bạn có thể đăng nhập với:");
print("- admin@test.com / admin123");
print("- user1@test.com / user123");
print("- recruiter1@fpt.com / recruiter123");
print("");
print("⚠️  LƯU Ý: Mật khẩu đã được lưu dạng plain text (không hash)");
print("   để phù hợp với auth controller hiện tại.");
