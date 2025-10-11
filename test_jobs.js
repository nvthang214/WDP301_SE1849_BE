// Test Jobs Script - Chạy trong MongoDB Shell để kiểm tra jobs
// Chạy script này sau khi chạy mongodb_test_data_fixed.js

print("🔍 KIỂM TRA JOBS TRONG DATABASE:");
print("");

// Kiểm tra tất cả jobs
const allJobs = db.jobs.find({}).toArray();
print(`📋 TỔNG SỐ JOBS: ${allJobs.length}`);
print("");

allJobs.forEach((job, index) => {
  print(`${index + 1}. Job ID: ${job._id}`);
  print(`   Title: ${job.title}`);
  print(`   Company ID: ${job.company_id}`);
  print(`   Recruiter ID: ${job.recruiter_id}`);
  print(`   Category ID: ${job.category_id}`);
  print(`   IsActive: ${job.isActive}`);
  print("");
});

print("🔍 KIỂM TRA COMPANIES:");
const allCompanies = db.companies.find({}).toArray();
print(`📋 TỔNG SỐ COMPANIES: ${allCompanies.length}`);
allCompanies.forEach((company, index) => {
  print(`${index + 1}. Company ID: ${company._id}`);
  print(`   Name: ${company.name}`);
  print("");
});

print("🔍 KIỂM TRA RECRUITERS:");
const allRecruiters = db.recruiters.find({}).toArray();
print(`📋 TỔNG SỐ RECRUITERS: ${allRecruiters.length}`);
allRecruiters.forEach((recruiter, index) => {
  print(`${index + 1}. Recruiter ID: ${recruiter._id}`);
  print(`   User ID: ${recruiter.user_id}`);
  print(`   Company ID: ${recruiter.company_id}`);
  print(`   Position: ${recruiter.position}`);
  print("");
});

print("🔍 KIỂM TRA CATEGORIES:");
const allCategories = db.categories.find({}).toArray();
print(`📋 TỔNG SỐ CATEGORIES: ${allCategories.length}`);
allCategories.forEach((category, index) => {
  print(`${index + 1}. Category ID: ${category._id}`);
  print(`   Name: ${category.name}`);
  print("");
});

print("✅ KIỂM TRA RELATIONSHIPS:");
print("Kiểm tra xem các ObjectId có khớp nhau không...");

// Kiểm tra job đầu tiên
if (allJobs.length > 0) {
  const firstJob = allJobs[0];
  print(`\n🔍 JOB ĐẦU TIÊN: ${firstJob.title}`);
  
  // Kiểm tra company
  const company = db.companies.findOne({_id: firstJob.company_id});
  if (company) {
    print(`✅ Company found: ${company.name}`);
  } else {
    print(`❌ Company not found for ID: ${firstJob.company_id}`);
  }
  
  // Kiểm tra recruiter
  const recruiter = db.recruiters.findOne({_id: firstJob.recruiter_id});
  if (recruiter) {
    print(`✅ Recruiter found: ${recruiter.position}`);
    // Kiểm tra user của recruiter
    const user = db.users.findOne({_id: recruiter.user_id});
    if (user) {
      print(`✅ Recruiter user found: ${user.FullName}`);
    } else {
      print(`❌ Recruiter user not found for ID: ${recruiter.user_id}`);
    }
  } else {
    print(`❌ Recruiter not found for ID: ${firstJob.recruiter_id}`);
  }
  
  // Kiểm tra category
  const category = db.categories.findOne({_id: firstJob.category_id});
  if (category) {
    print(`✅ Category found: ${category.name}`);
  } else {
    print(`❌ Category not found for ID: ${firstJob.category_id}`);
  }
}

print("\n⚠️  Nếu có lỗi ❌ ở trên, hãy chạy lại script mongodb_test_data_fixed.js");
