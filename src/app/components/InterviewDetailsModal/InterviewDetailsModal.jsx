"use client";

import {
  X,
  Video,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

export default function InterviewDetailsModal({ interview, role, isOpen, onClose, onStatusChange }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !interview) return null;

  const isScheduled = interview.status === "scheduled";
  const isVideo = interview.type === "video";
  const isCompleted = interview.status === "completed";
  const isCancelled = interview.status === "cancelled";

  const scheduledDate = interview.scheduledDateTime
    ? new Date(interview.scheduledDateTime)
    : null;

  const formattedDate = scheduledDate
    ? scheduledDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const formattedTime = scheduledDate
    ? scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const meetingLink =
    interview.meetingLink ||
    interview.meetingUrl ||
    (interview.meetingRoomName ? `https://meet.jit.si/${interview.meetingRoomName}` : null);

  const handleJoin = () => {
    onClose();
    if (!meetingLink) return;
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusMeta = {
    scheduled: { color: "bg-amber-100 text-amber-700", icon: AlertCircle, label: "Scheduled" },
    completed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelled" },
  };
  const { color: statusColor, icon: StatusIcon, label: statusLabel } = statusMeta[interview.status] || statusMeta.scheduled;

  const typeMeta = {
    video: { bg: "bg-indigo-50 text-indigo-600", icon: Video, label: "Video Call" },
    phone: { bg: "bg-blue-50 text-blue-600", icon: Phone, label: "Phone Call" },
    "in-person": { bg: "bg-purple-50 text-purple-600", icon: MapPin, label: "In-Person" },
  };
  const { bg: typeBg, icon: TypeIcon, label: typeLabel } = typeMeta[interview.type] || typeMeta.video;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-5 pr-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${typeBg}`}>
              <TypeIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-2xl font-black text-slate-900 truncate">{interview.jobTitle || "Interview"}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${statusColor}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  {interview.company || "Company"}
                </span>
                <span className="text-slate-300">•</span>
                <span>{typeLabel}</span>
                {interview.duration && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{interview.duration} min</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                <Calendar className="w-4 h-4" /> Date
              </div>
              <p className="text-slate-900 font-black text-lg">{formattedDate}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                <Clock className="w-4 h-4" /> Time
              </div>
              <p className="text-slate-900 font-black text-lg">{formattedTime}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
              <Users className="w-4 h-4" /> Participants
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Candidate</span>
                <span className="text-slate-900 font-bold text-sm">{interview.applicantEmail || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Company</span>
                <span className="text-slate-900 font-bold text-sm">{interview.company || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Role</span>
                <span className="text-slate-900 font-bold text-sm">{interview.jobTitle || "—"}</span>
              </div>
            </div>
          </div>

          {/* Meeting Link (Video only) */}
          {isVideo && meetingLink && (
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-500 text-sm font-semibold mb-3">
                <Video className="w-4 h-4" /> Jitsi Meeting Link
              </div>
              <div className="flex items-center gap-3">
                <p className="text-slate-700 font-mono text-xs bg-white px-3 py-2 rounded-xl border border-indigo-100 flex-1 truncate">
                  {meetingLink}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-white border border-indigo-100 text-slate-500 hover:text-indigo-600 transition-colors shrink-0"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Location (In-Person / Phone) */}
          {interview.location && interview.type !== "video" && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                {interview.type === "phone" ? "Phone Number" : "Location"}
              </div>
              <p className="text-slate-900 font-bold">{interview.location}</p>
            </div>
          )}

          {/* Notes */}
          {interview.notes && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                <FileText className="w-4 h-4" /> Notes
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic">&ldquo;{interview.notes}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          {/* Join button — always show for scheduled video interviews regardless of meetingRoomName */}
          {isScheduled && isVideo && (
            <button
              onClick={handleJoin}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95"
            >
              <Video className="w-5 h-5" />
              Join Interview Now
            </button>
          )}

          {/* Open in browser as fallback */}
          {isScheduled && isVideo && meetingLink && (
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 font-bold transition-all text-sm shrink-0"
              title="Open in browser"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Browser
            </a>
          )}

          {/* Recruiter-only: status change */}
          {role === "recruiter" && isScheduled && onStatusChange && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { onStatusChange(interview._id, "completed"); onClose(); }}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors border border-emerald-100"
              >
                <CheckCircle className="w-4 h-4" /> Mark Complete
              </button>
              <button
                onClick={() => { onStatusChange(interview._id, "cancelled"); onClose(); }}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors border border-red-100"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}

          {/* Close */}
          {(!isScheduled || !isVideo) && (
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
