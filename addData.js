// Script để add data vào MongoDB
// Chạy: node addData.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import models
import User from './src/models/User.js';
import Role from './src/models/Role.js';
import Recruiter from './src/models/Recruiter.js';
import Company from './src/models/Company.js';
import Job from './src/models/Job.js';

dotenv.config();

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

// Bước 1: Tạo Roles
const createRoles = async () => {
  console.log('\n🔄 Bước 1: Tạo Roles...');
  
  const existingRoles = await Role.find();
  if (existingRoles.length > 0) {
    console.log('⚠️  Roles đã tồn tại, bỏ qua...');
    return existingRoles;
  }

  const roles = await Role.insertMany([
    { name: 'admin' },
    { name: 'user' },
    { name: 'recruiter' },
    { name: 'guest' }
  ]);
  
  console.log('✅ Đã tạo 4 roles:', roles.map(r => r.name).join(', '));
  return roles;
};

// Bước 2: Tạo Users
const createUsers = async (roles) => {
  console.log('\n🔄 Bước 2: Tạo Users...');
  
  const existingUsers = await User.find();
  if (existingUsers.length > 0) {
    console.log('⚠️  Users đã tồn tại, bỏ qua...');
    return existingUsers;
  }

  const users = await User.insertMany([
    {
      email: 'admin@jobpilot.com',
      username: 'admin',
      password: 'admin123456',
      firstName: 'Admin',
      lastName: 'User',
      role: roles.find(r => r.name === 'admin')._id,
      phoneNumber: '0123456789'
    },
    {
      email: 'recruiter@jobpilot.com',
      username: 'recruiter',
      password: 'recruiter123',
      firstName: 'John',
      lastName: 'Recruiter',
      role: roles.find(r => r.name === 'recruiter')._id,
      phoneNumber: '0987654321'
    },
    {
      email: 'user@jobpilot.com',
      username: 'user',
      password: 'user123456',
      firstName: 'Jane',
      lastName: 'User',
      role: roles.find(r => r.name === 'user')._id,
      phoneNumber: '0369258147'
    }
  ]);

  console.log('✅ Đã tạo 3 users:');
  console.log('   - Admin: admin@jobpilot.com / admin123456');
  console.log('   - Recruiter: recruiter@jobpilot.com / recruiter123');
  console.log('   - User: user@jobpilot.com / user123456');
  
  return users;
};

// Bước 3: Tạo Recruiter
const createRecruiter = async (users) => {
  console.log('\n🔄 Bước 3: Tạo Recruiter...');
  
  const existingRecruiter = await Recruiter.find();
  if (existingRecruiter.length > 0) {
    console.log('⚠️  Recruiter đã tồn tại, bỏ qua...');
    return existingRecruiter[0];
  }

  const recruiterUser = users.find(u => u.email === 'recruiter@jobpilot.com');
  const recruiter = await Recruiter.create({
    user_id: recruiterUser._id,
    position: 'Senior HR Manager'
  });

  console.log('✅ Đã tạo recruiter:', recruiter.position);
  return recruiter;
};

// Bước 4: Tạo Companies
const createCompanies = async (recruiter) => {
  console.log('\n🔄 Bước 4: Tạo Companies...');
  
  const existingCompanies = await Company.find();
  if (existingCompanies.length > 0) {
    console.log('⚠️  Companies đã tồn tại, bỏ qua...');
    return existingCompanies;
  }

  const companies = await Company.insertMany([
    {
      recruiter: recruiter._id,
      name: 'Công ty TNHH Công nghệ ABC',
      logo: 'https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=ABC',
      banner: 'https://via.placeholder.com/800x200/2196F3/FFFFFF?text=ABC+Technology',
      description: 'Chúng tôi là công ty công nghệ hàng đầu chuyên về phát triển phần mềm và giải pháp số hóa cho doanh nghiệp.',
      benefits: 'Bảo hiểm sức khỏe, nghỉ phép có lương, đào tạo kỹ năng, môi trường làm việc năng động',
      vision: 'Trở thành công ty công nghệ hàng đầu Việt Nam',
      social: {
        facebook: 'https://facebook.com/abctech',
        linkedin: 'https://linkedin.com/company/abctech',
        twitter: 'https://twitter.com/abctech',
        youtube: 'https://youtube.com/abctech'
      },
      contact: {
        email: 'contact@abctech.com',
        phone: '0123456789',
        website: 'https://abctech.com'
      },
      foundedDate: new Date('2020-01-15'),
      teamSize: 50,
      address: '123 Đường ABC, Quận 1, TP.HCM',
      industry: 'Công nghệ thông tin'
    },
    {
      recruiter: recruiter._id,
      name: 'Tập đoàn XYZ',
      logo: 'https://via.placeholder.com/150x150/FF9800/FFFFFF?text=XYZ',
      banner: 'https://via.placeholder.com/800x200/E91E63/FFFFFF?text=XYZ+Group',
      description: 'Tập đoàn đa ngành với các hoạt động chính trong lĩnh vực bất động sản, tài chính và du lịch.',
      benefits: 'Lương thưởng hấp dẫn, cơ hội thăng tiến, du lịch công ty',
      vision: 'Xây dựng một tập đoàn bền vững và phát triển',
      social: {
        facebook: 'https://facebook.com/xyzgroup',
        linkedin: 'https://linkedin.com/company/xyzgroup'
      },
      contact: {
        email: 'hr@xyzgroup.com',
        phone: '0987654321',
        website: 'https://xyzgroup.com'
      },
      foundedDate: new Date('2015-06-20'),
      teamSize: 200,
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      industry: 'Bất động sản'
    },
    {
      recruiter: recruiter._id,
      name: 'Startup DEF',
      logo: 'https://via.placeholder.com/150x150/9C27B0/FFFFFF?text=DEF',
      banner: 'https://via.placeholder.com/800x200/607D8B/FFFFFF?text=DEF+Startup',
      description: 'Startup fintech với sứ mệnh cách mạng hóa ngành tài chính tại Việt Nam.',
      benefits: 'Cổ phần công ty, môi trường startup năng động, học hỏi liên tục',
      vision: 'Democratize financial services for everyone',
      social: {
        facebook: 'https://facebook.com/defstartup',
        linkedin: 'https://linkedin.com/company/defstartup',
        twitter: 'https://twitter.com/defstartup'
      },
      contact: {
        email: 'hello@defstartup.com',
        phone: '0369258147',
        website: 'https://defstartup.com'
      },
      foundedDate: new Date('2022-03-10'),
      teamSize: 15,
      address: '789 Đường DEF, Quận 2, TP.HCM',
      industry: 'Fintech'
    }
  ]);

  console.log('✅ Đã tạo 3 companies:');
  companies.forEach((company, index) => {
    console.log(`   ${index + 1}. ${company.name} (${company.industry})`);
  });
  
  return companies;
};

// Bước 5: Tạo Jobs
const createJobs = async (companies, recruiter) => {
  console.log('\n🔄 Bước 5: Tạo Jobs...');
  
  const existingJobs = await Job.find();
  if (existingJobs.length > 0) {
    console.log('⚠️  Jobs đã tồn tại, bỏ qua...');
    return existingJobs;
  }

  const jobs = await Job.insertMany([
    {
      title: 'Senior Frontend Developer',
      description: 'Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với React, Vue.js và các framework hiện đại.',
      tags: 'React, Vue.js, JavaScript, TypeScript',
      role: 'Frontend Developer',
      minSalary: 15000000,
      maxSalary: 25000000,
      salaryType: 'VND',
      education: 'Đại học',
      experience: '3-5 năm',
      jobType: 'FULL-TIME',
      vacancies: 2,
      expiration: new Date('2024-12-31'),
      jobLevel: 'Senior',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      remote: true,
      benefits: ['Bảo hiểm sức khỏe', 'Nghỉ phép có lương', 'Đào tạo kỹ năng'],
      applyType: 'Jobpilot',
      company_id: companies[0]._id,
      recruiter_id: recruiter._id,
      requirements: 'Có kinh nghiệm 3-5 năm với React/Vue.js, hiểu biết về TypeScript, có kinh nghiệm với state management',
      desirable: 'Có kinh nghiệm với Next.js, GraphQL, có portfolio đẹp',
      location: 'Ho Chi Minh City, Vietnam',
      isActive: true
    },
    {
      title: 'Backend Developer (Node.js)',
      description: 'Tìm kiếm Backend Developer có kinh nghiệm với Node.js, Express, MongoDB để phát triển các ứng dụng web.',
      tags: 'Node.js, Express, MongoDB, JavaScript',
      role: 'Backend Developer',
      minSalary: 12000000,
      maxSalary: 20000000,
      salaryType: 'VND',
      education: 'Đại học',
      experience: '2-4 năm',
      jobType: 'FULL-TIME',
      vacancies: 3,
      expiration: new Date('2024-12-31'),
      jobLevel: 'Middle',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      remote: false,
      benefits: ['Bảo hiểm sức khỏe', 'Nghỉ phép có lương', 'Đào tạo kỹ năng'],
      applyType: 'Jobpilot',
      company_id: companies[0]._id,
      recruiter_id: recruiter._id,
      requirements: 'Có kinh nghiệm 2-4 năm với Node.js, Express, MongoDB, hiểu biết về RESTful API',
      desirable: 'Có kinh nghiệm với Docker, AWS, có kinh nghiệm với microservices',
      location: 'Ho Chi Minh City, Vietnam',
      isActive: true
    },
    {
      title: 'Real Estate Sales Manager',
      description: 'Tìm kiếm Sales Manager có kinh nghiệm trong lĩnh vực bất động sản để quản lý đội ngũ sales và phát triển thị trường.',
      tags: 'Sales, Real Estate, Management',
      role: 'Sales Manager',
      minSalary: 20000000,
      maxSalary: 35000000,
      salaryType: 'VND',
      education: 'Đại học',
      experience: '5-7 năm',
      jobType: 'FULL-TIME',
      vacancies: 1,
      expiration: new Date('2024-12-31'),
      jobLevel: 'Senior',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      remote: false,
      benefits: ['Lương thưởng hấp dẫn', 'Cơ hội thăng tiến', 'Du lịch công ty'],
      applyType: 'Jobpilot',
      company_id: companies[1]._id,
      recruiter_id: recruiter._id,
      requirements: 'Có kinh nghiệm 5-7 năm trong lĩnh vực bất động sản, có khả năng quản lý đội ngũ',
      desirable: 'Có mạng lưới khách hàng rộng, có chứng chỉ bất động sản',
      location: 'Ho Chi Minh City, Vietnam',
      isActive: true
    },
    {
      title: 'Fintech Product Manager',
      description: 'Tìm kiếm Product Manager có kinh nghiệm trong lĩnh vực fintech để phát triển và quản lý các sản phẩm tài chính.',
      tags: 'Product Management, Fintech, Finance',
      role: 'Product Manager',
      minSalary: 18000000,
      maxSalary: 30000000,
      salaryType: 'VND',
      education: 'Đại học',
      experience: '4-6 năm',
      jobType: 'FULL-TIME',
      vacancies: 1,
      expiration: new Date('2024-12-31'),
      jobLevel: 'Senior',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      remote: true,
      benefits: ['Cổ phần công ty', 'Môi trường startup năng động', 'Học hỏi liên tục'],
      applyType: 'Jobpilot',
      company_id: companies[2]._id,
      recruiter_id: recruiter._id,
      requirements: 'Có kinh nghiệm 4-6 năm trong lĩnh vực fintech, hiểu biết về các sản phẩm tài chính',
      desirable: 'Có kinh nghiệm với Agile/Scrum, có kinh nghiệm với payment systems',
      location: 'Ho Chi Minh City, Vietnam',
      isActive: true
    },
    {
      title: 'UI/UX Designer',
      description: 'Tìm kiếm UI/UX Designer có kinh nghiệm thiết kế giao diện người dùng cho các ứng dụng web và mobile.',
      tags: 'UI/UX, Design, Figma, Adobe',
      role: 'UI/UX Designer',
      minSalary: 10000000,
      maxSalary: 18000000,
      salaryType: 'VND',
      education: 'Đại học',
      experience: '2-4 năm',
      jobType: 'FULL-TIME',
      vacancies: 2,
      expiration: new Date('2024-12-31'),
      jobLevel: 'Middle',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      remote: true,
      benefits: ['Bảo hiểm sức khỏe', 'Nghỉ phép có lương', 'Đào tạo kỹ năng'],
      applyType: 'Jobpilot',
      company_id: companies[0]._id,
      recruiter_id: recruiter._id,
      requirements: 'Có kinh nghiệm 2-4 năm với UI/UX design, thành thạo Figma, Adobe Creative Suite',
      desirable: 'Có kinh nghiệm với prototyping, có portfolio đẹp',
      location: 'Ho Chi Minh City, Vietnam',
      isActive: true
    }
  ]);

  console.log('✅ Đã tạo 5 jobs:');
  jobs.forEach((job, index) => {
    console.log(`   ${index + 1}. ${job.title} (${job.jobLevel})`);
  });
  
  return jobs;
};

// Chạy tất cả các bước
const runAddData = async () => {
  try {
    console.log('🚀 Bắt đầu add data vào MongoDB...\n');
    
    await connectDB();
    
    const roles = await createRoles();
    const users = await createUsers(roles);
    const recruiter = await createRecruiter(users);
    const companies = await createCompanies(recruiter);
    const jobs = await createJobs(companies, recruiter);
    
    console.log('\n🎉 HOÀN THÀNH! Đã add data thành công:');
    console.log(`   - ${roles.length} roles`);
    console.log(`   - ${users.length} users`);
    console.log(`   - 1 recruiter`);
    console.log(`   - ${companies.length} companies`);
    console.log(`   - ${jobs.length} jobs`);
    
    console.log('\n🔑 Thông tin đăng nhập:');
    console.log('   Admin: admin@jobpilot.com / admin123456');
    console.log('   Recruiter: recruiter@jobpilot.com / recruiter123');
    console.log('   User: user@jobpilot.com / user123456');
    
  } catch (error) {
    console.error('❌ Lỗi khi add data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối MongoDB');
  }
};

// Chạy script
runAddData();

