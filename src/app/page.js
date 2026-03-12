"use client";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Link from "next/link";
import { 
    Search, MapPin, Building2, Star, Users, Briefcase, 
    TrendingUp, PartyPopper, X, ShieldCheck, XCircle, 
    AlertTriangle, MessageSquareOff, CheckCircle2, Target, 
    ChevronRight, ArrowRight
} from "lucide-react";
import React, { useState, useEffect } from "react";
import ApplyModal from "./components/form/ApplyModal";
import { useAuth } from "./lib/AuthContext";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob] = useState({ title: "Senior Product Designer", company: "TechFlow AI" });

  /* ── Welcome Popup ─────────────────────────────── */
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only show if the user was just redirected from sign-in
    if (typeof window !== "undefined" && sessionStorage.getItem("showWelcome") === "1") {
      sessionStorage.removeItem("showWelcome");
      // Wait a tick for the user object to populate from Firebase
      const show = setTimeout(() => setShowWelcome(true), 400);
      return () => clearTimeout(show);
    }
  }, []);

  const dismissWelcome = () => {
    setWelcomeLeaving(true);
    setTimeout(() => {
      setShowWelcome(false);
      setWelcomeLeaving(false);
    }, 400);
  };

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!showWelcome) return;
    const hide = setTimeout(() => dismissWelcome(), 4000);
    return () => clearTimeout(hide);
  }, [showWelcome]);

  // Derive friendly name
  const displayName = user?.displayName
    ? user.displayName.split(" ")[0]
    : user?.email?.split("@")[0] ?? "there";

  const handleApply = () => setIsModalOpen(true);

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Navbar />

      {/* ── Welcome Back Popup ── */}
      {showWelcome && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-400 ${welcomeLeaving
            ? "opacity-0 translate-y-4 scale-95"
            : "opacity-100 translate-y-0 scale-100"
            }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
          role="status"
          aria-live="polite"
        >
          <div className="absolute bottom-0 left-0 h-[3px] bg-indigo-600/20 w-full rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-welcome-bar" />
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 rounded-2xl px-5 py-4 min-w-[300px] max-w-[420px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <PartyPopper className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Welcome back 👋</p>
              <p className="text-[16px] font-black text-slate-900 truncate">{displayName}!</p>
            </div>
            <button onClick={dismissWelcome} className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <main className="pt-24 md:pt-32 pb-20 overflow-x-clip">
        {/* ── Section 1: Hero & Dashboard Mockup ── */}
        <section className="relative px-6 text-center mb-32">
          {/* Hero Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl aspect-square bg-indigo-600/5 rounded-full blur-[120px] -z-10 animate-glow-pulse pointer-events-none"></div>

          <div className="max-w-4xl mx-auto animate-reveal-up">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                <Star className="w-3 h-3 fill-indigo-600" /> 2,000+ AI-Vetted Developer Roles
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] mb-8 text-center px-2">
              Hire <span className="text-indigo-600">Skills</span>, Not Just <span className="text-blue-500 underline decoration-blue-100 underline-offset-8">Resumes</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed text-center px-4">
              The high-performance platform for developers to verify expertise and for companies to hire with clinical precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 px-4">
              <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-black text-lg sm:text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 group">
                Get Started Now <ArrowRight className="inline-block ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-8 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-black text-lg sm:text-xl hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-95">
                <TrendingUp className="w-5 h-5" />
                View How It Works
              </button>
            </div>
          </div>

          {/* Large Dashboard Mockup Visualization */}
          <div className="relative max-w-6xl mx-auto mt-20 px-2 sm:px-6 animate-reveal-up delay-200">
            <div className="relative bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] p-2 md:p-6 overflow-hidden">
                <div className="aspect-[16/10] bg-slate-50/50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 relative overflow-hidden backdrop-blur-3xl">
                    {/* Floating Component: Skill Verified */}
                    <div className="absolute top-[10%] left-[5%] md:left-[-5%] bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-48 sm:w-64 text-left hidden sm:block animate-float-gentle active:scale-105 transition-transform cursor-pointer">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 rotate-3">
                            <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-lg mb-0.5 sm:mb-1">Skill Verified</h4>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-6">React.js Advanced Assessment</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] sm:text-[10px] font-black text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl uppercase tracking-wider">Top 1%</span>
                            <div className="flex -space-x-2 sm:-space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center font-black text-[8px] sm:text-[10px] text-indigo-600">DK</div>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Component: Application Pulse */}
                    <div className="absolute bottom-[10%] right-[3%] md:right-[-5%] bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 w-64 sm:w-80 text-left hidden sm:block animate-float-gentle delay-300">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Pulse</span>
                            <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-50 rounded-lg">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase">Live</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">Stripe</p>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 truncate">Senior Frontend Engineer</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center relative px-2">
                             <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
                             {[
                                {label: "Applied", active: true},
                                {label: "Interview", active: true, current: true},
                                {label: "Offer", active: false}
                             ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2">
                                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm ${step.current ? 'bg-indigo-600 ring-2 sm:ring-4 ring-indigo-50' : step.active ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                                    <span className={`text-[7px] sm:text-[9px] uppercase tracking-widest font-black ${step.current ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Browser UI Elements Background */}
                    <div className="mt-16 sm:mt-24 px-6 sm:px-12 space-y-6 sm:space-y-10 opacity-30 select-none pointer-events-none">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-32 sm:w-48 h-8 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl"></div>
                            <div className="w-16 sm:w-24 h-4 sm:h-5 bg-slate-100 rounded-full"></div>
                            <div className="w-16 sm:w-24 h-4 sm:h-5 bg-slate-100 rounded-full"></div>
                            <div className="w-24 sm:w-32 h-8 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl ml-auto"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 sm:h-48 bg-slate-200/50 border border-slate-200 rounded-[1.5rem] sm:rounded-[2.5rem]"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: The Transparency Gap ── */}
        <section className="py-20 sm:py-32 bg-slate-50/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 sm:mb-20 animate-reveal-up">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">The Transparency Gap</h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg">Why the current hiring process is broken for everyone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full border border-slate-100 shadow-xl flex items-center justify-center z-10 hidden md:flex font-black text-slate-300">VS</div>
                
                {/* Traditional Side */}
                <div className="bg-white p-8 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group animate-reveal-up delay-100">
                    <div className="flex items-center gap-3 mb-8 sm:mb-10 text-left">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Traditional Platforms</h3>
                    </div>
                    <ul className="space-y-6 sm:space-y-8">
                        {[
                            { text: "Apply → Wait → Infinite Ghosting", icon: <MessageSquareOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" /> },
                            { text: "Unverified 'Fake' Skills & Buzzwords", icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" /> },
                            { text: "Zero Transparency on Application Status", icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" /> },
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4 sm:gap-6 items-center text-left">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">{item.icon}</div>
                                <span className="text-slate-500 font-bold text-base sm:text-lg leading-tight">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* SkillMatch Side */}
                <div className="bg-white p-8 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[3.5rem] border-4 border-indigo-600/5 shadow-[0_0_80px_-20px_rgba(79,70,229,0.2)] relative overflow-hidden animate-reveal-up delay-200">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] sm:text-[10px] font-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-bl-2xl sm:rounded-bl-3xl uppercase tracking-widest shadow-xl">The Solution</div>
                    <div className="flex items-center gap-3 mb-8 sm:mb-10 text-left">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <h3 className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">SkillMatch AI</h3>
                    </div>
                    <ul className="space-y-6 sm:space-y-8">
                        {[
                            { text: "Verify → Apply → Track → Improve", icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" /> },
                            { text: "Immutable Verified Skill Badges", icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" /> },
                            { text: "Real-time Application Pulse Tracking", icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" /> },
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4 sm:gap-6 items-center text-left">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">{item.icon}</div>
                                <span className="text-slate-900 font-black text-base sm:text-lg leading-tight">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Engineered for Talent ── */}
        <section className="py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center md:text-left mb-16 sm:mb-24 animate-reveal-up">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">Engineered for Talent</h2>
                    <p className="text-slate-500 font-medium text-lg sm:text-xl max-w-2xl">A purpose-built platform to bridge the gap between human skill and global opportunity.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-16">
                    {[
                        { title: "Skill Verification Tests", desc: "Rigorous, adaptive AI-powered testing that validates your technical stack in real-world scenarios.", icon: <ShieldCheck />, delay: "delay-100" },
                        { title: "Application Pulse Tracker", desc: "See exactly where your application stands. Get notified the second a recruiter views your profile.", icon: <TrendingUp />, delay: "delay-200" },
                        { title: "AI Job Matching", desc: "Smart algorithms that bypass keyword filters and match your actual verified skills to the perfect roles.", icon: <Target />, delay: "delay-300" },
                    ].map((feat, i) => (
                        <div key={i} className={`group relative text-left animate-reveal-up ${feat.delay}`}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500">
                                {React.cloneElement(feat.icon, { className: `w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 group-hover:text-white transition-colors` })}
                            </div>
                            <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4">{feat.title}</h4>
                            <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── Section 4: Total Control (Profile Mockup) ── */}
        <section className="py-20 sm:py-32 bg-slate-900 text-white rounded-[2rem] sm:rounded-[4rem] mx-4 sm:mx-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none px-4 sm:px-0"></div>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-20 items-center">
                <div className="text-left space-y-6 sm:space-y-8 relative z-10 animate-reveal-up">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">Total Control of Your Career</h2>
                    <p className="text-slate-400 font-medium text-lg sm:text-xl leading-relaxed">
                        Your profile is your proof. Manage assessments, track status in real-time, and close deals based on merit, not just networking.
                    </p>
                    <div className="pt-2 sm:pt-4 flex flex-wrap gap-3 sm:gap-4">
                        <div className="bg-slate-800/50 border border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
                             <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                             <span className="font-bold text-sm sm:text-base">Verified Expertise</span>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
                             <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                             <span className="font-bold text-sm sm:text-base">Real-time Feedback</span>
                        </div>
                    </div>
                </div>

                {/* Profile Mockup Visualization */}
                <div className="relative group animate-reveal-up delay-200 mt-10 lg:mt-0">
                     {/* Floating Badge - Hidden on very small mobile to prevent overlap */}
                     <div className="absolute top-5 sm:top-10 -left-4 sm:-left-10 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float-gentle active:scale-110 transition-all cursor-pointer z-20">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                             <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                         </div>
                         <span className="text-slate-900 font-black text-[10px] sm:text-sm whitespace-nowrap">React Assessment Passed</span>
                     </div>
                     
                     {/* Floating Notification */}
                     <div className="absolute bottom-5 sm:bottom-10 -right-2 sm:-right-5 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 animate-float-gentle delay-500 z-20">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                             <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                         </div>
                         <span className="text-slate-900 font-black text-[10px] sm:text-sm whitespace-nowrap text-left">Netflix viewed your profile</span>
                     </div>

                     <div className="bg-slate-800/50 border border-slate-700 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] backdrop-blur-xl relative overflow-hidden">
                         <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                             <div className="w-14 h-14 sm:w-20 sm:h-20 bg-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl">DK</div>
                             <div className="text-left">
                                 <h4 className="text-xl sm:text-2xl font-black mb-1">Diptes Kundu</h4>
                                 <p className="text-slate-400 font-bold text-sm sm:text-base">Full Stack Engineer</p>
                             </div>
                         </div>
                         <div className="space-y-4 sm:space-y-6">
                             <div className="h-3 sm:h-4 bg-slate-700/50 rounded-full w-full"></div>
                             <div className="h-3 sm:h-4 bg-slate-700/50 rounded-full w-3/4"></div>
                             <div className="h-3 sm:h-4 bg-slate-700/50 rounded-full w-1/2"></div>
                         </div>
                         <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4">
                             <div className="h-16 sm:h-20 bg-slate-700/30 rounded-xl sm:rounded-2xl border border-slate-600/50"></div>
                             <div className="h-16 sm:h-20 bg-indigo-600/40 rounded-xl sm:rounded-2xl border border-indigo-500/50"></div>
                             <div className="h-16 sm:h-20 bg-slate-700/30 rounded-xl sm:rounded-2xl border border-slate-600/50"></div>
                         </div>
                         <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-slate-700/50 flex justify-between items-center">
                             <div className="w-24 sm:w-32 h-5 sm:h-6 bg-slate-700/50 rounded-full"></div>
                             <div className="w-16 sm:w-20 h-7 sm:h-8 bg-indigo-600 rounded-lg sm:rounded-xl"></div>
                         </div>
                     </div>
                </div>
            </div>
        </section>

        {/* ── Section 5: Path to Your Next Role ── */}
        <section className="py-20 sm:py-32 text-center">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-16 sm:mb-20 animate-reveal-up">The Path to Your Next Role</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative animate-reveal-up delay-100">
                    {/* Connecting line on desktop */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10 hidden md:block"></div>
                    
                    {[
                        {step: "1", title: "Create Profile", desc: "Our AI builds a detailed map of your technical expertise."},
                        {step: "2", title: "Verify Skills", desc: "Complete specialized assessments to earn trust-verified badges."},
                        {step: "3", title: "Apply & Track", desc: "Apply to vetted jobs and monitor progress with full transparency."}
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center group">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl text-slate-900 mb-6 sm:mb-8 group-hover:scale-110 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all duration-300 shadow-sm z-10">
                                {item.step}
                            </div>
                            <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4">{item.title}</h4>
                            <p className="text-slate-500 font-medium max-w-[280px] leading-relaxed text-sm sm:text-base">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── Section 6: Stats Footer ── */}
        <section className="py-16 sm:py-20 border-t border-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 text-left sm:text-center animate-reveal-up">
                     {[
                        {val: "5,000+", label: "Verified Developers"},
                        {val: "300+", label: "Partner Companies"},
                        {val: "15,000+", label: "Assessments Taken"},
                        {val: "92%", label: "Hiring Accuracy"}
                     ].map((stat, i) => (
                        <div key={i} className="group">
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-1.5 sm:mb-2 group-hover:text-indigo-600 transition-colors">{stat.val}</h3>
                            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                     ))}
                </div>

                {/* Final CTA */}
                <div className="mt-24 sm:mt-40 text-center animate-reveal-up delay-200">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 leading-tight">Ready to hire for skills or prove your expertise?</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-6">
                        <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-[2rem] font-black text-lg sm:text-xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95">
                            Join SkillMatch AI
                        </Link>
                        <Link href="/jobs" className="w-full sm:w-auto bg-slate-900 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-[2rem] font-black text-lg sm:text-xl hover:bg-black transition-all shadow-xl active:scale-95">
                            Browse Open Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <Footer />

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobTitle={selectedJob.title}
        companyName={selectedJob.company}
      />
    </div>
  );
}
