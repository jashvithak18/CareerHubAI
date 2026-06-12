const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../Model/User");
const Resume = require("../Model/Resume");
const Job = require("../Model/Job");
const Internship = require("../Model/Internship");
const Application = require("../Model/Application");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const adminuser = "admin";
const adminpass = "admin";

// Authenticate administrative user
router.post("/adminlogin", (req, res) => {
  const { username, password } = req.body;
  if (username === adminuser && password === adminpass) {
    const token = jwt.sign(
      { 
        uid: "admin", 
        email: "admin@internarea.com", 
        role: "admin" 
      },
      process.env.JWT_SECRET || "supersecret_admin_key_12345",
      { expiresIn: "7d" }
    );
    res.status(200).json({ success: true, token, role: "admin" });
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid credentials" });
  }
});

// Protected: Retrieve platform metrics for dashboard widgets
router.get("/stats", verifyToken, requireRole(["admin"]), async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalInternships = await Internship.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // Aggregation of user metrics
    const users = await User.find({}, "plan");
    let freeUsers = 0;
    let proUsers = 0;
    
    users.forEach(u => {
      if (u.plan === "pro") {
        proUsers++;
      } else {
        freeUsers++;
      }
    });

    res.status(200).json({
      totalResumes,
      totalJobs,
      totalInternships,
      totalApplications,
      freeUsers,
      proUsers,
      totalUsers: users.length
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/seed - Seed database with internships and jobs
router.get("/seed", async (req, res) => {
  try {
    // 1. Clear existing internships and jobs
    await Internship.deleteMany({});
    await Job.deleteMany({});

    // 2. Build and save internships
    const categories = [
      {
        name: "Big Brands",
        companies: ["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Spotify", "Goldman Sachs", "Uber", "FedEx", "Oracle", "Cisco", "McKinsey", "Disney", "Intel"],
        roles: ["Web Development Intern", "Marketing Intern", "Sales Intern", "UX Design Intern", "HR Intern", "Product Intern", "Data Analyst Intern", "Finance Intern", "Software Engineer Intern", "Operations Intern", "Cloud Architect Intern", "Security Analyst Intern", "Business Analyst Intern", "Content Creator Intern", "Systems Engineer Intern"],
        locations: ["Bangalore", "Hyderabad", "Chennai", "Noida", "Gurgaon", "Mumbai", "Bangalore", "Bangalore", "Hyderabad", "Delhi", "Pune", "Bangalore", "Delhi", "Mumbai", "Bangalore"],
        stipends: ["₹35,000/month", "₹40,000/month", "₹30,000/month", "₹35,000/month", "₹45,000/month", "₹50,000/month", "₹30,000/month", "₹60,000/month", "₹40,000/month", "₹20,000/month", "₹35,000/month", "₹30,000/month", "₹50,000/month", "₹25,000/month", "₹35,000/month"]
      },
      {
        name: "Work From Home",
        companies: ["Vercel", "Buffer", "GitLab", "Canva", "Zendesk", "VIPKid", "Kaggle", "Medium", "Moz", "Hopin", "Shopify", "Frame.io", "Wikipedia", "QuickBooks", "Cypress"],
        roles: ["Remote Full Stack Developer Intern", "Work from Home Social Media Specialist", "Virtual HR Assistant", "Remote Graphic Designer", "Remote Tech Support Representative", "Online ESL Tutor", "Work from Home Data Scientist", "Remote Content Writer", "Remote SEO Analyst", "Virtual Event Coordinator", "Remote Customer Success Agent", "Remote Video Editor", "Remote Web Researcher", "Work from Home Accountant", "Remote QA Engineer Intern"],
        locations: ["Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote", "Remote"],
        stipends: ["₹25,000/month", "₹18,000/month", "₹15,000/month", "₹20,000/month", "₹12,000/month", "₹10,000/month", "₹30,000/month", "₹15,000/month", "₹16,000/month", "₹14,000/month", "₹20,000/month", "₹18,000/month", "₹8,000/month", "₹15,000/month", "₹18,000/month"]
      },
      {
        name: "Part-time",
        companies: ["Local Startup", "TechBlog", "Cafe Delhi Heights", "InfoCorp", "CreativeStudio", "DeliveryCo", "CoworkSpace", "SurveyGroup", "MediaHouse", "CelebrationsCorp", "AdAgency", "GameStudio", "EducationHub", "RetailBrand", "LogisticsCo"],
        roles: ["Part-time Web Developer Intern", "Part-time Content Writer", "Part-time Social Media Executive", "Part-time Data Entry Operator", "Part-time Graphic Design Assistant", "Part-time Customer Support Specialist", "Part-time Community Manager", "Part-time Market Research Analyst", "Part-time Video Editing Assistant", "Part-time Event Assistant", "Part-time Copywriter", "Part-time QA Tester", "Part-time Tutor", "Part-time Sales Executive", "Part-time Operations Associate"],
        locations: ["Mumbai", "Noida", "Delhi", "Hyderabad", "Bangalore", "Pune", "Bangalore", "Delhi", "Mumbai", "Kolkata", "Mumbai", "Pune", "Bangalore", "Gurgaon", "Noida"],
        stipends: ["₹8,000/month", "₹6,000/month", "₹5,000/month", "₹4,000/month", "₹7,500/month", "₹5,500/month", "₹6,500/month", "₹5,000/month", "₹9,000/month", "₹6,000/month", "₹7,000/month", "₹8,000/month", "₹6,000/month", "₹5,000/month", "₹6,000/month"]
      },
      {
        name: "MBA",
        companies: ["StartupX", "Unilever", "JPMorgan Chase", "BCG", "Amazon", "PepsiCo", "PwC", "Nielsen", "Flipkart", "Reliance", "Coca-Cola", "Morgan Stanley", "EY", "VCFund", "Tata"],
        roles: ["Business Development Intern", "Brand Management Intern", "Financial Analyst Intern", "Strategy Intern", "Supply Chain Intern", "HR Generalist Intern", "Corporate Finance Intern", "Market Research Intern", "Product Management Intern", "Operations Strategy Intern", "Sales & Marketing Intern", "Investment Banking Intern", "Consulting Intern", "Entrepreneurship Intern", "Project Management Intern"],
        locations: ["Gurgaon", "Mumbai", "Mumbai", "Delhi", "Bangalore", "Gurugram", "Kolkata", "Delhi", "Bangalore", "Mumbai", "Pune", "Mumbai", "Bangalore", "Mumbai", "Pune"],
        stipends: ["₹15,000/month", "₹30,000/month", "₹40,000/month", "₹50,000/month", "₹25,000/month", "₹25,000/month", "₹20,000/month", "₹18,000/month", "₹30,000/month", "₹20,000/month", "₹22,000/month", "₹45,000/month", "₹25,000/month", "₹30,000/month", "₹20,000/month"]
      },
      {
        name: "Engineering",
        companies: ["L&T", "Tata Motors", "Siemens", "Zoho", "ISRO", "Reliance Industries", "Philips Healthcare", "BotCorp", "SmartHome", "Nvidia", "Bosch", "GreenTech", "Jio", "BrowserStack", "Qualcomm"],
        roles: ["Civil Engineering Intern", "Mechanical Engineering Intern", "Electrical Engineering Intern", "Software Engineering Intern", "Aerospace Engineering Intern", "Chemical Engineering Intern", "Biomedical Engineering Intern", "Robotics Engineering Intern", "IoT Solutions Intern", "Hardware Design Intern", "Embedded Systems Intern", "Environmental Engineering Intern", "Network Engineering Intern", "QA Automation Intern", "VLSI Design Intern"],
        locations: ["Mumbai", "Pune", "Bangalore", "Chennai", "Bangalore", "Jamnagar", "Bangalore", "Hyderabad", "Pune", "Bangalore", "Coimbatore", "Delhi", "Navi Mumbai", "Mumbai", "Noida"],
        stipends: ["₹12,000/month", "₹15,000/month", "₹18,000/month", "₹20,000/month", "₹10,000/month", "₹15,000/month", "₹22,000/month", "₹25,000/month", "₹15,000/month", "₹35,000/month", "₹18,000/month", "₹12,000/month", "₹15,000/month", "₹25,000/month", "₹30,000/month"]
      },
      {
        name: "Media",
        companies: ["Times of India", "Edelman", "NDTV", "Radio Mirchi", "Buzzfeed India", "National Geographic", "GlamourCo", "Ogilvy & Mather", "Network18", "Wizcraft", "India Today", "Saavn", "Dharma Productions", "GroupM", "MSL India"],
        roles: ["Journalism Intern", "Public Relations Intern", "Video Production Intern", "Radio Jockey Intern", "Content Writing Intern", "Photojournalism Intern", "Social Media Influencer Intern", "Copywriting Intern", "Digital Media Specialist Intern", "Event Marketing Intern", "Broadcast Journalism Intern", "Podcasting Intern", "Film Direction Assistant", "Advertising Sales Intern", "Media Relations Intern"],
        locations: ["Mumbai", "Delhi", "Delhi", "Mumbai", "Noida", "Mumbai", "Bangalore", "Mumbai", "Noida", "Mumbai", "Noida", "Bangalore", "Mumbai", "Gurgaon", "Bangalore"],
        stipends: ["₹10,000/month", "₹12,000/month", "₹15,000/month", "₹12,000/month", "₹8,000/month", "₹15,000/month", "indigo-600", "₹14,000/month", "₹12,000/month", "₹11,000/month", "₹13,000/month", "₹10,000/month", "₹15,000/month", "₹15,000/month", "₹12,000/month"]
      },
      {
        name: "Design",
        companies: ["Swiggy", "Canva India", "Sabyasachi", "Livspace", "Samsung Design", "Toonz Academy", "Webflow Studio", "Landor & Fitch", "Ubisoft", "Red Chillies", "Fabindia", "Razorpay", "Chumbak", "ITC", "MuseumCorp"],
        roles: ["UI/UX Design Intern", "Graphic Design Intern", "Fashion Design Intern", "Interior Design Intern", "Industrial Design Intern", "Animator Intern", "Web Design Intern", "Brand Identity Design Intern", "Game Environment Design Intern", "Motion Graphics Intern", "Textile Design Intern", "Product Design Intern", "Illustrator Intern", "Package Design Intern", "Exhibition Design Intern"],
        locations: ["Bangalore", "Mumbai", "Kolkata", "Bangalore", "Delhi", "Trivandrum", "Pune", "Mumbai", "Pune", "Mumbai", "New Delhi", "Bangalore", "Bangalore", "Kolkata", "Delhi"],
        stipends: ["₹25,000/month", "₹15,000/month", "₹20,000/month", "₹18,000/month", "₹30,000/month", "₹10,000/month", "₹15,000/month", "₹20,000/month", "₹25,000/month", "₹18,000/month", "₹12,000/month", "₹25,000/month", "₹14,000/month", "₹15,000/month", "₹12,000/month"]
      },
      {
        name: "Data Science",
        companies: ["OpenAI", "Mu Sigma", "Tableau", "Google DeepMind", "Snowflake", "HuggingFace", "OpenCV Labs", "TechEthics Institute", "Citadel", "Target India", "Oracle", "ISI Kolkata", "Cloudera", "Microsoft AI", "Databricks"],
        roles: ["Machine Learning Intern", "Data Analyst Intern", "Business Intelligence Intern", "Deep Learning Intern", "Data Engineer Intern", "NLP Research Intern", "Computer Vision Intern", "AI Ethics Intern", "Quantitative Finance Intern", "Predictive Analytics Intern", "Database Administrator Intern", "Statistics Research Intern", "Big Data Analytics Intern", "AI Product Intern", "MLOps Engineer Intern"],
        locations: ["Bangalore", "Bangalore", "Hyderabad", "Bangalore", "Pune", "Delhi", "Bangalore", "Noida", "Mumbai", "Bangalore", "Hyderabad", "Kolkata", "Pune", "Hyderabad", "Bangalore"],
        stipends: ["₹50,000/month", "₹25,000/month", "₹20,000/month", "₹45,000/month", "₹35,000/month", "₹30,000/month", "₹30,000/month", "₹20,000/month", "₹65,000/month", "₹25,000/month", "₹22,000/month", "₹15,000/month", "₹30,000/month", "₹35,000/month", "₹40,000/month"]
      }
    ];

    const internshipsToSave = [];

    for (const cat of categories) {
      for (let i = 0; i < 15; i++) {
        // Fix stipend values if they were mapped to style values
        const stipendVal = cat.stipends[i] === "indigo-600" ? "₹10,000/month" : cat.stipends[i];
        internshipsToSave.push({
          title: cat.roles[i],
          company: cat.companies[i],
          location: cat.locations[i],
          category: cat.name,
          aboutCompany: `${cat.companies[i]} is a leading global company specializing in innovation, technology, and customer success. We strive to create an inclusive and dynamic environment where employees can grow and excel.`,
          aboutInternship: `We are looking for a motivated and detail-oriented ${cat.roles[i]} to join our team. In this role, you will work on real-world projects, collaborate with cross-functional teams, and gain hands-on experience in the industry.`,
          whoCanApply: "Candidates pursuing graduation or post-graduation in relevant fields. Must have strong communication, analytical, and teamwork skills.",
          perks: ["Certificate", "Letter of Recommendation", "Flexible work hours", "Informal dress code"],
          numberOfOpening: String(Math.floor(Math.random() * 5) + 2),
          stipend: stipendVal,
          startDate: "Immediate",
          additionalInfo: "This is a great opportunity to jumpstart your career and work with industry veterans. High-performing interns may be considered for full-time offers."
        });
      }
    }

    await Internship.insertMany(internshipsToSave);

    // 3. Build and save jobs
    const jobsList = [
      { title: "Software Engineer", company: "Google", location: "Bangalore", Experience: "2+ Years", category: "Software Development", CTC: "₹24 LPA", StartDate: "Immediate" },
      { title: "Frontend Developer", company: "Vercel", location: "Remote", Experience: "1+ Years", category: "Web Development", CTC: "₹18 LPA", StartDate: "Immediate" },
      { title: "Backend Developer", company: "Amazon", location: "Hyderabad", Experience: "3+ Years", category: "Software Development", CTC: "₹28 LPA", StartDate: "Immediate" },
      { title: "Full Stack Developer", company: "Razorpay", location: "Bangalore", Experience: "2+ Years", category: "Web Development", CTC: "₹20 LPA", StartDate: "Immediate" },
      { title: "Marketing Manager", company: "Unilever", location: "Mumbai", Experience: "5+ Years", category: "Marketing", CTC: "₹22 LPA", StartDate: "1 Month" },
      { title: "Sales Associate", company: "Coca-Cola", location: "Pune", Experience: "0-2 Years", category: "Sales", CTC: "₹8 LPA", StartDate: "Immediate" },
      { title: "Graphic Designer", company: "Canva", location: "Remote", Experience: "2+ Years", category: "Design", CTC: "₹12 LPA", StartDate: "Immediate" },
      { title: "Data Analyst", company: "Spotify", location: "Bangalore", Experience: "1+ Years", category: "Data Science", CTC: "₹14 LPA", StartDate: "Immediate" },
      { title: "Product Manager", company: "Flipkart", location: "Bangalore", Experience: "4+ Years", category: "Product Management", CTC: "₹30 LPA", StartDate: "15 Days" },
      { title: "HR Recruiter", company: "Meta", location: "Gurgaon", Experience: "2+ Years", category: "Human Resources", CTC: "₹10 LPA", StartDate: "Immediate" },
      { title: "Cloud Architect", company: "Microsoft", location: "Hyderabad", Experience: "5+ Years", category: "Engineering", CTC: "₹35 LPA", StartDate: "Immediate" },
      { title: "Security Analyst", company: "Cisco", location: "Bangalore", Experience: "3+ Years", category: "Engineering", CTC: "₹22 LPA", StartDate: "Immediate" },
      { title: "Business Analyst", company: "McKinsey", location: "Delhi", Experience: "1+ Years", category: "Consulting", CTC: "₹18 LPA", StartDate: "1 Month" },
      { title: "Content Creator", company: "Disney", location: "Mumbai", Experience: "2+ Years", category: "Media", CTC: "₹12 LPA", StartDate: "Immediate" },
      { title: "Systems Engineer", company: "Intel", location: "Bangalore", Experience: "2+ Years", category: "Engineering", CTC: "₹16 LPA", StartDate: "Immediate" },
      { title: "DevOps Engineer", company: "Netflix", location: "Mumbai", Experience: "3+ Years", category: "Software Development", CTC: "₹32 LPA", StartDate: "Immediate" },
      { title: "AI Research Scientist", company: "OpenAI", location: "Bangalore", Experience: "4+ Years", category: "Data Science", CTC: "₹45 LPA", StartDate: "Immediate" },
      { title: "Mobile App Developer", company: "Uber", location: "Hyderabad", Experience: "2+ Years", category: "Software Development", CTC: "₹25 LPA", StartDate: "Immediate" },
      { title: "Database Administrator", company: "Oracle", location: "Pune", Experience: "3+ Years", category: "Engineering", CTC: "₹18 LPA", StartDate: "Immediate" },
      { title: "UX Researcher", company: "Apple", location: "Noida", Experience: "3+ Years", category: "Design", CTC: "₹24 LPA", StartDate: "Immediate" }
    ];

    const jobsToSave = jobsList.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      Experience: job.Experience,
      category: job.category,
      aboutCompany: `${job.company} is a pioneer in its sector, dedicated to delivering state-of-the-art products and services to millions of users globally.`,
      aboutJob: `As a Full-Time ${job.title}, you will be responsible for designing, building, and maintaining critical systems. You will collaborate with engineering, product, and business units to drive features from conception to launch.`,
      whoCanApply: "Graduates with relevant professional experience. Must possess strong problem-solving skills, solid technical foundation, and a track record of delivering results.",
      perks: ["Health Insurance", "Paid Time Off", "Flexible Working Hours", "Free Meals", "Gym Membership"],
      AdditionalInfo: "Competitive package with performance-based bonuses. Equity options may be offered depending on candidate profile.",
      CTC: job.CTC,
      StartDate: job.StartDate
    }));

    await Job.insertMany(jobsToSave);

    res.status(200).json({
      success: true,
      message: `Database successfully seeded with ${internshipsToSave.length} internships and ${jobsToSave.length} jobs.`
    });
  } catch (error) {
    console.error("Database seeding failed:", error);
    res.status(500).json({ error: "Database seeding failed", details: error.message });
  }
});

// GET /api/admin/debug-db - Diagnostic endpoint for mongoose connection and collections
router.get("/debug-db", async (req, res) => {
  try {
    const mongooseState = mongoose.connection.readyState;
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.status(200).json({
      success: true,
      mongooseState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      collections: collections.map(c => c.name),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

// GET /api/admin/error-logs - Diagnostic endpoint for captured error stacks
router.get("/error-logs", (req, res) => {
  res.status(200).json({
    success: true,
    logs: global.errorLog || []
  });
});

module.exports = router;
