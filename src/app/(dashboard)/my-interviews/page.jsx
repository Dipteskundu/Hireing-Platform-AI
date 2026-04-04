"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { API_BASE } from "../../lib/apiClient";
import { authedFetch } from "../../lib/authedFetch";
import PipelineLayout from "../../components/PipelineLayout/PipelineLayout";
import {
  Clock,
  Calendar,
  Video,
  MapPin,
  Phone,
  Building,
} from "lucide-react";
import InterviewDetailsModal from "../../components/InterviewDetailsModal/InterviewDetailsModal";

export default function MyInterviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await authedFetch(user, `${API_BASE}/api/interviews/candidate`);
        if (!response.ok) throw new Error("Failed to fetch interviews");

        const data = await response.json();
        if (data.success) {
          setInterviews(data.interviews || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [isAuthenticated, user]);

  const handleJoinMeeting = (interview) => {
    const meetingLink =
      interview?.meetingLink ||
      interview?.meetingUrl ||
      (interview?.meetingRoomName
        ? `https://meet.jit.si/${interview.meetingRoomName}`
        : null);

    if (!meetingLink) return;
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  if (!isAuthenticated) return null;

  return (
    <>
    <PipelineLayout activePhase="interviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Interviews</h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">Keep track of your scheduled interviews and video calls</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</p>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Interviews Scheduled</h2>
            <p className="text-slate-600">You don&apos;t have any interviews scheduled right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {interviews.map((interview) => (
              (() => {
                const scheduledRaw = interview?.scheduledDateTime || interview?.scheduledAt;
                const scheduledDate = scheduledRaw ? new Date(scheduledRaw) : null;
                const hasValidDate = scheduledDate && !Number.isNaN(scheduledDate.getTime());
                const dateText = hasValidDate
                  ? scheduledDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
                  : "TBD";
                const timeText = hasValidDate
                  ? scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "TBD";

                return (
              <div
                key={interview._id}
                onClick={() => setSelectedInterview(interview)}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group flex flex-col md:flex-row gap-6 justify-between items-start md:items-center cursor-pointer"
              >
                <div className="flex items-start gap-5 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${interview.status === 'scheduled' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {interview.type === "video" ? <Video className="w-7 h-7" /> : interview.type === "phone" ? <Phone className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-black text-slate-900 truncate">{interview.jobTitle}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${interview.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {interview.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Building className="w-4 h-4 text-slate-400" /> {interview.company}
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4" /> 
                        {dateText}
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4" /> 
                        {timeText}
                      </div>
                    </div>
                    {interview.notes && (
                      <p className="mt-3 text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">&ldquo;{interview.notes}&rdquo;</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  {interview.status === "scheduled" &&
                    interview.type === "video" &&
                    (interview.meetingLink || interview.meetingUrl || interview.meetingRoomName) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinMeeting(interview);
                      }}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-indigo-700 hover:shadow-lg transition-all"
                    >
                      <Video className="w-4 h-4" /> Join Interview
                    </button>
                  )}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </PipelineLayout>

    {/* Interview Details Modal */}
    <InterviewDetailsModal
      interview={selectedInterview}
      role="candidate"
      isOpen={!!selectedInterview}
      onClose={() => setSelectedInterview(null)}
    />
  </>
  );
}
