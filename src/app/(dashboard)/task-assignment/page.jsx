"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import api, { API_BASE } from "../../lib/apiClient";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Calendar, X, Lightbulb, BarChart2, Loader2 } from "lucide-react";
import PipelineLayout from "../../components/PipelineLayout/PipelineLayout";

export default function TaskAssignmentPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const singleAppId = searchParams.get("appId");

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    requirements: "",
    deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Pipeline stats sidebar
  const [pipelineStats, setPipelineStats] = useState({ shortlisted: 0, pendingTasks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    api.get(`/api/applications/recruiter/${user.uid}`)
      .then(res => {
        const d = res.data;
        if (d.success) {
          const apps = d.applications || [];
          setPipelineStats({
            shortlisted: apps.filter(a => a.status === "shortlisted").length,
            pendingTasks: apps.filter(a => a.status === "task_sent").length,
          });
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [user?.uid]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskData.title || !taskData.deadline || !taskData.description) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...taskData,
        recruiterId: user.uid,
        jobId: jobId || null,
        applicantIds: singleAppId ? [singleAppId] : [],
      };
      const res = await api.post("/api/tasks", payload);
      const result = res.data;
      if (!result.success) throw new Error(result.message || "Failed to assign task");
      setSuccess(true);
      setTimeout(() => router.push("/shortlisted"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <PipelineLayout activePhase="task-sent">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.push("/shortlisted")} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium">
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleAssignTask} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-sm font-bold text-emerald-700">Task assigned successfully! Redirecting...</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Task Title *</label>
                <input
                  type="text" required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  placeholder="e.g. Build a React Dashboard"
                  value={taskData.title}
                  onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Task Description *</label>
                <textarea
                  required rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 resize-y"
                  placeholder="Describe the overall goal of the task..."
                  value={taskData.description}
                  onChange={e => setTaskData({ ...taskData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Technical Requirements / Instructions</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono resize-y"
                  placeholder={"- Use Next.js and Tailwind\n- Implement responsive design\n- Focus on clean code"}
                  value={taskData.requirements}
                  onChange={e => setTaskData({ ...taskData, requirements: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Submission Deadline *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local" required
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    value={taskData.deadline}
                    onChange={e => setTaskData({ ...taskData, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {singleAppId ? "Send Task to Candidate" : "Finalize & Send to All Shortlisted"}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pro Tip */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold">Professional Tip</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Candidates are more likely to complete tasks if the requirements are clear and the deadline is reasonable (usually 3-5 days).
            </p>
            <ul className="space-y-2">
              {["Clearly define success criteria", "Specify deliverable formats", "Include reference materials if any"].map((tip, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Live Pipeline Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Pipeline Stats</span>
            </div>
            {statsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-700 font-medium">Shortlisted Talent</span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    {pipelineStats.shortlisted}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-700 font-medium">Pending Tasks</span>
                  <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg">
                    {pipelineStats.pendingTasks}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PipelineLayout>
  );
}
