import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, FileText, Lock, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { toast } from "react-toastify";
import Link from "next/link";

const ResumeDashboard = () => {
  const user = useSelector(selectuser);
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resume");
      setResumes(res.data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const handleCreateResume = async () => {
    const isPro = user?.plan === "pro";
    if (!isPro && resumes.length >= 1) {
      toast.info("Upgrade to PRO to create multiple resumes!");
      router.push("/upgrade");
      return;
    }

    try {
      const res = await api.post("/resume", {
        title: `Resume ${resumes.length + 1}`,
        templateId: "modern",
      });
      toast.success("Resume created successfully");
      router.push(`/resumes/edit/${res.data._id}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create resume");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/resume/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete resume");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" /> Resume Builder
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage multiple tailored resumes for different roles
            </p>
          </div>
          
          <button
            onClick={handleCreateResume}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow-sm transition"
          >
            <Plus size={18} /> Create New Resume
          </button>
        </div>

        {/* Subscription Info Banner */}
        {user.plan !== "pro" && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <Sparkles size={18} className="text-amber-500 fill-amber-500" /> Upgrade to Pro
              </div>
              <p className="text-sm text-amber-700 mt-1">
                You are currently on the **Free tier** (limited to 1 resume). Get Pro for ₹99/month to unlock unlimited resumes and premium templates!
              </p>
            </div>
            <Link
              href="/upgrade"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition shadow-sm shrink-0"
            >
              Unlock Pro Plan
            </Link>
          </div>
        )}

        {/* Resumes Grid */}
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="text-gray-500 font-medium">Loading your resumes...</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <FileText className="mx-auto text-gray-300 w-16 h-16 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No resumes yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Create your first resume to apply to jobs with CareerHub AI</p>
            <button
              onClick={handleCreateResume}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg shadow transition"
            >
              <Plus size={16} /> Create Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                onClick={() => router.push(`/resumes/edit/${resume._id}`)}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer p-6 flex flex-col justify-between h-48 group relative overflow-hidden"
              >
                {/* Visual template tag */}
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-blue-500 group-hover:bg-blue-600 transition"></div>
                
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition truncate pr-8">
                      {resume.title}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">
                      {resume.templateId}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                  <span className="text-xs text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
                    <Edit2 size={12} /> Edit Details
                  </span>
                  <button
                    onClick={(e) => handleDelete(resume._id, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Resume"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDashboard;
