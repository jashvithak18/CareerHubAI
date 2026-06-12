import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User as UserIcon } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import { useRouter } from "next/router";

const ProfilePage = () => {
  const user = useSelector(selectuser);
  const router = useRouter();
  const [applications, setApplications] = useState<any>([]);

  // Protect route client-side
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/application");
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  const activeCount = applications.filter((app: any) => app.status === "pending").length;
  const acceptedCount = applications.filter((app: any) => app.status === "accepted").length;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 text-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-bold text-2xl">
                    {activeCount}
                  </span>
                  <p className="text-blue-600 text-sm mt-1 font-semibold">
                    Active Applications (Pending)
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-bold text-2xl">
                    {acceptedCount}
                  </span>
                  <p className="text-green-600 text-sm mt-1 font-semibold">
                    Accepted Applications
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Applications
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
