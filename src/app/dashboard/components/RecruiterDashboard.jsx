"use client";

import { useState, useEffect } from "react";
import {
    Briefcase, Users, TrendingUp, Target, ChevronRight,
    Plus, Clock, CheckCircle, X, Star, BarChart2, Mail, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../lib/firebaseClient";
import Skeleton from "../../components/common/Skeleton";

export default function RecruiterDashboard({ user, data, loading }) {
    const [liveApplicantCounts, setLiveApplicantCounts] = useState({});
    const [showPostJob, setShowPostJob] = useState(false);
    const [jobForm, setJobForm] = useState({
        title: "", company: "", location: "", salaryRange: "",
        experienceLevel: "", employmentType: "", skills: ""
    });
    const [posting, setPosting] = useState(false);
    const [postMsg, setPostMsg] = useState(null);

    useEffect(() => {
        if (!data?.jobs) return;

        const unsubscribes = data.jobs.map(job => {
            const countRef = ref(rtdb, `jobApplicants/${job._id}`);
            return onValue(countRef, (snapshot) => {
                const val = snapshot.val();
                if (val && val.count !== undefined) {
                    setLiveApplicantCounts(prev => ({
                        ...prev,
                        [job._id]: val.count
                    }));
                }
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [data?.jobs]);

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

                <div className="bg-slate-200 animate-pulse h-48 rounded-[2.5rem]"></div>

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

    const stats = [
        { label: "Active Jobs", value: data?.stats?.activeJobs ?? "0", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Applicants", value: data?.stats?.totalApplicants ?? "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Shortlisted", value: data?.stats?.shortlisted ?? "0", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Interviews Set", value: data?.stats?.interviews ?? "0", icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const handlePostJob = async (e) => {
        e.preventDefault();
        setPosting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...jobForm,
                    skills: jobForm.skills.split(",").map(s => s.trim()).filter(Boolean),
                }),
            });
            const result = await res.json();
            if (result.success) {
                setPostMsg({ type: "success", text: "Job posted successfully!" });
                setJobForm({ title: "", company: "", location: "", salaryRange: "", experienceLevel: "", employmentType: "", skills: "" });
                setShowPostJob(false);
            } else {
                setPostMsg({ type: "error", text: result.message });
            }
        } catch {
            setPostMsg({ type: "error", text: "Failed to post job." });
        }
        setPosting(false);
        setTimeout(() => setPostMsg(null), 4000);
    };

    const handleStatusChange = async (appId, newStatus) => {
        let feedback = null;
        if (newStatus === "rejected") {
            feedback = prompt("Please provide a reason or feedback for this rejection:");
            if (feedback === null) return; // Cancelled
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/applications/${appId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, feedback }),
            });
            const result = await res.json();
            if (result.success) {
                // Quick hack to update UI optimally, might replace with proper refetch later
                alert("Status updated successfully.");
            }
        } catch (err) {
            console.error("Status update failed:", err);
            alert("Failed to update status.");
        }
    };

    return (
        <div className="space-y-10 animate-fade-in duration-500">

            {/* Post Job Toast */}
            {postMsg && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-bold text-white transition-all ${postMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {postMsg.text}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-black">
                                <TrendingUp className="w-3.5 h-3.5" /> +8%
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1.5 tracking-tight">{stat.value}</h3>
                        <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Post Job Panel */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black mb-2">Post a New Job</h2>
                        <p className="text-indigo-200 font-medium">Reach thousands of qualified candidates instantly.</p>
                    </div>
                    <button
                        id="post-job-btn"
                        onClick={() => setShowPostJob(!showPostJob)}
                        className="flex items-center gap-3 bg-white text-indigo-700 px-6 py-3.5 rounded-2xl font-black hover:bg-indigo-50 transition-all active:scale-95 shrink-0 shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        {showPostJob ? "Close Form" : "Post New Job"}
                    </button>
                </div>
            </div>

            {/* Post Job Form */}
            {showPostJob && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Job Details</h3>
                    <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { label: "Job Title *", key: "title", placeholder: "e.g. Senior React Developer" },
                            { label: "Company *", key: "company", placeholder: "e.g. Google" },
                            { label: "Location *", key: "location", placeholder: "e.g. Remote / New York" },
                            { label: "Salary Range", key: "salaryRange", placeholder: "e.g. $80k - $120k" },
                            { label: "Experience Level", key: "experienceLevel", placeholder: "e.g. Mid-level / Senior" },
                            { label: "Employment Type", key: "employmentType", placeholder: "e.g. Full-time / Part-time" },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={jobForm[key]}
                                    onChange={e => setJobForm(f => ({ ...f, [key]: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    required={["title", "company", "location"].includes(key)}
                                />
                            </div>
                        ))}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Required Skills (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. React, Node.js, TypeScript"
                                value={jobForm.skills}
                                onChange={e => setJobForm(f => ({ ...f, skills: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={posting}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-indigo-200"
                            >
                                {posting ? "Posting..." : "Post Job Now"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Applications (Candidate Ranking) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            Recent Applicants
                        </h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
                        {(data?.recentApplications || []).length > 0 ? (
                            (data?.recentApplications || []).map((app, i) => (
                                <div key={i} className="group p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all rounded-3xl gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-xl text-indigo-400">
                                            {app.email?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{app.email}</h4>
                                            <p className="text-sm font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                {app.jobTitle} — {app.company}
                                            </p>
                                            {app.communicationScore != null && (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-xs font-bold text-indigo-600">
                                                        Communication: {app.communicationScore}/100
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 sm:mt-0 flex-wrap">
                                        <select
                                            defaultValue={app.status || "submitted"}
                                            onChange={e => handleStatusChange(app._id, e.target.value)}
                                            className="text-xs font-black border border-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-indigo-400 bg-white"
                                        >
                                            <option value="submitted">Submitted</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="selected">Selected</option>
                                        </select>
                                        <button
                                            onClick={async () => {
                                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/applications/${app._id}?role=recruiter`);
                                                const result = await res.json();
                                                if (result.success) {
                                                    alert("Applicant profile marked as seen.");
                                                }
                                            }}
                                            className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition-all"
                                        >
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            Review
                                        </button>
                                        <button className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all">
                                            <Mail className="w-3.5 h-3.5" />
                                            Contact
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-400 font-bold">
                                No applicants yet. Post a job to start receiving applications!
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Hiring Score Formula + Active Jobs */}
                <div className="space-y-6">
                    {/* Hiring Score Card */}
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-7 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                                <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">Hiring Score Formula</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "Skill Match", pct: "50%", color: "bg-indigo-500" },
                                    { label: "Test Score", pct: "30%", color: "bg-blue-500" },
                                    { label: "Experience", pct: "20%", color: "bg-cyan-500" },
                                ].map(({ label, pct, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-sm font-bold mb-1.5">
                                            <span className="text-slate-400">{label}</span>
                                            <span className="text-white font-black">{pct}</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full">
                                            <div className={`h-full ${color} rounded-full`} style={{ width: pct }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-500 text-xs font-medium mt-5 leading-relaxed">Candidates are ranked by our AI model using this formula.</p>
                        </div>
                    </div>

                    {/* Active Jobs */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                        <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-600" /> Active Jobs
                        </h3>
                        <div className="space-y-3">
                            {(data?.jobs || []).length > 0 ? (
                                data.jobs.map((job, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all group">
                                        <div>
                                            <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600">{job.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-slate-400 font-bold">{job.location}</p>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <p className="text-xs text-indigo-600 font-black">
                                                    {liveApplicantCounts[job._id] !== undefined
                                                        ? liveApplicantCounts[job._id]
                                                        : (job.applicantsCount || 0)} Applicants
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 font-medium">No active jobs yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
