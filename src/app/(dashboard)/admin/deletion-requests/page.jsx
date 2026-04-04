"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { API_BASE } from "../../../lib/apiClient";
import { AlertTriangle, Loader2, AlertCircle, Search, Building, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DeletionRequestsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const verifyAdminAndFetch = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/api/auth/profile/${user.uid}`);
        const profileData = await profileRes.json();
        
        if (profileData?.data?.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        const res = await fetch(`${API_BASE}/api/admin/jobs/delete-requests`);
        const json = await res.json();
        if (json.success) {
          setJobs(json.data || []);
        } else {
          setError(json.message || "Failed to fetch requests");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) verifyAdminAndFetch();
  }, [authLoading, isAuthenticated, user, router]);

  const handleAction = async (jobId, action) => {
    try {
      const url = action === "delete" 
        ? `${API_BASE}/api/admin/jobs/${jobId}` 
        : `${API_BASE}/api/admin/jobs/${jobId}/approve`; // Restore basically re-approves it
      
      const res = await fetch(url, { method: action === "delete" ? "DELETE" : "PUT" });
      const result = await res.json();

      if (result.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        setActionMsg({ type: "success", text: action === "delete" ? "Job deleted permanently." : "Job restored to public view." });
        setTimeout(() => setActionMsg(null), 3000);
      } else {
        setActionMsg({ type: "error", text: result.message || "Action failed." });
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      setActionMsg({ type: "error", text: "An error occurred." });
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast */}
      {actionMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg font-semibold text-sm text-white ${
            actionMsg.type === "error" ? "bg-red-600" : "bg-emerald-600"
          } animate-fade-in`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span className="text-amber-400 font-bold tracking-wider">
              Admin Zone
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Deletion Requests
          </h1>
          <p className="text-slate-400 mt-1">
            Review and confirm job deletion requests from recruiters.
          </p>
        </div>
        <div className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-lg font-bold shrink-0 text-center">
          {jobs.length} Requests
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 premium-shadow">
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by role or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
            />
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${job._id}`} target="_blank" className="font-bold text-lg text-slate-900 hover:text-amber-600 transition-colors truncate block">
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {job.company}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                      <span className="flex items-center gap-1.5 text-red-500"><Trash2 className="w-4 h-4" /> Pending Deletion</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    <button
                      onClick={() => handleAction(job._id, "delete")}
                      className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => handleAction(job._id, "restore")}
                      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Clear Queue</h3>
              <p className="text-slate-500 font-medium">There are no pending deletion requests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
