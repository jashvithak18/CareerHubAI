import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { Sparkles, FileText, CheckCircle2, AlertTriangle, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

const ATSChecker = () => {
  const user = useSelector(selectuser);
  const router = useRouter();

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Limit count
  const [remainingChecks, setRemainingChecks] = useState<any>("3");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      setIsPro(user.plan === "pro");
      if (user.atsChecksThisMonth !== undefined) {
        setRemainingChecks(Math.max(0, 3 - user.atsChecksThisMonth));
      }
    }
  }, [user, router]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get("/resume");
        setResumes(res.data);
        if (res.data.length > 0) {
          setSelectedResumeId(res.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching resumes for selector:", error);
      }
    };
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const handleRunCheck = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume or build one first!");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description to analyze!");
      return;
    }

    try {
      setLoading(true);
      setResults(null);
      const res = await api.post("/ats/check", {
        resumeId: selectedResumeId,
        jobDescription: jobDescription
      });
      setResults(res.data);
      setRemainingChecks(res.data.remainingChecks);
      toast.success("ATS score calculated!");
    } catch (error: any) {
      console.error(error);
      const errMessage = error.response?.data?.error || "Error analyzing resume";
      toast.error(errMessage);
      if (error.response?.data?.upgradeRequired) {
        router.push("/upgrade");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-blue-600 animate-pulse" /> ATS Score Checker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compare your resume keywords against a job description to optimize your applications
          </p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              
              {/* Select Resume */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  1. Select Resume
                </label>
                {resumes.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-lg text-center space-y-3">
                    <p className="text-sm text-gray-500">You haven't built a resume yet.</p>
                    <Link
                      href="/resumes"
                      className="inline-flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded font-bold"
                    >
                      Build a Resume <ChevronRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    {resumes.map(r => (
                      <option key={r._id} value={r._id}>{r.title} (Template: {r.templateId})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Paste Job Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  2. Paste Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the key requirements, skills, and details from the job description here..."
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunCheck}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Analyzing keywords...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Calculate ATS Relevance Score
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Limits & Results sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Limit Panel */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-800 text-md border-b pb-2 mb-3">Usage Limits</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-sm font-medium">Account Plan</span>
                <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded ${
                  isPro ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"
                }`}>
                  {isPro ? "PRO" : "FREE"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-sm font-medium">ATS Checks Remaining</span>
                <span className="font-extrabold text-blue-600 text-lg">
                  {remainingChecks}
                </span>
              </div>
              {!isPro && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href="/upgrade"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-sm text-center block transition shadow-sm"
                  >
                    Get Pro for Unlimited Checks
                  </Link>
                </div>
              )}
            </div>

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <h3 className="font-bold text-gray-800 text-md border-b pb-2">Analysis Results</h3>
                
                {/* Score Dial */}
                <div className="flex flex-col items-center py-4">
                  <div className="relative flex items-center justify-center">
                    {/* Styled circular indicator */}
                    <div className="w-28 h-28 rounded-full border-8 border-gray-100 flex flex-col justify-center items-center">
                      <span className="text-3xl font-extrabold text-gray-900">{results.score}%</span>
                      <span className="text-3xs font-bold text-gray-400 uppercase">Match Score</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-3 bg-gray-50 rounded-lg border flex gap-2">
                  {results.score >= 70 ? (
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                  ) : (
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  )}
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {results.recommendation}
                  </p>
                </div>

                {/* Matched Keywords */}
                {results.matchedKeywords?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Matched Skills ({results.matchedKeywords.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {results.matchedKeywords.map((k: string) => (
                        <span key={k} className="px-2 py-0.5 bg-green-50 text-green-700 text-2xs font-semibold rounded border border-green-200">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {results.missingKeywords?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Missing Skills ({results.missingKeywords.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {results.missingKeywords.map((k: string) => (
                        <span key={k} className="px-2 py-0.5 bg-red-50 text-red-700 text-2xs font-semibold rounded border border-red-200">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default ATSChecker;
