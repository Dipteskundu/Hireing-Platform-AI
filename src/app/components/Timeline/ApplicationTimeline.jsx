"use client";

// Status step definitions — order matters
const STEPS = [
    { key: "applied", label: "Applied", desc: "You submitted your application" },
    { key: "ai_scored", label: "AI Scored", desc: "AI calculated your match score" },
    { key: "viewed", label: "Recruiter Viewed", desc: "A recruiter opened your profile" },
    { key: "shortlisted", label: "Shortlisted", desc: "You've been selected for review" },
    { key: "interview", label: "Interview", desc: "Interview stage reached" },
    { key: "offer", label: "Offer", desc: "Offer extended to you" },
];

// Legacy status mapping
const STATUS_ALIAS = {
    submitted: "applied",
};

function getStepIndex(status) {
    const normalized = STATUS_ALIAS[status] || status;
    if (normalized === "rejected") return -2; // special rejected state
    if (normalized === "hired") return 10;  // completed
    return STEPS.findIndex((s) => s.key === normalized);
}

// Single step node
function StepNode({ step, index, currentIndex, isRejected }) {
    const isDone = !isRejected && index < currentIndex;
    const isActive = !isRejected && index === currentIndex;
    const isPending = isRejected ? true : index > currentIndex;

    return (
        <div className="flex items-start gap-4">
            {/* Icon column */}
            <div className="flex flex-col items-center shrink-0">
                <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
            ${isDone ? "bg-emerald-500 border-emerald-500" : ""}
            ${isActive ? "bg-indigo-600 border-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" : ""}
            ${isPending ? "bg-white border-slate-200" : ""}
          `}
                >
                    {isDone && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                    {isPending && <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />}
                </div>
                {/* Connector line (not for last item) */}
                {index < STEPS.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[24px] mt-1 rounded-full transition-colors duration-300
            ${isDone ? "bg-emerald-300" : "bg-slate-100"}`}
                    />
                )}
            </div>

            {/* Text */}
            <div className="pb-5 pt-0.5">
                <p className={`text-sm font-black leading-tight
          ${isDone ? "text-emerald-700" : ""}
          ${isActive ? "text-indigo-700" : ""}
          ${isPending ? "text-slate-300" : ""}
        `}>
                    {step.label}
                </p>
                {(isDone || isActive) && (
                    <p className={`text-xs font-medium mt-0.5
            ${isDone ? "text-emerald-500" : "text-indigo-400"}`}>
                        {step.desc}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function ApplicationTimeline({ status, timeline }) {
    const isRejected = status === "rejected";
    const isHired = status === "hired";
    const currentIdx = getStepIndex(status);

    return (
        <div className="py-2">
            {/* Special: Rejected state banner */}
            {isRejected && (
                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    Application was not selected this time
                </div>
            )}

            {/* Special: Hired banner */}
            {isHired && (
                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    🎉 Offer accepted — You&apos;re hired!
                </div>
            )}

            {/* Step track */}
            <div>
                {STEPS.map((step, index) => (
                    <StepNode
                        key={step.key}
                        step={step}
                        index={index}
                        currentIndex={currentIdx}
                        isRejected={isRejected}
                    />
                ))}
            </div>

            {/* Timeline events (from DB) */}
            {timeline && timeline.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-slate-50 pt-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Event Log</p>
                    {timeline.slice().reverse().map((event, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600 capitalize">
                                {STATUS_ALIAS[event.status] || event.status}
                            </span>
                            <span className="text-slate-400">
                                {event.timestamp
                                    ? new Date(event.timestamp).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "—"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
