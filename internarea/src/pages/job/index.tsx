import api from "../../utils/api";
import {
  ArrowUpRight,
  DollarSign,
  Filter,
  Pin,
  PlayCircle,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const parseSalary = (salaryStr: string): number => {
  if (!salaryStr) return 0;
  // Clean string and extract numbers (e.g. "₹10 LPA" -> 10)
  const cleaned = salaryStr.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
};

const JobListing = () => {
  const router = useRouter();
  const [filteredjob, setfilteredjobs] = useState<any>([]);
  const [isFiltervisible, setisFiltervisible] = useState(false);
  const [filter, setfilters] = useState({
    category: "",
    location: "",
    workFromHome: false,
    partTime: false,
    salary: 0, // Default to 0 minimum salary
    experience: "",
  });
  const [filteredJobs, setjob] = useState<any>([]);

  useEffect(() => {
    if (router.isReady) {
      const { category, location } = router.query;
      setfilters((prev) => ({
        ...prev,
        category: typeof category === "string" ? category : prev.category,
        location: typeof location === "string" ? location : prev.location,
      }));
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await api.get("/job");
        setjob(res.data);
        setfilteredjobs(res.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchdata();
  }, []);

  useEffect(() => {
    const filtered = filteredJobs.filter((job: any) => {
      const matchesCategory = (job.category || "")
        .toLowerCase()
        .includes(filter.category.toLowerCase());
      
      const matchesLocation = (job.location || "")
        .toLowerCase()
        .includes(filter.location.toLowerCase());

      const matchesExperience = (job.Experience || "")
        .toLowerCase()
        .includes(filter.experience.toLowerCase());

      const matchesWFH = !filter.workFromHome || 
        (job.location || "").toLowerCase().includes("remote") || 
        (job.location || "").toLowerCase().includes("home") || 
        (job.location || "").toLowerCase().includes("wfh");

      const matchesPartTime = !filter.partTime || 
        (job.title || "").toLowerCase().includes("part-time") ||
        (job.title || "").toLowerCase().includes("part time") ||
        (job.aboutJob || "").toLowerCase().includes("part-time") ||
        (job.aboutJob || "").toLowerCase().includes("part time");

      // Minimum annual salary (CTC slider is 0-100 representing ₹0L-₹100L)
      const minRequired = filter.salary; 
      const jobSalaryVal = parseSalary(job.CTC);
      const matchesSalary = jobSalaryVal >= minRequired;

      return matchesCategory && matchesLocation && matchesExperience && matchesWFH && matchesPartTime && matchesSalary;
    });
    setfilteredjobs(filtered);
  }, [filter, filteredJobs]);

  const handlefilterchange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setfilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleTextFilterChange = (e: any) => {
    const { name, value } = e.target;
    setfilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setfilters({
      category: "",
      location: "",
      workFromHome: false,
      partTime: false,
      salary: 0,
      experience: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-black">Filters</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-6">
              {/* Profile/Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={filter.category}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 border-gray-300"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filter.location}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 border-gray-300"
                  placeholder="e.g. Remote"
                />
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={filter.experience}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 border-gray-300"
                  placeholder="e.g. 2 years"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="workFromHome"
                    checked={filter.workFromHome}
                    onChange={handlefilterchange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700 font-medium text-sm">Work from home</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="partTime"
                    checked={filter.partTime}
                    onChange={handlefilterchange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700 font-medium text-sm">Part-time</span>
                </label>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Annual Salary: ₹{filter.salary}L
                </label>
                <input
                  type="range"
                  name="salary"
                  min="0"
                  max="100"
                  value={filter.salary}
                  onChange={handlefilterchange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0L</span>
                  <span>₹50L</span>
                  <span>₹100L</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="md:hidden mb-4">
              <button
                onClick={() => setisFiltervisible(!isFiltervisible)}
                className="w-full flex items-center justify-center space-x-2 bg-white p-3 rounded-lg shadow-sm text-black border"
              >
                <Filter className="h-5 w-5" />
                <span> Show Filters</span>
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <p className="text-center font-medium text-black">
                {filteredjob.length} Jobs found
              </p>
            </div>
            <div className="space-y-4">
              {filteredjob.map((job: any) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-2 text-blue-600 mb-4">
                    <ArrowUpRight className="h-5 w-5" />
                    <span className="font-medium">Actively Hiring</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{job.company}</p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <PlayCircle className="h-5 w-5" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Category</p>
                        <p className="text-sm font-medium">{job.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Pin className="h-5 w-5" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Location</p>
                        <p className="text-sm font-medium">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-5 w-5" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">CTC</p>
                        <p className="text-sm font-medium">{job.CTC}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        Jobs
                      </span>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Posted recently</span>
                      </div>
                    </div>
                    <Link
                      href={`/detailjob/${job._id}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Filters Modal */}
      {isFiltervisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white h-full w-full max-w-sm ml-auto p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                onClick={() => setisFiltervisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Profile/Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={filter.category}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 border-gray-300"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filter.location}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 border-gray-300"
                  placeholder="e.g. Remote"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={filter.experience}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 border-gray-300"
                  placeholder="e.g. 2 years"
                />
              </div>
              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="workFromHome"
                    checked={filter.workFromHome}
                    onChange={handlefilterchange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700">Work from home</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="partTime"
                    checked={filter.partTime}
                    onChange={handlefilterchange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700">Part-time</span>
                </label>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Annual Salary: ₹{filter.salary}L
                </label>
                <input
                  type="range"
                  name="salary"
                  min="0"
                  max="100"
                  value={filter.salary}
                  onChange={handlefilterchange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹0L</span>
                  <span>₹50L</span>
                  <span>₹100L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListing;
