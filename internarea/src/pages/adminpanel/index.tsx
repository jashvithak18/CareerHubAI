import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Mail, 
  Send,
  Users,
  Sparkles,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Upload,
  BarChart3,
  Check,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const router = useRouter();

  // Statistics state
  const [stats, setStats] = useState<any>({
    totalResumes: 0,
    totalJobs: 0,
    totalInternships: 0,
    totalApplications: 0,
    freeUsers: 0,
    proUsers: 0,
    totalUsers: 0
  });

  // Pending upgrade payments
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Admin Payment Configuration Form
  const [upiId, setUpiId] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [configSaving, setConfigSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Guard page client-side
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/adminlogin");
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, paymentsRes, settingsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/payment/admin/pending"),
        api.get("/settings/payment-details")
      ]);
      setStats(statsRes.data);
      setPendingPayments(paymentsRes.data);
      setUpiId(settingsRes.data.upiId || "");
      setQrCodeBase64(settingsRes.data.qrCode || "");
    } catch (error) {
      console.error("Error loading admin dashboard details:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      fetchData();
    }
  }, []);

  const handleVerifyPayment = async (id: string, action: "approved" | "rejected") => {
    try {
      const res = await api.put(`/payment/admin/verify/${id}`, { action });
      toast.success(res.data.message || "Payment processed successfully");
      setPendingPayments(prev => prev.filter(p => p._id !== id));
      // Refresh stats
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Error processing payment");
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !qrCodeBase64) {
      toast.error("Please configure both UPI ID and QR code image!");
      return;
    }

    try {
      setConfigSaving(true);
      await api.post("/settings/payment-details", {
        upiId: upiId.trim(),
        qrCode: qrCodeBase64
      });
      toast.success("Payment details saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save payment details");
    } finally {
      setConfigSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50 text-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="font-semibold text-gray-500">Loading Admin Dashboard...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Internships', value: stats.totalInternships, icon: Send, color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-green-600 bg-green-50' },
    { label: 'Submitted Applications', value: stats.totalApplications, icon: Mail, color: 'text-blue-600 bg-blue-50' },
    { label: 'Resumes Created', value: stats.totalResumes, icon: BarChart3, color: 'text-orange-600 bg-orange-50' },
    { label: 'Total Enrolled Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600 bg-indigo-50' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Control Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor metrics, verify subscriber upgrades, and customize platform details
          </p>
        </div>

        {/* Dashboard Actions */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/applications"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
          >
            <Mail size={16} /> Review Job/Internship Applications
          </Link>
          <Link
            href="/postJob"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
          >
            <Briefcase size={16} /> Post New Job
          </Link>
          <Link
            href="/postInternship"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
          >
            <Send size={16} /> Post New Internship
          </Link>
        </div>

        {/* Platform metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mt-4">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Mid Section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Subscription stats */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
              <TrendingUp size={18} className="text-blue-600" /> Subscription Ratios
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <span className="text-gray-400 text-xs font-bold block uppercase mb-1">FREE Users</span>
                <span className="text-2xl font-extrabold text-gray-800">{stats.freeUsers}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <span className="text-amber-600 text-xs font-bold block uppercase mb-1">PRO Users</span>
                <span className="text-2xl font-extrabold text-amber-700">{stats.proUsers}</span>
              </div>
            </div>

            {/* Config Payment Settings (UPI / QR) */}
            <form onSubmit={handleSaveConfig} className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">QR / UPI Settings</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full text-black px-3 py-1.5 border rounded-lg text-sm"
                  placeholder="payment@upi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Upload QR Code image</label>
                <div className="relative border border-dashed rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {qrCodeBase64 ? (
                    <img src={qrCodeBase64} alt="Configured QR Code" className="h-16 object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Upload size={20} className="mb-1" />
                      <span className="text-2xs">Select QR Code receipt</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={configSaving}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2 rounded-lg text-xs transition"
              >
                {configSaving ? "Saving details..." : "Save Payment Config"}
              </button>
            </form>
          </div>

          {/* Pending Payment Verification Panel */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
              <CheckCircle size={18} className="text-green-600" /> Pending PRO Upgrades ({pendingPayments.length})
            </h2>

            {pendingPayments.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No pending upgrade requests found.
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[45vh] space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment._id} className="border p-4 rounded-lg bg-gray-50 space-y-3 relative">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{payment.userName}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{payment.userEmail}</p>
                        <p className="text-xs font-mono font-bold text-blue-600 mt-2 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                          UTR: {payment.utr}
                        </p>
                      </div>
                      
                      {/* Screenshot thumbnail */}
                      <button
                        onClick={() => setSelectedReceipt(payment.screenshot)}
                        className="p-1 border bg-white rounded-lg hover:shadow-md transition flex items-center gap-1.5 text-2xs font-semibold text-gray-600"
                        title="View screenshot receipt"
                      >
                        <ImageIcon size={14} className="text-gray-400" /> Receipt
                      </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t">
                      <button
                        onClick={() => handleVerifyPayment(payment._id, "rejected")}
                        className="flex items-center gap-1 text-xs text-red-600 font-bold hover:bg-red-50 px-3 py-1.5 rounded transition border border-red-200"
                      >
                        <XCircle size={14} /> Reject Request
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(payment._id, "approved")}
                        className="flex items-center gap-1 text-xs text-white bg-green-600 hover:bg-green-700 font-bold px-3 py-1.5 rounded transition shadow-sm"
                      >
                        <Check size={14} /> Approve Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Screenshot popup modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 max-w-xl w-full flex flex-col items-center relative shadow-2xl">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              &times;
            </button>
            <img src={selectedReceipt} alt="Transaction receipt" className="max-h-[70vh] object-contain rounded-lg border mt-4" />
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;