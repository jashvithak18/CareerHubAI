import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import api from "../../../utils/api";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Printer, Plus, Trash2, Lock, FileText } from "lucide-react";
import Link from "next/link";

const ResumeEditor = () => {
  const user = useSelector(selectuser);
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState("My Resume");
  const [templateId, setTemplateId] = useState("modern");
  const [personalInfo, setPersonalInfo] = useState<any>({ name: "", email: "", phone: "", github: "", linkedin: "", summary: "" });
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/resume/${id}`);
        const data = res.data;
        setTitle(data.title || "My Resume");
        setTemplateId(data.templateId || "modern");
        setPersonalInfo(data.personalInfo || { name: "", email: "", phone: "", github: "", linkedin: "", summary: "" });
        setEducation(data.education || []);
        setExperience(data.experience || []);
        setSkills(data.skills ? data.skills.join(", ") : "");
        setProjects(data.projects || []);
        setCertifications(data.certifications || []);
      } catch (error) {
        console.error("Error loading resume:", error);
        toast.error("Failed to load resume");
        router.push("/resumes");
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchResume();
    }
  }, [id, user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Clean skills array
      const skillsArray = skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      await api.put(`/resume/${id}`, {
        title,
        templateId,
        personalInfo,
        education,
        experience,
        skills: skillsArray,
        projects,
        certifications
      });
      toast.success("Resume saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    // If premium template is chosen, verify user plan before exporting
    if (templateId === "creative" && user?.plan !== "pro") {
      toast.info("Please upgrade to PRO to export premium templates!");
      router.push("/upgrade");
      return;
    }
    window.print();
  };

  // Add handlers for array sections
  const addArrayItem = (section: string) => {
    if (section === "education") {
      setEducation(prev => [...prev, { school: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", gpa: "" }]);
    } else if (section === "experience") {
      setExperience(prev => [...prev, { company: "", position: "", location: "", startDate: "", endDate: "", description: "" }]);
    } else if (section === "projects") {
      setProjects(prev => [...prev, { title: "", description: "", technologies: "", link: "" }]);
    } else if (section === "certifications") {
      setCertifications(prev => [...prev, { name: "", issuingOrg: "", issueDate: "", credentialUrl: "" }]);
    }
  };

  const removeArrayItem = (section: string, index: number) => {
    if (section === "education") {
      setEducation(prev => prev.filter((_, i) => i !== index));
    } else if (section === "experience") {
      setExperience(prev => prev.filter((_, i) => i !== index));
    } else if (section === "projects") {
      setProjects(prev => prev.filter((_, i) => i !== index));
    } else if (section === "certifications") {
      setCertifications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateArrayItem = (section: string, index: number, field: string, value: string) => {
    if (section === "education") {
      setEducation(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    } else if (section === "experience") {
      setExperience(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    } else if (section === "projects") {
      setProjects(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    } else if (section === "certifications") {
      setCertifications(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50 text-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="font-semibold text-gray-500">Loading Resume Editor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black py-8 no-print">
      
      {/* Print styles wrapper (only displays during browser window.print()) */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-preview {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editor Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push("/resumes")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 text-gray-900 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-gray-700"
            >
              <option value="modern">Template: Modern (Free)</option>
              <option value="minimal">Template: Minimal (Free)</option>
              <option value="creative">Template: Creative (PRO)</option>
            </select>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition"
            >
              <Printer size={16} /> PDF Export
            </button>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Form Inputs */}
          <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col h-[75vh] overflow-y-auto">
            {/* Form Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-4 mb-6">
              {[
                { id: "personal", label: "Profile" },
                { id: "education", label: "Education" },
                { id: "experience", label: "Experience" },
                { id: "skills", label: "Skills" },
                { id: "projects", label: "Projects" },
                { id: "certifications", label: "Certifications" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Forms */}
            <div className="flex-1 space-y-4">
              
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-950 text-sm border-b pb-2">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 9999999999"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        value={personalInfo.github}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                        className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="github.com/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                        className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Professional Summary</label>
                    <textarea
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                      rows={5}
                      className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write a brief professional summary about yourself..."
                    />
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === "education" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-gray-950 text-sm">Academic History</h3>
                    <button
                      onClick={() => addArrayItem("education")}
                      className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <Plus size={14} /> Add Education
                    </button>
                  </div>
                  
                  {education.length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-6">No academic history added yet.</p>
                  )}

                  {education.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg relative border space-y-3">
                      <button
                        onClick={() => removeArrayItem("education", idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">School/University</label>
                          <input
                            type="text"
                            value={item.school}
                            onChange={(e) => updateArrayItem("education", idx, "school", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Harvard University"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Degree</label>
                          <input
                            type="text"
                            value={item.degree}
                            onChange={(e) => updateArrayItem("education", idx, "degree", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Bachelor of Science"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={item.fieldOfStudy}
                            onChange={(e) => updateArrayItem("education", idx, "fieldOfStudy", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Start Year</label>
                          <input
                            type="text"
                            value={item.startYear}
                            onChange={(e) => updateArrayItem("education", idx, "startYear", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="2021"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">End Year</label>
                          <input
                            type="text"
                            value={item.endYear}
                            onChange={(e) => updateArrayItem("education", idx, "endYear", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="2025"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-gray-950 text-sm">Professional Experience</h3>
                    <button
                      onClick={() => addArrayItem("experience")}
                      className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <Plus size={14} /> Add Experience
                    </button>
                  </div>
                  
                  {experience.length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-6">No experience records added yet.</p>
                  )}

                  {experience.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg relative border space-y-3">
                      <button
                        onClick={() => removeArrayItem("experience", idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => updateArrayItem("experience", idx, "company", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Google"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Position</label>
                          <input
                            type="text"
                            value={item.position}
                            onChange={(e) => updateArrayItem("experience", idx, "position", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Software Engineer Intern"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                          <input
                            type="text"
                            value={item.location}
                            onChange={(e) => updateArrayItem("experience", idx, "location", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Remote"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                          <input
                            type="text"
                            value={item.startDate}
                            onChange={(e) => updateArrayItem("experience", idx, "startDate", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Jun 2024"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                          <input
                            type="text"
                            value={item.endDate}
                            onChange={(e) => updateArrayItem("experience", idx, "endDate", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Present"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateArrayItem("experience", idx, "description", e.target.value)}
                          rows={4}
                          className="w-full text-black px-3 py-2 border rounded-lg bg-white focus:outline-none"
                          placeholder="Describe your responsibilities, key achievements, and technologies used..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-950 text-sm border-b pb-2">Skills Inventory</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Key Skills (Comma-Separated)</label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows={6}
                      className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="React.js, Node.js, TypeScript, Python, REST APIs, Git, Docker"
                    />
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      Separate each skill with a comma. They will render as individual tags on your resume.
                    </p>
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-gray-950 text-sm">Personal Projects</h3>
                    <button
                      onClick={() => addArrayItem("projects")}
                      className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <Plus size={14} /> Add Project
                    </button>
                  </div>
                  
                  {projects.length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-6">No projects added yet.</p>
                  )}

                  {projects.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg relative border space-y-3">
                      <button
                        onClick={() => removeArrayItem("projects", idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Project Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateArrayItem("projects", idx, "title", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="E-Commerce Platform"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Technologies Used</label>
                          <input
                            type="text"
                            value={item.technologies}
                            onChange={(e) => updateArrayItem("projects", idx, "technologies", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Next.js, Tailwind, Stripe"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Project Link / Repo URL</label>
                        <input
                          type="text"
                          value={item.link}
                          onChange={(e) => updateArrayItem("projects", idx, "link", e.target.value)}
                          className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                          placeholder="github.com/johndoe/project"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateArrayItem("projects", idx, "description", e.target.value)}
                          rows={3}
                          className="w-full text-black px-3 py-2 border rounded-lg bg-white focus:outline-none"
                          placeholder="Outline project purpose and core features implemented..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications Tab */}
              {activeTab === "certifications" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-gray-950 text-sm">Licenses & Certifications</h3>
                    <button
                      onClick={() => addArrayItem("certifications")}
                      className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <Plus size={14} /> Add Certification
                    </button>
                  </div>
                  
                  {certifications.length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-6">No credentials added yet.</p>
                  )}

                  {certifications.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg relative border space-y-3">
                      <button
                        onClick={() => removeArrayItem("certifications", idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Certification Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateArrayItem("certifications", idx, "name", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="AWS Certified Solutions Architect"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Issuing Authority</label>
                          <input
                            type="text"
                            value={item.issuingOrg}
                            onChange={(e) => updateArrayItem("certifications", idx, "issuingOrg", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="Amazon Web Services"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Issue Date</label>
                          <input
                            type="text"
                            value={item.issueDate}
                            onChange={(e) => updateArrayItem("certifications", idx, "issueDate", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="August 2024"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Credential URL</label>
                          <input
                            type="text"
                            value={item.credentialUrl}
                            onChange={(e) => updateArrayItem("certifications", idx, "credentialUrl", e.target.value)}
                            className="w-full text-black px-3 py-1.5 border rounded-lg bg-white"
                            placeholder="aws.amazon.com/verify/123"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Live Preview Sheet */}
          <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center justify-between h-[75vh] overflow-y-auto relative">
            
            {/* Lock Overlay for Premium Template */}
            {templateId === "creative" && user?.plan !== "pro" && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
                <Lock className="w-12 h-12 text-amber-500 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-gray-900">Creative Template is a PRO Feature</h3>
                <p className="text-gray-500 text-sm max-w-xs mt-1 mb-6 leading-relaxed">
                  Upgrade your account to unlock premium ATS-friendly templates and boost your hiring response rate.
                </p>
                <Link
                  href="/upgrade"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition shadow-sm"
                >
                  Upgrade to PRO for ₹99
                </Link>
              </div>
            )}

            {/* Resume Sheet Document Preview Container */}
            <div
              id="resume-preview-container"
              className="print-preview w-full bg-white shadow-inner border p-8 rounded-lg overflow-y-auto text-black aspect-[1/1.41] leading-normal"
              style={{ fontFamily: templateId === "minimal" ? "'Georgia', serif" : "'Inter', sans-serif" }}
            >
              {/* Template Renders */}

              {/* Template 1: Modern */}
              {templateId === "modern" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b-2 border-blue-500 pb-4 text-center sm:text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 uppercase">{personalInfo.name || "YOUR NAME"}</h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-gray-600 mt-2 font-medium">
                      {personalInfo.email && <span>{personalInfo.email}</span>}
                      {personalInfo.phone && <span>{personalInfo.phone}</span>}
                      {personalInfo.github && <span className="underline">{personalInfo.github}</span>}
                      {personalInfo.linkedin && <span className="underline">{personalInfo.linkedin}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {personalInfo.summary && (
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Professional Summary</h2>
                      <p className="text-sm text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.trim() && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.split(",").map((s, i) => s.trim() && (
                          <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold border">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {experience.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Experience</h2>
                      <div className="space-y-4">
                        {experience.map((exp, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-sm text-gray-900">{exp.position || "Position"}</h3>
                              <span className="text-xs text-gray-500 font-semibold">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold italic">
                              <span>{exp.company}</span>
                              <span>{exp.location}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {projects.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Projects</h2>
                      <div className="space-y-4">
                        {projects.map((proj, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-sm text-gray-900">{proj.title || "Project Title"}</h3>
                              {proj.link && <span className="text-xs text-blue-500 underline">{proj.link}</span>}
                            </div>
                            <p className="text-xs text-gray-400 font-semibold">Tech: {proj.technologies}</p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Education</h2>
                      <div className="space-y-3">
                        {education.map((edu, i) => (
                          <div key={i} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-sm text-gray-900">{edu.school || "School"}</h3>
                              <p className="text-xs text-gray-500 font-semibold">{edu.degree} in {edu.fieldOfStudy}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-semibold">{edu.startYear} - {edu.endYear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {certifications.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Certifications</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {certifications.map((cert, i) => (
                          <div key={i} className="text-xs">
                            <h3 className="font-bold text-gray-900">{cert.name}</h3>
                            <p className="text-gray-500">{cert.issuingOrg} ({cert.issueDate})</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template 2: Minimal */}
              {templateId === "minimal" && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="text-center border-b pb-3">
                    <h1 className="text-2xl font-bold tracking-wide uppercase text-gray-950">{personalInfo.name || "YOUR NAME"}</h1>
                    <div className="flex justify-center flex-wrap gap-x-3 gap-y-0.5 text-xs mt-1 text-gray-600 font-semibold">
                      {personalInfo.email && <span>{personalInfo.email}</span>}
                      {personalInfo.phone && <span>{personalInfo.phone}</span>}
                      {personalInfo.github && <span>{personalInfo.github}</span>}
                      {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {personalInfo.summary && (
                    <p className="text-xs text-gray-600 text-center italic leading-relaxed">{personalInfo.summary}</p>
                  )}

                  {/* Skills */}
                  {skills.trim() && (
                    <div className="space-y-1 text-center">
                      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b pb-0.5 mb-1.5">Skills</h2>
                      <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                        {skills.split(",").map(s => s.trim()).filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {experience.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b pb-0.5 mb-2">Professional Experience</h2>
                      <div className="space-y-3">
                        {experience.map((exp, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between font-bold text-gray-900">
                              <span>{exp.position} - {exp.company}</span>
                              <span className="font-normal text-gray-500">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed mt-0.5 whitespace-pre-line">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b pb-0.5 mb-2">Projects</h2>
                      <div className="space-y-3">
                        {projects.map((proj, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between font-bold text-gray-900">
                              <span>{proj.title} (Tech: {proj.technologies})</span>
                              {proj.link && <span className="font-normal text-blue-500 underline text-2xs">{proj.link}</span>}
                            </div>
                            <p className="text-gray-600 leading-relaxed mt-0.5">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b pb-0.5 mb-2">Education</h2>
                      <div className="space-y-2">
                        {education.map((edu, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-950">
                            <div>
                              <span className="font-bold">{edu.school}</span> — <span className="italic">{edu.degree} ({edu.fieldOfStudy})</span>
                            </div>
                            <span className="text-gray-500">{edu.startYear} - {edu.endYear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template 3: Creative (Pro) */}
              {templateId === "creative" && (
                <div className="space-y-5 text-gray-900">
                  {/* Decorative Header Block */}
                  <div className="bg-slate-900 text-white -m-8 mb-6 p-8">
                    <h1 className="text-3xl font-bold tracking-tight text-center">{personalInfo.name || "YOUR NAME"}</h1>
                    <p className="text-slate-300 text-center text-xs mt-1 font-medium italic">
                      {personalInfo.email} {personalInfo.phone ? `| ${personalInfo.phone}` : ""}
                    </p>
                    <div className="flex justify-center gap-x-4 text-2xs mt-2 text-blue-400 font-semibold underline">
                      {personalInfo.github && <a href={`https://${personalInfo.github}`}>{personalInfo.github}</a>}
                      {personalInfo.linkedin && <a href={`https://${personalInfo.linkedin}`}>{personalInfo.linkedin}</a>}
                    </div>
                  </div>

                  {/* Summary */}
                  {personalInfo.summary && (
                    <div className="space-y-1.5 border-l-4 border-slate-900 pl-4">
                      <p className="text-xs text-gray-600 font-semibold leading-relaxed">{personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Grid Layout for Skills/Experience */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-4 border-r pr-4">
                      {/* Skills Sidebar */}
                      {skills.trim() && (
                        <div className="space-y-2">
                          <h2 className="text-xs font-extrabold uppercase text-slate-900 border-b pb-1">Skills</h2>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.split(",").map((s, idx) => s.trim() && (
                              <span key={idx} className="px-2 py-0.5 bg-slate-800 text-white rounded text-2xs font-semibold">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education Sidebar */}
                      {education.length > 0 && (
                        <div className="space-y-2">
                          <h2 className="text-xs font-extrabold uppercase text-slate-900 border-b pb-1">Education</h2>
                          {education.map((edu, idx) => (
                            <div key={idx} className="text-2xs space-y-0.5">
                              <h3 className="font-bold text-gray-900 leading-tight">{edu.school}</h3>
                              <p className="text-gray-500 font-semibold">{edu.degree}</p>
                              <p className="text-gray-400 font-medium italic">{edu.startYear} - {edu.endYear}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 space-y-4">
                      {/* Experience list */}
                      {experience.length > 0 && (
                        <div className="space-y-2">
                          <h2 className="text-xs font-extrabold uppercase text-slate-900 border-b pb-1">Experience</h2>
                          <div className="space-y-3">
                            {experience.map((exp, idx) => (
                              <div key={idx} className="text-2xs space-y-0.5">
                                <h3 className="font-bold text-gray-900 text-xs">{exp.position} at {exp.company}</h3>
                                <p className="text-gray-400 font-bold italic">{exp.startDate} - {exp.endDate}</p>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line mt-1">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects list */}
                      {projects.length > 0 && (
                        <div className="space-y-2">
                          <h2 className="text-xs font-extrabold uppercase text-slate-900 border-b pb-1">Projects</h2>
                          <div className="space-y-3">
                            {projects.map((proj, idx) => (
                              <div key={idx} className="text-2xs space-y-0.5">
                                <h3 className="font-bold text-gray-900">{proj.title} (Tech: {proj.technologies})</h3>
                                <p className="text-gray-600 mt-1">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
