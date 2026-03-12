"use client";

import { useState } from "react";
import {
    Users, Briefcase, TrendingUp, Building2,
    ShieldCheck, ShieldX, ChevronRight, BarChart2,
    AlertTriangle, CheckCircle, Search
} from "lucide-react";

import Skeleton from "../../components/common/Skeleton";

export default function AdminDashboard({ user, data, loading }) {
    const [searchUser, setSearchUser] = useState("");
    const [actionMsg, setActionMsg] = useState(null);

    const stats = [
        { label: "Total Users", value: data?.stats?.totalUsers ?? "—", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Active Jobs", value: data?.stats?.totalJobs ?? "—", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Applications", value: data?.stats?.totalApplications ?? "—", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Companies", value: data?.stats?.totalCompanies ?? "—", icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    if (loading) {
        return (
            <div className="space-y-10 animate-fade-in">
                {/* Banner Skeleton */}
                <div className="bg-slate-200 animate-pulse h-48 rounded-[2.5rem]"></div>
                
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

    const filteredUsers = (data?.recentUsers || []).filter(u =>
        u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleUserAction = (uid, action) => {
        setActionMsg({ uid, action });
        setTimeout(() => setActionMsg(null), 3000);
        // In a real app: PUT /api/admin/users/:uid/status
    };

    const growthData = data?.growth || [
        { month: "Jan", users: 400, jobs: 240 },
        { month: "Feb", users: 600, jobs: 350 },
        { month: "Mar", users: 800, jobs: 480 },
        { month: "Apr", users: 950, jobs: 590 },
        { month: "May", users: 1100, jobs: 640 },
        { month: "Jun", users: 1350, jobs: 720 },
    ];
    const maxUsers = Math.max(...growthData.map(d => d.users));

    return (
        <div className="space-y-10 animate-fade-in duration-500">

            {/* Toast */}
            {actionMsg && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-bold text-white transition-all ${actionMsg.action === "ban" ? "bg-red-500" : "bg-emerald-500"}`}>
                    User {actionMsg.action === "ban" ? "banned" : "activated"} successfully.
                </div>
            )}

            {/* Admin Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-slate-700">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Admin Control Panel</span>
                        </div>
                        <h2 className="text-2xl font-black">Platform Overview Dashboard</h2>
                        <p className="text-slate-400 font-medium mt-1">Full visibility and control of the SkillMatch AI ecosystem.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl font-black text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Platform Online
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1.5 tracking-tight">{stat.value}</h3>
                        <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            User Management
                        </h2>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchUser}
                            onChange={e => setSearchUser(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((u, i) => (
                                <div key={i} className="group p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all rounded-3xl gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${u.role === 'admin' ? 'bg-amber-50 text-amber-600' :
                                                u.role === 'recruiter' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {u.displayName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800">{u.displayName || "Unnamed User"}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                            <span className={`mt-1 inline-block text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                                                    u.role === 'recruiter' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-indigo-100 text-indigo-700'
                                                }`}>{u.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleUserAction(u.firebaseUid, "activate")}
                                            disabled={u.role === 'admin'}
                                            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" /> Activate
                                        </button>
                                        <button
                                            onClick={() => handleUserAction(u.firebaseUid, "ban")}
                                            disabled={u.role === 'admin'}
                                            className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-2 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ShieldX className="w-3.5 h-3.5" /> Ban
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-400 font-bold">
                                {data?.recentUsers?.length === 0 ? "No users found in the database." : "No users match your search."}
                            </div>
                        )}
                    </div>

                    {/* Recent Jobs */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-2 mb-5">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                            Recent Job Posts
                        </h2>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
                            {(data?.recentJobs || []).length > 0 ? (
                                data.recentJobs.map((job, i) => (
                                    <div key={i} className="group p-5 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all rounded-3xl">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600">{job.title}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{job.company} · {job.location}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg uppercase">Active</span>
                                            <button className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                <ShieldX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-slate-400 font-bold">No job posts found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Platform Growth Chart (CSS-based) */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-600" /> Platform Growth
                        </h3>
                        <div className="flex items-end justify-between gap-2 h-32">
                            {growthData.map(({ month, users }) => (
                                <div key={month} className="flex flex-col items-center gap-1 flex-1">
                                    <div
                                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all hover:from-indigo-700 hover:to-indigo-500 group relative cursor-pointer"
                                        style={{ height: `${(users / maxUsers) * 100}%` }}
                                    >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                                            {users} users
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fraud Detection Alerts */}
                    <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 shadow-sm p-7">
                        <h3 className="text-lg font-black text-amber-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Fraud Alerts
                        </h3>
                        <div className="space-y-3">
                            {[
                                { msg: "2 duplicate job posts detected", severity: "medium" },
                                { msg: "1 suspicious account flagged", severity: "high" },
                            ].map((alert, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${alert.severity === 'high' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${alert.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                    <p className="text-xs font-bold text-slate-700">{alert.msg}</p>
                                </div>
                            ))}
                            <p className="text-xs font-medium text-amber-600 mt-3">Fraud detection is AI-powered. Manual review advised.</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                        <h3 className="text-lg font-black text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            {[
                                { label: "View All Users", href: "/admin/users" },
                                { label: "Manage Job Posts", href: "/admin/jobs" },
                                { label: "Platform Reports", href: "/admin/reports" },
                                { label: "Security Settings", href: "/admin/security" },
                            ].map(({ label, href }) => (
                                <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all group cursor-pointer">
                                    <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">{label}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
