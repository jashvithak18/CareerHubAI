import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { selectuser, logout, login } from "@/Feature/Userslice";
import { useRouter } from "next/router";

const Navbar = () => {
  const reduxUser = useSelector(selectuser);
  const dispatch = useDispatch();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    } else {
      // Check if admin is logged in locally
      if (typeof window !== "undefined") {
        const adminToken = localStorage.getItem("adminToken");
        if (adminToken) {
          setUser({
            name: "Admin",
            role: "admin",
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces",
          });
        } else {
          setUser(null);
        }
      }
    }
  }, [reduxUser]);

  const handlelogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  const handlelogout = async () => {
    try {
      if (localStorage.getItem("adminToken")) {
        localStorage.removeItem("adminToken");
      }
      await signOut(auth);
      dispatch(logout());
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const internshipProfiles = [
    { name: "Web Development", href: "/internship?category=Web%20Development" },
    { name: "Android Development", href: "/internship?category=Android%20Development" },
    { name: "Graphic Design", href: "/internship?category=Graphic%20Design" },
    { name: "Digital Marketing", href: "/internship?category=Digital%20Marketing" },
    { name: "Content Writing", href: "/internship?category=Content%20Writing" },
    { name: "Finance", href: "/internship?category=Finance" },
    { name: "Human Resources (HR)", href: "/internship?category=Human%20Resources" },
    { name: "Data Science", href: "/internship?category=Data%20Science" },
    { name: "Operations", href: "/internship?category=Operations" },
    { name: "UI/UX Design", href: "/internship?category=UI%2FUX%20Design" },
  ];

  const internshipLocations = [
    { name: "Work From Home", href: "/internship?location=Remote" },
    { name: "Delhi", href: "/internship?location=Delhi" },
    { name: "Bangalore", href: "/internship?location=Bangalore" },
    { name: "Mumbai", href: "/internship?location=Mumbai" },
    { name: "Pune", href: "/internship?location=Pune" },
    { name: "Hyderabad", href: "/internship?location=Hyderabad" },
    { name: "Chennai", href: "/internship?location=Chennai" },
    { name: "Kolkata", href: "/internship?location=Kolkata" },
    { name: "Noida", href: "/internship?location=Noida" },
    { name: "Gurgaon", href: "/internship?location=Gurgaon" },
  ];

  const jobProfiles = [
    { name: "Software Engineer", href: "/job?category=Software%20Engineer" },
    { name: "Frontend Developer", href: "/job?category=Frontend%20Developer" },
    { name: "Backend Developer", href: "/job?category=Backend%20Developer" },
    { name: "Full Stack Developer", href: "/job?category=Full%20Stack%20Developer" },
    { name: "Marketing Manager", href: "/job?category=Marketing%20Manager" },
    { name: "Sales Associate", href: "/job?category=Sales%20Associate" },
    { name: "Graphic Designer", href: "/job?category=Graphic%20Designer" },
    { name: "Data Analyst", href: "/job?category=Data%20Analyst" },
    { name: "Product Manager", href: "/job?category=Product%20Manager" },
    { name: "HR Recruiter", href: "/job?category=HR%20Recruiter" },
  ];

  const jobLocations = [
    { name: "Work From Home", href: "/job?location=Remote" },
    { name: "Bangalore", href: "/job?location=Bangalore" },
    { name: "Delhi", href: "/job?location=Delhi" },
    { name: "Mumbai", href: "/job?location=Mumbai" },
    { name: "Pune", href: "/job?location=Pune" },
    { name: "Hyderabad", href: "/job?location=Hyderabad" },
    { name: "Chennai", href: "/job?location=Chennai" },
    { name: "Noida", href: "/job?location=Noida" },
    { name: "Gurgaon", href: "/job?location=Gurgaon" },
    { name: "Kolkata", href: "/job?location=Kolkata" },
  ];

  return (
    <div className="relative text-black no-print">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <img src="/logo.png" alt="CareerHub Logo" className="h-10" />
                <span className="font-extrabold tracking-tight text-lg hidden sm:inline text-gray-900">CareerHub</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              
              {/* Internships Dropdown */}
              <div className="relative group py-4">
                <Link href="/internship" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-semibold text-sm focus:outline-none">
                  <span>Internships</span>
                  <svg className="w-4 h-4 ml-0.5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute left-0 mt-1 w-[400px] bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:grid grid-cols-2 p-4 z-50 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-2xs font-extrabold text-blue-600 uppercase tracking-wider px-2 mb-1.5 border-b pb-1">By Profile</p>
                    {internshipProfiles.map((p) => (
                      <Link key={p.name} href={p.href} className="block px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded font-medium">
                        {p.name}
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-1 border-l border-gray-100 pl-4">
                    <p className="text-2xs font-extrabold text-blue-600 uppercase tracking-wider px-2 mb-1.5 border-b pb-1">By Location</p>
                    {internshipLocations.map((l) => (
                      <Link key={l.name} href={l.href} className="block px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded font-medium">
                        {l.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Jobs Dropdown */}
              <div className="relative group py-4">
                <Link href="/job" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-semibold text-sm focus:outline-none">
                  <span>Jobs</span>
                  <svg className="w-4 h-4 ml-0.5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute left-0 mt-1 w-[400px] bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:grid grid-cols-2 p-4 z-50 transition-all duration-300">
                  <div className="space-y-1">
                    <p className="text-2xs font-extrabold text-blue-600 uppercase tracking-wider px-2 mb-1.5 border-b pb-1">By Profile</p>
                    {jobProfiles.map((p) => (
                      <Link key={p.name} href={p.href} className="block px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded font-medium">
                        {p.name}
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-1 border-l border-gray-100 pl-4">
                    <p className="text-2xs font-extrabold text-blue-600 uppercase tracking-wider px-2 mb-1.5 border-b pb-1">By Location</p>
                    {jobLocations.map((l) => (
                      <Link key={l.name} href={l.href} className="block px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded font-medium">
                        {l.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {user && user.role === "admin" && (
                <button className="flex items-center space-x-1 text-purple-700 hover:text-purple-900 font-bold text-sm">
                  <Link href="/adminpanel">
                    <span>Admin Panel</span>
                  </Link>
                </button>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {user.role !== "admin" ? (
                    <div className="flex items-center gap-3">
                      <Link href="/upgrade" className="text-3xs font-extrabold uppercase bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded shadow-sm">
                        {user.plan === "pro" ? "PRO User ✨" : "Upgrade to Pro"}
                      </Link>
                      <Link href="/profile" className="flex items-center space-x-2">
                        <img
                          src={user.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces"}
                          alt="Profile"
                          className="w-8 h-8 rounded-full border border-gray-300"
                        />
                        <span className="text-sm font-semibold text-gray-700 hidden lg:inline">{user.name}</span>
                      </Link>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-purple-700">Admin Mode</span>
                  )}
                  <button
                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                    onClick={handlelogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlelogin}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-gray-50 text-sm font-semibold shadow-sm transition"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700">Student Sign In</span>
                  </button>
                  <Link
                    href="/adminlogin"
                    className="text-gray-600 hover:text-gray-800 text-sm font-semibold transition"
                  >
                    Admin
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
