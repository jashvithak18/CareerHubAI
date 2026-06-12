import React, { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  Mail,
  Tag,
  User,
} from "lucide-react";
import api from "../../utils/api";
import { selectuser } from "@/Feature/Userslice";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

const getStatusColor = (status: any) => {
  if (!status) return "bg-yellow-100 text-yellow-800";
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const UserApplications = () => {
  const [searchTerm, setsearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const user = useSelector(selectuser);
  const router = useRouter();
  const [data, setdata] = useState<any>([]);
  const [isloading, setisloading] = useState(true);

  // Protect student page client-side
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        setisloading(true);
        const res = await api.get("/application");
        setdata(res.data);
      } catch (error) {
        console.error("Error fetching user applications:", error);
      } finally {
        setisloading(false);
      }
    };
    if (user) {
      fetchdata();
    }
  }, [user]);

  const filteredapplications = data.filter((application: any) => {
    const companyName = application.company || "";
    const categoryName = application.category || "";
    const appStatus = application.status || "";

    const searchmatch =
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return searchmatch;
    return searchmatch && appStatus.toLowerCase() === filter.toLowerCase();
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your job and internship applications
            </p>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setsearchTerm(e.target.value)}
                    placeholder="Search by company, category..."
                    className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="absolute top-3 left-3 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "pending", "accepted", "rejected"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      filter === item
                        ? item === "accepted"
                          ? "bg-green-100 text-green-800"
                          : item === "rejected"
                          ? "bg-red-100 text-red-800"
                          : item === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Applications List */}
          <div className="overflow-x-auto">
            {isloading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading your applications...</span>
              </div>
            ) : filteredapplications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No applications found.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Company & Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Applicant
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Applied Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredapplications.map((application: any) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.company}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Tag className="h-4 w-4 mr-1" />
                              {application.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.user?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {application.createdAt
                            ? new Date(application.createdAt)
                                .toISOString()
                                .split("T")[0]
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserApplications;
