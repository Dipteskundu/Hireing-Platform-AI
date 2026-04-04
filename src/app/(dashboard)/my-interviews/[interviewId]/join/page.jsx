"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/AuthContext";
import { API_BASE } from "../../../../lib/apiClient";
import { authedFetch } from "../../../../lib/authedFetch";
import { Loader2, ArrowLeft } from "lucide-react";

export default function CandidateJoinInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!isAuthenticated || !user?.uid) return;
      try {
        const res = await authedFetch(user, `${API_BASE}/api/interviews/${params.interviewId}`);
        const data = await res.json();
        if (data.success) {
          // Verify that this candidate owns the interview
          const intv = data.interview;
          if (intv.applicantId !== user.uid) {
            setError("You are not authorized to join this interview.");
          } else {
            setInterview(intv);

            const meetingLink =
              intv.meetingLink ||
              intv.meetingUrl ||
              (intv.meetingRoomName ? `https://meet.jit.si/${intv.meetingRoomName}` : null);

            if (meetingLink) {
              window.location.assign(meetingLink);
              return;
            }
          }
        } else {
          setError(data.message || "Failed to load interview");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [params.interviewId, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || "Interview not found"}</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white w-full py-3 rounded-xl font-bold hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Opening Jitsi…</h2>
        <p className="text-slate-600 mb-6">If you are not redirected automatically, use the button below.</p>
        <button
          onClick={() => {
            const meetingLink =
              interview.meetingLink ||
              interview.meetingUrl ||
              (interview.meetingRoomName ? `https://meet.jit.si/${interview.meetingRoomName}` : null);
            if (meetingLink) window.location.assign(meetingLink);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white w-full py-3 rounded-xl font-bold hover:bg-indigo-700"
        >
          Open Jitsi
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 w-full py-3 rounded-xl font-bold hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
