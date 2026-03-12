"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import {
    User, LayoutDashboard, ChevronRight,
    CheckCircle, Briefcase, Shield, Users
} from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Avatar from "../components/common/Avatar";
import CandidateDashboard from "./components/CandidateDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";

const ROLE_CONFIG = {
    candidate: {
        label: "Candidate Dashboard",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        icon: Briefcase,
        badge: "bg-indigo-600",
    },
    recruiter: {
        label: "Recruiter Dashboard",
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: Users,
        badge: "bg-blue-600",
    },
    admin: {
        label: "Admin Control Panel",
        color: "text-amber-600",
        bg: "bg-amber-50",
        icon: Shield,
        badge: "bg-amber-600",
    },
};

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchAll = async () => {
            setLoading(true);
            try {
                // 1. Fetch MongoDB profile (contains role)
                const profileRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile/${user.uid}`
                );
                const profileData = await profileRes.json();
                const profile = profileData.data || {};
                setUserProfile(profile);

                const role = profile.role || "candidate";

                // 2. Fetch role-specific dashboard data
                let dashUrl = "";
                if (role === "candidate") dashUrl = `/api/dashboard/candidate/${user.uid}`;
                else if (role === "recruiter") dashUrl = `/api/dashboard/recruiter/${user.uid}`;
                else if (role === "admin") dashUrl = `/api/dashboard/admin`;

                const dashRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${dashUrl}`);
                const dashJson = await dashRes.json();
                setDashboardData(dashJson.data || null);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Could not load dashboard data. The backend may be offline.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [user?.uid]);

    // ── Not Logged In ────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-4">Access Denied</h1>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        Please sign in to access your professional dashboard and manage your applications.
                    </p>
                    <Link
                        href="/signin"
                        className="block w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        Sign In to SkillMatch AI
                    </Link>
                </div>
            </div>
        );
    }

    const role = userProfile?.role || "candidate";
    const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.candidate;
    const RoleIcon = roleConfig.icon;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 md:pt-32">

                {/* ── Welcome Section ─────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <Avatar src={user?.photoURL} size="w-20 h-20 md:w-24 md:h-24" ring={true} />
                            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-slate-50">
                                <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <LayoutDashboard className={`w-5 h-5 ${roleConfig.color}`} />
                                <span className={`text-xs font-black ${roleConfig.color} uppercase tracking-widest`}>
                                    {roleConfig.label}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                Welcome back,{" "}
                                <span className={roleConfig.color}>
                                    {user?.displayName?.split(" ")[0] || "Professional"}!
                                </span>
                            </h1>
                            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                {role === "admin" ? (
                                    "You have full platform access."
                                ) : (
                                    <>
                                        Profile is{" "}
                                        <span className="text-slate-900 font-bold">
                                            {dashboardData?.profileCompletion || userProfile?.profileCompleted || 85}%
                                        </span>{" "}
                                        complete.{" "}
                                        <Link
                                            href="/profile/edit"
                                            className="text-indigo-600 hover:text-indigo-700 font-bold underline decoration-2 underline-offset-4"
                                        >
                                            Complete it now
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {role === "recruiter" && (
                            <Link
                                href="/jobs"
                                className="flex items-center justify-center gap-2.5 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Briefcase className="w-5 h-5" />
                                Browse Talent
                            </Link>
                        )}
                        {role === "candidate" && (
                            <Link
                                href="/jobs"
                                className="flex items-center justify-center gap-2.5 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                <Briefcase className="w-5 h-5" />
                                Find New Jobs
                            </Link>
                        )}
                    </div>
                </div>

                {/* ── Role Badge Strip ─────────────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-8">
                    <div className={`flex items-center gap-2 ${roleConfig.bg} ${roleConfig.color} px-4 py-2 rounded-2xl font-black text-sm`}>
                        <RoleIcon className="w-4 h-4" />
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </div>
                    <span className="text-slate-400 text-sm font-medium">Signed in as {user?.email}</span>
                </div>

                {/* ── Loading ──────────────────────────────────────────────────── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6"></div>
                                <div className="h-8 bg-slate-100 rounded-xl w-16 mb-2"></div>
                                <div className="h-3 bg-slate-50 rounded-lg w-24"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Error Banner ─────────────────────────────────────────────── */}
                {error && !loading && (
                    <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 font-bold flex items-center gap-3">
                        <ChevronRight className="w-5 h-5 shrink-0" />
                        {error} — Showing placeholder data below.
                    </div>
                )}

                {/* ── Role-Based Dashboard ─────────────────────────────────────── */}
                <div className="animate-fade-in duration-700">
                    {role === "candidate" && (
                        <CandidateDashboard user={user} data={dashboardData} loading={loading} />
                    )}
                    {role === "recruiter" && (
                        <RecruiterDashboard user={user} data={dashboardData} loading={loading} />
                    )}
                    {role === "admin" && (
                        <AdminDashboard user={user} data={dashboardData} loading={loading} />
                    )}
                </div>
            </main>
            <Footer />

            <style jsx global>{`
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.1; }
                    100% { transform: scale(1); opacity: 0.3; }
                }
                .animate-ping-slow {
                    animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
}
