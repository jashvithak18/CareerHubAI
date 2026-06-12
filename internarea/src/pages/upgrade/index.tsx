import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { Check, Sparkles, AlertCircle, Upload, QrCode } from "lucide-react";

const UpgradeSubscription = () => {
  const user = useSelector(selectuser);
  const router = useRouter();

  // Payment configuration loaded from admin settings
  const [paymentSettings, setPaymentSettings] = useState<any>({ upiId: "", qrCode: "" });
  
  // Upgrade request form
  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const res = await api.get("/settings/payment-details");
        setPaymentSettings(res.data);
      } catch (error) {
        console.error("Error loading payment configuration:", error);
      }
    };
    fetchPaymentDetails();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (limit to 3MB to prevent database payloads)
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size is too large. Limit screenshot to 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!screenshotBase64) {
      toast.error("Please upload the payment screenshot!");
      return;
    }
    if (!utr.trim()) {
      toast.error("Please enter the UTR reference number!");
      return;
    }

    try {
      setLoading(true);
      await api.post("/payment/upgrade", {
        screenshot: screenshotBase64,
        utr: utr.trim()
      });
      toast.success("Upgrade request submitted. Verification usually takes 10-15 minutes.");
      setShowPaymentFlow(false);
      setUtr("");
      setScreenshotBase64("");
      router.push("/profile");
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || "Failed to submit request";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex justify-center items-center gap-2">
            <Sparkles className="text-amber-500 fill-amber-500" /> Choose Your CareerHub Plan
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Unlock premium templates and unlimited resumes
          </p>
        </div>

        {/* Plan Grid */}
        {!showPaymentFlow ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-sm border p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Free Starter</h3>
                <p className="text-xs text-gray-400 mt-1">Perfect to get started</p>
                <div className="text-3xl font-extrabold text-gray-900 mt-4">₹0</div>
                
                <ul className="space-y-3 mt-6 border-t pt-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check size={16} className="text-green-500 shrink-0" /> Max 1 Saved Resume
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check size={16} className="text-green-500 shrink-0" /> Standard Templates
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                {user.plan === "free" ? (
                  <button className="w-full bg-gray-100 text-gray-500 font-bold py-2.5 rounded-lg text-sm cursor-not-allowed" disabled>
                    Current Active Plan
                  </button>
                ) : (
                  <button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-2.5 rounded-lg text-sm transition" onClick={() => router.push("/profile")}>
                    Downgrade
                  </button>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl shadow-md border-2 border-blue-500 p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-3xs font-extrabold px-3 py-1 rounded-bl uppercase tracking-wider">
                POPULAR
              </div>
              
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-1">
                  PRO Plan <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                </h3>
                <p className="text-xs text-gray-400 mt-1">For serious job seekers</p>
                <div className="text-3xl font-extrabold text-gray-900 mt-4">
                  ₹99 <span className="text-xs text-gray-400 font-semibold">/ month</span>
                </div>
                
                <ul className="space-y-3 mt-6 border-t pt-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-600 font-semibold">
                    <Check size={16} className="text-blue-500 shrink-0" /> Unlimited Saved Resumes
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 font-semibold">
                    <Check size={16} className="text-blue-500 shrink-0" /> Premium Templates (Creative)
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 font-semibold">
                    <Check size={16} className="text-blue-500 shrink-0" /> Instant PDF Exports
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                {user.plan === "pro" ? (
                  <button className="w-full bg-purple-100 text-purple-700 font-extrabold py-2.5 rounded-lg text-sm cursor-not-allowed" disabled>
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPaymentFlow(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-lg text-sm transition shadow-sm"
                  >
                    Upgrade to PRO
                  </button>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Payment Flow UI */
          <div className="bg-white rounded-xl shadow-md border p-8 max-w-md mx-auto space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <QrCode size={20} className="text-blue-600" /> QR Code Payment Verification
              </h2>
              <button
                onClick={() => setShowPaymentFlow(false)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-2">
              <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                Scan the QR code below or pay to the UPI ID. Once the transaction completes, upload the screenshot and enter the UTR code.
              </p>
            </div>

            {/* QR display block */}
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50 relative min-h-[200px]">
              {paymentSettings.qrCode ? (
                <img
                  src={paymentSettings.qrCode}
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                  <QrCode size={48} />
                  <span className="text-xs font-semibold">QR Code Not Configured By Admin</span>
                </div>
              )}
              {paymentSettings.upiId && (
                <div className="text-center mt-3">
                  <span className="text-xs text-gray-400 font-bold block uppercase">UPI ID</span>
                  <span className="text-sm font-extrabold text-gray-800">{paymentSettings.upiId}</span>
                </div>
              )}
            </div>

            {/* Upload screenshot and UTR Form */}
            <form onSubmit={handleUpgradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Receipt Screenshot</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-55 cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {screenshotBase64 ? (
                    <img
                      src={screenshotBase64}
                      alt="Uploaded receipt"
                      className="h-28 object-contain rounded"
                    />
                  ) : (
                    <>
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <span className="text-xs text-gray-500 font-semibold">Select Screenshot Image</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter Transaction UTR Code</label>
                <input
                  type="text"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="e.g. 412345678901"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Submitting UTR...
                  </>
                ) : (
                  "Submit Verification Request"
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpgradeSubscription;
