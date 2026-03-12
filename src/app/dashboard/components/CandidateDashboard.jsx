"use client";

import { useState } from "react";
import { Briefcase, Bookmark, User, TrendingUp, Clock, ChevronRight, Star, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Avatar from "../../components/common/Avatar";
import Skeleton from "../../components/common/Skeleton";
import ApplicationPulseTracker from "./candidate/ApplicationPulseTracker";
import GrowthFeedbackCard from "../../components/GrowthFeedback/GrowthFeedbackCard";

// ── Status label + colour helper ───────────────────────────────
const STATUS_STYLES = {
    applied: "bg-blue-100 text-blue-700",
    submitted: "bg-blue-100 text-blue-700",
    ai_scored: "bg-indigo-100 text-indigo-700",
    viewed: "bg-sky-100 text-sky-700",
    shortlisted: "bg-emerald-100 text-emerald-700",
    interview: "bg-purple-100 text-purple-700",
    offer: "bg-amber-100 text-amber-700",
    hired: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
};

export default function CandidateDashboard({ user, data, loading }) {
    // Track which application rows are expanded
    const [expandedApps, setExpandedApps] = useState({});

    if (loading) {
        return (
            <div className="space-y-10 animate-fade-in">
                {/* Stats Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm">
                            <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
                            <Skeleton className="h-8 w-24 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-10 w-48 mb-6" />
                        <div className="bg-white rounded-[2.5rem] p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-3xl" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                        <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
        );
    }

    const profileCompletion = data?.profileCompletion || 0;
    const isProfileIncomplete = profileCompletion < 80;

    const toggleExpand = (id) =>
        setExpandedApps((prev) => ({ ...prev, [id]: !prev[id] }));

    const stats = [
        { label: "Applied Jobs", value: data?.stats?.applied || "0", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Saved Jobs", value: data?.stats?.saved || "0", icon: Bookmark, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Interviews", value: data?.stats?.interviews || "0", icon: User, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Profile Status", value: `${profileCompletion}%`, icon: TrendingUp, color: profileCompletion >= 80 ? "text-emerald-600" : "text-orange-600", bg: profileCompletion >= 80 ? "bg-emerald-50" : "bg-orange-50" },
    ];

    const recentApplications = data?.applications || [];
    const missingSkills = data?.missingSkills || [];

    // Applications with rejection feedback
    const rejectedWithFeedback = recentApplications.filter(
        (app) => app.status === "rejected" && app.feedback?.missingSkills?.length > 0
    );

    return (
        <div className="space-y-10 animate-fade-in duration-500">
            {/* Profile Incomplete Warning */}
            {isProfileIncomplete && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-[2rem] p-8 shadow-lg transform transition-all hover:scale-[1.01] duration-300">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-orange-100 rounded-2xl">
                            <User className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Complete Your Profile</h3>
                            <p className="text-slate-600 font-medium mb-4 leading-relaxed">
                                Your profile is {profileCompletion}% complete. Complete your profile to increase your chances of getting hired by up to 70%!
                            </p>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {!data?.profile?.bio && <span className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-700">Add Bio</span>}
                                {!data?.profile?.skills?.length && <span className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-700">Add Skills</span>}
                                {!data?.profile?.experience?.length && <span className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-700">Add Experience</span>}
                                {!data?.profile?.education?.length && <span className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-700">Add Education</span>}
                                {!data?.profile?.photoURL && <span className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-700">Add Photo</span>}
                            </div>
                            <Link href="/profile/edit" className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-black hover:bg-orange-700 transition-all">
                                Complete Profile Now <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const content = (
                        <div key={stat.label} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-black">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    +12%
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 mb-1.5 tracking-tight">{stat.value}</h3>
                            <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>
                    );

                    if (stat.label === "Saved Jobs") {
                        return (
                            <Link key={stat.label} href="/saved-jobs">
                                {content}
                            </Link>
                        );
                    }
                    if (stat.label === "Applied Jobs") {
                        return (
                            <Link key={stat.label} href="/applications">
                                {content}
                            </Link>
                        );
                    }
                    return content;
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Applications */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-indigo-600" />
                            </div>
                            Recent Applications
                        </h2>
                        <Link href="/applications" className="group flex items-center gap-1.5 text-indigo-600 text-sm font-black bg-indigo-50/50 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl transition-all">
                            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
                        {recentApplications.length > 0 ? (
                            recentApplications.map((app, i) => {
                                const isExpanded = expandedApps[app._id || i];
                                const statusStyle = STATUS_STYLES[app.status] || "bg-slate-100 text-slate-600";

                                return (
                                    <div key={app._id || i} className="border-b border-slate-50 last:border-0 rounded-3xl">
                                        {/* Header row */}
                                        <div className="group p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/50 transition-all rounded-3xl">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all shrink-0">
                                                    {(app.company || "?")[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{app.jobTitle}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-sm font-bold text-slate-500">{app.company}</p>
                                                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                                        <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0">
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${statusStyle}`}>
                                                    {app.status}
                                                </span>
                                                {/* Expand / collapse Live Pulse */}
                                                <button
                                                    onClick={() => toggleExpand(app._id || i)}
                                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                                                    aria-label={isExpanded ? "Collapse timeline" : "View timeline"}
                                                    title={isExpanded ? "Collapse" : "View Live Pulse"}
                                                >
                                                    {isExpanded
                                                        ? <ChevronUp className="w-5 h-5" />
                                                        : <ChevronRight className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Live Pulse Timeline (expandable) */}
                                        {isExpanded && (
                                            <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                    Application Live Pulse
                                                </p>
                                                <ApplicationPulseTracker
                                                    application={app}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 text-center text-slate-500 font-medium">
                                No applications found. Start your search now!
                            </div>
                        )}
                    </div>

                    {/* Gap-to-Growth Feedback Section */}
                    {rejectedWithFeedback.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-slate-900 px-2 flex items-center gap-3">
                                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-amber-500" />
                                </div>
                                Your Growth Plan
                            </h3>
                            {rejectedWithFeedback.map((app, i) => (
                                <GrowthFeedbackCard
                                    key={app._id || i}
                                    feedback={app.feedback}
                                    jobTitle={app.jobTitle}
                                    company={app.company}
                                />
                            ))}
                        </div>
                    )}

                    {/* AI Recommendations Card */}
                    <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                            <div className="max-w-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-indigo-500/20 backdrop-blur-md p-3 rounded-2xl border border-indigo-400/30">
                                        <Star className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
                                    </div>
                                    <span className="text-indigo-300 text-xs font-black uppercase tracking-[0.2em]">SkillMatch Spotlight</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight tracking-tight">Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">career profile!</span></h3>
                                {missingSkills.length > 0 && (
                                    <div className="mb-6 space-y-2">
                                        <p className="text-slate-400 font-semibold mb-2">Missing skills for applied jobs:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {missingSkills.map(skill => (
                                                <span key={skill} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-400/20">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="text-slate-400 mb-8 font-semibold text-lg leading-relaxed">Users with matching skills get 4x more employer inquiries.</p>
                                <Link href="/jobs" className="inline-flex items-center gap-3 bg-white text-[#0f172a] px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 hover:scale-105 transition-all active:scale-95 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]">
                                    Find New Jobs <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-[100px]" />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-8">Role-Based Insights</h3>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-sm font-black text-slate-500 mb-3 uppercase tracking-wider">
                                    <span>Profile Strength</span>
                                    <span className={profileCompletion >= 80 ? "text-emerald-600" : "text-orange-600"}>{profileCompletion}%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner">
                                    <div
                                        className={`h-full rounded-full shadow-lg ${profileCompletion >= 80 ? "bg-emerald-600 shadow-emerald-200" : "bg-orange-500 shadow-orange-200"}`}
                                        style={{ width: `${profileCompletion}%` }}
                                    />
                                </div>
                                {profileCompletion < 80 && (
                                    <Link href="/profile/edit" className="mt-4 text-sm text-orange-600 font-bold hover:underline flex items-center gap-1">
                                        Complete your profile <ChevronRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="mt-10 p-5 bg-slate-50 rounded-3xl border border-slate-100 italic font-medium text-slate-500 text-sm leading-relaxed">
                            &quot;Job seekers who keep their dashboard updated are 30% more likely to get noticed by recruiters.&quot;
                        </div>
                        <button className="w-full mt-8 py-4 bg-white border-2 border-slate-100 text-slate-900 text-[14px] font-black rounded-2xl hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-[0.98]">
                            Manage Job Alerts
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
