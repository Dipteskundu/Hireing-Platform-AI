"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import { API_BASE } from "../../lib/apiClient";
import { AlignJustify, User, Eye, Github, ExternalLink, CheckCircle2, XCircle, Loader2, X, FileText, Calendar } from "lucide-react";
import PipelineLayout from "../../components/PipelineLayout/PipelineLayout";
import InterviewScheduler from "../../components/InterviewScheduler/InterviewScheduler";

export default function TaskSubmissionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`${API_BASE}/api/tasks/submissions/${user.uid}`);
      const data = await res.json();
      if (data.success) setSubmissions(data.submissions || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchSubmissions();
  }, [user?.uid, fetchSubmissions]);

  // Poll for new submissions so recruiter doesn’t need a manual refresh
  useEffect(() => {
    if (!user?.uid) return;
    const id = setInterval(() => {
      fetchSubmissions();
    }, 15000);
    return () => clearInterval(id);
  }, [user?.uid, fetchSubmissions]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.application._id !== appId));
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAccept = (sub) => handleStatusChange(sub.application._id, "interview_selected");
  const handleReject = (sub) => {
    if (confirm("Are you sure you want to reject this candidate?")) {
      handleStatusChange(sub.application._id, "rejected");
    }
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
        if (selectedApplicantForInterview?._id) {
          setSubmissions((prev) =>
            prev.filter((s) => s.application?._id !== selectedApplicantForInterview._id),
          );
          setShowInterviewScheduler(false);
          setSelectedApplicantForInterview(null);
          setShowModal(false);
        }
      }
    } catch (error) { throw error; }
  };

  if (!isAuthenticated) return null;

  return (
    <PipelineLayout activePhase="submissions">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlignJustify className="w-8 h-8 text-yellow-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No tasks submitted yet</h3>
          <p className="text-slate-500 text-sm">Submissions will appear here as candidates complete their assigned tasks.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Candidate</th>
                  <th className="px-6 py-3 text-left">Task / Job</th>
                  <th className="px-6 py-3 text-left">Links</th>
                  <th className="px-6 py-3 text-left">Submitted</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{sub.application?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{sub.task?.title}</p>
                      <p className="text-xs text-slate-400">{sub.application?.jobTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sub.githubUrl && (
                          <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                            <Github className="w-3.5 h-3.5" /> Repo
                          </a>
                        )}
                        {sub.liveUrl && (
                          <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" /> Demo
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedSubmission(sub); setShowModal(true); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Task Submission Review</h2>
                <p className="text-sm text-slate-500 mt-0.5">{selectedSubmission.application?.email}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Original Task
                </h3>
                <p className="text-sm text-slate-700">{selectedSubmission.task?.description}</p>
              </div>
              {selectedSubmission.githubUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub Repository</p>
                  <a href={selectedSubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{selectedSubmission.githubUrl}</a>
                </div>
              )}
              {selectedSubmission.liveUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Live Demo</p>
                  <a href={selectedSubmission.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{selectedSubmission.liveUrl}</a>
                </div>
              )}
              {selectedSubmission.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Candidate Notes</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedSubmission.notes}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => handleReject(selectedSubmission)} className="flex items-center gap-1.5 px-4 py-2 text-white bg-red-500 rounded-xl text-sm font-semibold hover:bg-red-600">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => { setSelectedApplicantForInterview(selectedSubmission.application); setShowInterviewScheduler(true); }}
                className="flex items-center gap-1.5 px-4 py-2 text-white bg-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                <Calendar className="w-4 h-4" /> Schedule Interview
              </button>
              <button onClick={() => handleAccept(selectedSubmission)} className="flex items-center gap-1.5 px-4 py-2 text-white bg-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Accept & Move to Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterviewScheduler && selectedApplicantForInterview && (
        <InterviewScheduler
          applicant={selectedApplicantForInterview}
          isOpen={showInterviewScheduler}
          onClose={() => { setShowInterviewScheduler(false); setSelectedApplicantForInterview(null); setShowModal(false); }}
          onSchedule={handleInterviewScheduled}
        />
      )}
    </PipelineLayout>
  );
}
