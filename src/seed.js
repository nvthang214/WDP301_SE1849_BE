import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

import Application from "./models/Application.js";
import Category from "./models/Category.js";
import Chatbot from "./models/Chatbot.js";
import Company from "./models/Company.js";
import Conversation from "./models/Conversation.js";
import Job from "./models/Job.js";
import JobAnalysis from "./models/JobAnalysis.js";
import JobFavorite from "./models/JobFavorite.js";
import JobSaved from "./models/JobSaved.js";
import Profile from "./models/Profile.js";
import Role from "./models/Role.js";
import Tag from "./models/Tag.js";
import UpgradeRequest from "./models/UpgradeRequest.js";
import User from "./models/User.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = "mongodb://127.0.0.1:27017/jobportal";
const PASSWORD_SAMPLE = "Password123!";
const SALT_ROUNDS = 10;

const COUNTS = {
  candidates: 25,
  recruiters: 20,
  admins: 5,
  tags: 20,
  categories: 20,
  jobs: 40,
  applications: 40,
  favorites: 30,
  savedJobs: 30,
  jobAnalyses: 30,
  upgradeRequests: 20,
  conversations: 20,
  chatbotPerConversation: 4,
};

const JOB_TYPES = [
  "FULL-TIME",
  "PART-TIME",
  "CONTRACT BASE",
  "TEMPORARY",
  "INTERNSHIP",
  "VOLUNTEER",
  "OTHER",
];

const JOB_LEVELS = ["Junior", "Mid", "Senior", "Lead"];
const APPLICATION_STATUSES = ["pending", "accepted", "rejected"];
const UPGRADE_STATUSES = ["pending", "approved", "rejected"];

const getRandomSubset = (items, min, max) => {
  const safeMin = Math.max(1, min);
  const safeMax = Math.max(safeMin, max);
  const count = faker.number.int({ min: safeMin, max: safeMax });
  return faker.helpers.arrayElements(items, count);
};

let exitCode = 0;

try {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await Promise.all([
    Application.deleteMany({}),
    Category.deleteMany({}),
    Chatbot.deleteMany({}),
    Company.deleteMany({}),
    Conversation.deleteMany({}),
    Job.deleteMany({}),
    JobAnalysis.deleteMany({}),
    JobFavorite.deleteMany({}),
    JobSaved.deleteMany({}),
    Profile.deleteMany({}),
    Role.deleteMany({}),
    Tag.deleteMany({}),
    UpgradeRequest.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log("🧹 Cleared old data");

  const roleDocs = await Role.insertMany([
    { name: "admin", description: "Full system access" },
    { name: "candidate", description: "Job seeker" },
    { name: "recruiter", description: "Company representative" },
  ]);
  const roleMap = roleDocs.reduce((acc, roleDoc) => {
    acc[roleDoc.name] = roleDoc._id;
    return acc;
  }, {});
  console.log("🧩 Seeded Roles:", roleDocs.length);

  const hashedPassword = await bcrypt.hash(PASSWORD_SAMPLE, SALT_ROUNDS);
  const emailSet = new Set();
  const usersPayload = [];

  const makeUserPayload = (roleKey) => {
    let email;
    do {
      email = faker.internet.email({ allowSpecialCharacters: false });
    } while (emailSet.has(email));
    emailSet.add(email);

    return {
      email,
      username: faker.internet.username(),
      password: hashedPassword,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: roleMap[roleKey],
      phoneNumber: faker.phone.number(),
      avatar: faker.image.avatar(),
      isEmailVerified: faker.datatype.boolean(),
    };
  };

  for (let i = 0; i < COUNTS.candidates; i += 1) {
    usersPayload.push(makeUserPayload("candidate"));
  }
  for (let i = 0; i < COUNTS.recruiters; i += 1) {
    usersPayload.push(makeUserPayload("recruiter"));
  }
  for (let i = 0; i < COUNTS.admins; i += 1) {
    usersPayload.push(makeUserPayload("admin"));
  }

  const userDocs = await User.insertMany(usersPayload, { ordered: false });
  console.log("👤 Created Users:", userDocs.length);

  const candidateUsers = userDocs.filter((doc) => doc.role?.equals(roleMap.candidate));
  const recruiterUsers = userDocs.filter((doc) => doc.role?.equals(roleMap.recruiter));
  const adminUsers = userDocs.filter((doc) => doc.role?.equals(roleMap.admin));

  if (candidateUsers.length < 15 || recruiterUsers.length < 15) {
    throw new Error("Not enough candidate or recruiter users were created.");
  }

  const tagNames = new Set();
  while (tagNames.size < COUNTS.tags) {
    tagNames.add(faker.hacker.noun());
  }
  const tagDocs = await Tag.insertMany(Array.from(tagNames).map((name) => ({ name })));
  console.log("🏷️ Created Tags:", tagDocs.length);

  const categoryDocs = await Category.insertMany(
    Array.from({ length: COUNTS.categories }, () => ({
      name: faker.commerce.department(),
      description: faker.lorem.sentence(),
    }))
  );
  console.log("📂 Created Categories:", categoryDocs.length);

  const companyDocs = await Company.insertMany(
    recruiterUsers.slice(0, Math.max(COUNTS.recruiters, 15)).map((recruiter) => ({
      recruiter: recruiter._id,
      name: faker.company.name(),
      logo: faker.image.url(),
      banner: faker.image.url(),
      description: faker.company.catchPhrase(),
      benefits: faker.lorem.sentence(),
      vision: faker.lorem.sentence(),
      social: {
        facebook: faker.internet.url(),
        linkedin: faker.internet.url(),
        twitter: faker.internet.url(),
        youtube: faker.internet.url(),
      },
      contact: {
        email: faker.internet.email(),
        phone: faker.phone.number(),
        website: faker.internet.url(),
      },
      foundedDate: faker.date.past({ years: 20 }),
      teamSize: faker.number.int({ min: 10, max: 200 }),
      address: faker.location.streetAddress(),
      industry: faker.company.buzzPhrase(),
    }))
  );
  console.log("🏢 Created Companies:", companyDocs.length);

  if (companyDocs.length < 15) {
    throw new Error("Not enough companies were created to satisfy the seeding requirement.");
  }

  const tagIds = tagDocs.map((tag) => tag._id);
  const categoryIds = categoryDocs.map((category) => category._id);

  const jobDocs = await Job.insertMany(
    Array.from({ length: COUNTS.jobs }, () => {
      const recruiter = faker.helpers.arrayElement(recruiterUsers);
      const company =
        faker.helpers.arrayElement(
          companyDocs.filter((company) => company.recruiter.equals(recruiter._id))
        ) ?? faker.helpers.arrayElement(companyDocs);
      return {
        company: company._id,
        recruiter: recruiter._id,
        category: faker.helpers.arrayElement(categoryIds),
        title: faker.person.jobTitle(),
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        tags: getRandomSubset(tagIds, 2, 5),
        role: faker.person.jobType(),
        minSalary: faker.number.int({ min: 500, max: 2000 }),
        maxSalary: faker.number.int({ min: 2001, max: 6000 }),
        salaryType: "USD/month",
        education: faker.person.jobArea(),
        experience: faker.person.jobType(),
        jobType: faker.helpers.arrayElement(JOB_TYPES),
        vacancies: faker.number.int({ min: 1, max: 8 }),
        expiration: faker.date.future({ years: 1 }),
        jobLevel: faker.helpers.arrayElement(JOB_LEVELS),
        country: faker.location.country(),
        city: faker.location.city(),
        remote: faker.datatype.boolean(),
        benefits: faker.lorem.sentences(1),
        requirements: faker.lorem.sentences({ min: 2, max: 4 }),
        desirable: faker.lorem.sentences(1),
        location: faker.location.streetAddress(),
      };
    })
  );
  console.log("💼 Created Jobs:", jobDocs.length);

  if (jobDocs.length < 15) {
    throw new Error("Not enough jobs were created to satisfy the seeding requirement.");
  }

  const jobIds = jobDocs.map((job) => job._id);

  const applicationDocs = await Application.insertMany(
    Array.from({ length: COUNTS.applications }, () => ({
      candidate: faker.helpers.arrayElement(candidateUsers)._id,
      job: faker.helpers.arrayElement(jobIds),
      resume: faker.internet.url(),
      coverLetter: faker.lorem.paragraphs({ min: 1, max: 2 }),
      status: faker.helpers.arrayElement(APPLICATION_STATUSES),
    }))
  );
  console.log("📋 Created Applications:", applicationDocs.length);

  const favoriteDocs = await JobFavorite.insertMany(
    Array.from({ length: COUNTS.favorites }, () => ({
      candidate: faker.helpers.arrayElement(candidateUsers)._id,
      job: faker.helpers.arrayElement(jobIds),
    }))
  );
  console.log("⭐ Created JobFavorites:", favoriteDocs.length);

  const savedDocs = await JobSaved.insertMany(
    Array.from({ length: COUNTS.savedJobs }, () => ({
      candidate_id: faker.helpers.arrayElement(candidateUsers)._id,
      job_id: faker.helpers.arrayElement(jobIds),
    }))
  );
  console.log("💾 Created JobSaved:", savedDocs.length);

  const analysisDocs = await JobAnalysis.insertMany(
    Array.from({ length: COUNTS.jobAnalyses }, () => ({
      candidate_id: faker.helpers.arrayElement(candidateUsers)._id,
      job_id: faker.helpers.arrayElement(jobIds),
      match_score: faker.number.int({ min: 50, max: 100 }),
      analysis_details: faker.lorem.paragraphs({ min: 1, max: 2 }),
    }))
  );
  console.log("🧠 Created JobAnalysis:", analysisDocs.length);

  const profileDocs = await Profile.insertMany(
    candidateUsers.map((candidate) => ({
      user: candidate._id,
      experience: faker.lorem.paragraphs({ min: 1, max: 2 }),
      education: faker.lorem.paragraphs({ min: 1, max: 2 }),
      bio: faker.lorem.sentence(),
      tags: getRandomSubset(tagIds, 2, 4),
      cv: faker.internet.url(),
      location: faker.location.city(),
      social: {
        linkedin: faker.internet.url(),
        twitter: faker.internet.url(),
        facebook: faker.internet.url(),
        instagram: faker.internet.url(),
      },
    }))
  );
  console.log("👤 Created Profiles:", profileDocs.length);

  const upgradeDocs = await UpgradeRequest.insertMany(
    candidateUsers.slice(0, Math.max(COUNTS.upgradeRequests, 15)).map((candidate) => ({
      user: candidate._id,
      companyInfo: {
        name: faker.company.name(),
        logo: faker.image.url(),
        banner: faker.image.url(),
        description: faker.company.catchPhrase(),
        benefits: faker.lorem.sentence(),
        vision: faker.lorem.sentence(),
        contact: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          website: faker.internet.url(),
        },
        industry: faker.commerce.department(),
        address: faker.location.streetAddress(),
      },
      businessLicense: faker.internet.url(),
      status: faker.helpers.arrayElement(UPGRADE_STATUSES),
      adminNote: faker.lorem.sentence(),
      reviewedBy: faker.helpers.arrayElement(adminUsers)?._id,
      reviewedAt: faker.date.recent({ days: 30 }),
    }))
  );
  console.log("🚀 Created UpgradeRequests:", upgradeDocs.length);

  const conversationDocs = await Conversation.insertMany(
    Array.from({ length: COUNTS.conversations }, () => ({
      user_id: faker.helpers.arrayElement(userDocs)._id,
      title: faker.company.catchPhrase(),
    }))
  );
  console.log("� Created Conversations:", conversationDocs.length);

  const chatbotDocs = await Chatbot.insertMany(
    conversationDocs.flatMap((conversation) =>
      Array.from({ length: COUNTS.chatbotPerConversation }, (_, index) => ({
        conversation_id: conversation._id,
        message: faker.lorem.sentence(),
        isAI: index % 2 === 1,
      }))
    )
  );
  console.log("🤖 Created Chatbot messages:", chatbotDocs.length);

  console.log("✅ Done seeding data!");
} catch (error) {
  exitCode = 1;
  console.error("❌ Seeding failed:", error);
} finally {
  await mongoose.disconnect();
  process.exit(exitCode);
}
