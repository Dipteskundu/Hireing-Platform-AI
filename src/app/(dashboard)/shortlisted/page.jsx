"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import { API_BASE } from "../../lib/apiClient";
import { authedFetch } from "../../lib/authedFetch";
import { useRouter } from "next/navigation";
import {
  Star, User, Users, MapPin, Calendar, Send, Trash2, Eye, Loader2, X, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import PipelineLayout from "../../components/PipelineLayout/PipelineLayout";
import InterviewScheduler from "../../components/InterviewScheduler/InterviewScheduler";

export default function ShortlistedPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [shortlistedApps, setShortlistedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] = useState(null);

  const fetchShortlisted = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`${API_BASE}/api/applications/recruiter/${user.uid}`);
      const data = await res.json();
      if (data.success) {
        setShortlistedApps((data.applications || []).filter(app => app.status === "shortlisted"));
      }
    } catch (error) {
      console.error("Failed to fetch shortlisted:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchShortlisted();
  }, [user?.uid, fetchShortlisted]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setShortlistedApps(prev => prev.filter(app => app._id !== appId));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleRemoveFromShortlist = (appId) => {
    if (confirm("Remove this applicant from the shortlist?")) handleStatusChange(appId, "submitted");
  };

  const handleSendTask = (app) => router.push(`/task-assignment?jobId=${app.jobId}&appId=${app._id}`);

  const handleAssignTaskToAll = () => {
    if (shortlistedApps.length === 0) return;
    const jobId = shortlistedApps[0].jobId;
    router.push(`/task-assignment?jobId=${jobId}`);
  };

  const handleScheduleInterview = (applicant) => {
    setSelectedApplicantForInterview(applicant);
    setShowInterviewScheduler(true);
  };

  const handleInterviewScheduled = async (interviewData) => {
    try {
      const res = await authedFetch(user, `${API_BASE}/api/interviews/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewData),
      });
      const result = await res.json();
      if (result.success) {
        const applicationId = shortlistedApps.find((app) => app._id === interviewData.applicationId)?._id;
        if (applicationId) setShortlistedApps((prev) => prev.filter((app) => app._id !== applicationId));
      } else throw new Error(result.message);
    } catch (error) { throw error; }
  };

  const handleViewProfile = async (applicant) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/${applicant.firebaseUid}`);
      const data = await res.json();
      if (data.success) setSelectedApplicant(data.data);
    } catch {}
    setShowProfileModal(true);
  };

  const filteredApps = shortlistedApps.filter(app =>
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Link href="/signin" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold">Sign In</Link>
      </div>
    );
  }

  return (
    <PipelineLayout activePhase="shortlisted">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="relative flex-1 max-w-sm">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search shortlisted..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <button
          onClick={handleAssignTaskToAll}
          disabled={shortlistedApps.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          + Assign Task to All
        </button>
      </div>

      {/* Candidate Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading shortlisted candidates...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-indigo-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No shortlisted candidates</h3>
          <p className="text-slate-500 text-sm">
            {searchTerm ? "No results match your search." : 'Shortlist candidates from the "All Applicants" stage to see them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApps.map(applicant => (
            <div key={applicant._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{applicant.email}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{applicant.jobTitle}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    {applicant.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{applicant.location}</span>}
                    {applicant.createdAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(applicant.createdAt).toLocaleDateString()}</span>}
                  </div>
                  {applicant.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {applicant.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto border-t border-slate-100 grid grid-cols-4">
                <button onClick={() => handleViewProfile(applicant)} className="flex flex-col items-center justify-center py-3 text-slate-500 hover:bg-slate-50 text-xs gap-0.5 transition-colors" title="View Profile">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => handleSendTask(applicant)} className="flex flex-col items-center justify-center py-3 text-blue-600 hover:bg-blue-50 text-xs gap-0.5 transition-colors" title="Send Task">
                  <Send className="w-4 h-4" />
                </button>
                <button onClick={() => handleScheduleInterview(applicant)} className="flex flex-col items-center justify-center py-3 text-green-600 hover:bg-green-50 text-xs gap-0.5 transition-colors" title="Schedule Interview">
                  <Calendar className="w-4 h-4" />
                </button>
                <button onClick={() => handleRemoveFromShortlist(applicant._id)} className="flex flex-col items-center justify-center py-3 text-red-500 hover:bg-red-50 text-xs gap-0.5 transition-colors" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Applicant Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedApplicant.displayName || "Candidate"}</h3>
                <p className="text-sm text-slate-500">{selectedApplicant.email}</p>
              </div>
            </div>
            {selectedApplicant.bio && <p className="text-sm text-slate-700 mb-4">{selectedApplicant.bio}</p>}
            {selectedApplicant.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showInterviewScheduler && selectedApplicantForInterview && (
        <InterviewScheduler
          applicant={selectedApplicantForInterview}
          isOpen={showInterviewScheduler}
          onClose={() => { setShowInterviewScheduler(false); setSelectedApplicantForInterview(null); }}
          onSchedule={handleInterviewScheduled}
        />
      )}
    </PipelineLayout>
  );
}
