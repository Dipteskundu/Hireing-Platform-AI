"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  User,
  Bookmark,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import Avatar from "../common/Avatar";
import NotificationPanel from "../Notifications/NotificationPanel";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/notifications/${user.uid}`);
        const json = await res.json();
        if (json.success && json.data) {
          setUnreadCount(json.data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds for dynamics
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.uid]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "About Us", href: "/about" },
  ];

  const userDisplayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitial = userDisplayName[0]?.toUpperCase() ?? "U";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-slate-100"
          : "bg-white border-b border-slate-100"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
       
              <span className="text-[17px] font-black text-slate-900 tracking-tight">
                SkillMatch<span className="text-indigo-600">AI</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-[14px] font-semibold transition-colors ${isActive
                      ? "text-indigo-600"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-3 ml-auto">

              {/* ─── LOGGED OUT STATE ─── */}
              {!isAuthenticated && (
                <>
                  {/* Search Input */}
                  <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 hover:border-slate-300 focus-within:border-indigo-400 focus-within:bg-white transition-all w-52">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search jobs or skills..."
                      className="bg-transparent text-[13px] text-slate-700 placeholder-slate-400 outline-none w-full"
                    />
                  </div>

                  {/* Log In */}
                  <Link
                    href="/signin"
                    className="hidden md:inline-flex text-[14px] font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-2"
                  >
                    Log In
                  </Link>

                  {/* Sign Up */}
                  <Link
                    href="/signup"
                    className="hidden md:inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm active:scale-95"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* ─── LOGGED IN STATE ─── */}
              {isAuthenticated && (
                <>
                  {/* Search Icon */}
                  <button
                    onClick={() => setSearchOpen((v) => !v)}
                    className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-[18px] h-[18px]" />
                  </button>

                  {/* Bell Icon */}
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="hidden md:flex relative items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="sr-only">{unreadCount}</span>
                      </span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative hidden md:block" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
                    >
                      {/* Name + Role */}
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-slate-900 leading-tight line-clamp-1 max-w-[110px]">
                          {userDisplayName}
                        </p>
                        <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide leading-tight">
                          PRO MEMBER
                        </p>
                      </div>

                      {/* Avatar */}
                      <Avatar
                        src={user?.photoURL}
                        alt={userDisplayName}
                        size="w-9 h-9"
                        ring={profileOpen}
                      />

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user?.photoURL}
                              alt={userDisplayName}
                              size="w-10 h-10"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {userDisplayName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        {[
                          { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
                          { icon: User, label: "My Profile", href: "/profile" },
                          { icon: Settings, label: "Edit Profile", href: "/profile/edit" }, // Added Edit Profile
                          { icon: Bookmark, label: "Saved Jobs", href: "/saved-jobs" },
                          { icon: FileText, label: "My Applications", href: "/applications" },
                          { icon: Lightbulb, label: "Skill Gap Detection", href: "/skill-gap-detection" },
                        ].map(({ icon: Icon, label, href }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              router.push(href);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            {label}
                          </button>
                        ))}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              setProfileOpen(false);
                              await logout();
                              router.push("/");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ─── Mobile Hamburger ─── */}
              <button
                type="button"
                className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Inline Search Popup (logged-in, desktop) ─── */}
        {isAuthenticated && searchOpen && (
          <div className="hidden md:block border-t border-slate-100 bg-white px-6 py-3 animate-fade-in">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none w-full"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Mobile Menu ─── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-slide-in">
            <div className="px-5 pt-5 pb-8 space-y-6">

              {/* Search */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search jobs or skills..."
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                />
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-3 rounded-xl text-[15px] font-semibold transition-colors ${isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">

                {/* Logged Out CTA */}
                {!isAuthenticated && (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3 text-center text-[15px] font-semibold text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3 text-center text-[15px] font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {/* Logged In CTA */}
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-3 px-1 mb-2">
                      <Avatar
                        src={user?.photoURL}
                        alt={userDisplayName}
                        size="w-11 h-11"
                        ring={true}
                      />
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">{userDisplayName}</p>
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">PRO MEMBER</p>
                      </div>
                    </div>

                    {[
                      { label: "Dashboard", href: "/dashboard" },
                      { label: "My Profile", href: "/profile" },
                      { label: "Saved Jobs", href: "/saved-jobs" },
                      { label: "My Applications", href: "/applications" },
                      { label: "Skill Gap Detection", href: "/skill-gap-detection" },
                    ].map(({ label, href }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setMobileOpen(false); router.push(href); }}
                        className="w-full py-3 text-center text-[14px] font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={async () => {
                        setMobileOpen(false);
                        await logout();
                        router.push("/");
                      }}
                      className="w-full py-3 text-center text-[14px] font-semibold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to push page content below fixed navbar */}
      <div className="h-16" />

      {/* Global Notification Panel */}
      <NotificationPanel
        uid={user?.uid}
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        setParentUnreadCount={setUnreadCount}
      />
    </>
  );
}
