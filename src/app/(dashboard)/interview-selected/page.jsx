"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import { API_BASE } from "../../lib/apiClient";
import { authedFetch } from "../../lib/authedFetch";
import { CalendarDays, User, Calendar, Loader2 } from "lucide-react";
import PipelineLayout from "../../components/PipelineLayout/PipelineLayout";
import InterviewScheduler from "../../components/InterviewScheduler/InterviewScheduler";

export default function InterviewSelectedPage() {
  const { user, isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchCandidates = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`${API_BASE}/api/applications/recruiter/${user.uid}`);
      const data = await res.json();
      if (data.success) {
        setCandidates((data.applications || []).filter(a => a.status === "interview_selected"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchCandidates();
  }, [user?.uid, fetchCandidates]);

  // Poll so the list stays in sync without manual refresh
  useEffect(() => {
    if (!user?.uid) return;
    const id = setInterval(() => {
      fetchCandidates();
    }, 15000);
    return () => clearInterval(id);
  }, [user?.uid, fetchCandidates]);

  const handleScheduled = async (interviewData) => {
    try {
      const res = await authedFetch(user, `${API_BASE}/api/interviews/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewData),
      });
      const result = await res.json();
      if (result.success) {
        const app = candidates.find((a) => a._id === interviewData.applicationId);
        if (app?._id) setCandidates((prev) => prev.filter((a) => a._id !== app._id));
      } else throw new Error(result.message);
    } catch (err) { throw err; }
  };

  if (!isAuthenticated) return null;

  return (
    <PipelineLayout activePhase="interview-sel">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-violet-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No candidates selected for interview</h3>
          <p className="text-slate-500 text-sm">Accept candidates from Task Submissions to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {candidates.map(app => (
            <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{app.email}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{app.jobTitle}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                    Interview Selected
                  </span>
                </div>
              </div>
              <div className="mt-auto border-t border-slate-100">
                <button
                  onClick={() => { setSelectedApplicant(app); setShowInterviewScheduler(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Jitsi Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInterviewScheduler && selectedApplicant && (
        <InterviewScheduler
          applicant={selectedApplicant}
          isOpen={showInterviewScheduler}
          onClose={() => { setShowInterviewScheduler(false); setSelectedApplicant(null); }}
          onSchedule={handleScheduled}
        />
      )}
    </PipelineLayout>
  );
}
