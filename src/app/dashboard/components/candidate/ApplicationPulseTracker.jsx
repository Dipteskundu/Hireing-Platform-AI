"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, ChevronRight, MessageSquareOff, MessageSquareText } from "lucide-react";

export default function ApplicationPulseTracker({ application }) {
    if (!application) return null;

    const { status, timeline = [], feedback } = application;

    // Define standard steps in a positive flow
    const standardSteps = [
        { id: "submitted", label: "Submitted" },
        { id: "seen", label: "Seen by Recruiter" },
        { id: "shortlisted", label: "Shortlisted for Test" },
        { id: "interviewing", label: "Interview" },
        { id: "hired", label: "Final Decision" }
    ];

    // Helper to check if a step is in timeline
    const getTimelineEntry = (stepId) => timeline.find((t) => t.status === stepId);

    // Determine current logical step index
    let currentStepIndex = -1;
    for (const step of timeline) {
        const index = standardSteps.findIndex(s => s.id === step.status);
        if (index > currentStepIndex) currentStepIndex = index;
    }

    // Special states
    const isRejected = status === "rejected";
    const rejectTimelineEntry = timeline.find((t) => t.status === "rejected");

    // Format date beautifully
    const formatDate = (dateString) => {
        if (!dateString) return "Pending";
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
    };

    return (
        <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mt-6">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                Application Pulse Tracker
            </h3>

            <div className="relative pl-4 sm:pl-8 space-y-10">
                {/* Vertical connecting line */}
                <div className="absolute left-[27px] sm:left-[43px] top-4 bottom-8 w-0.5 bg-slate-200 z-0"></div>

                {standardSteps.map((step, idx) => {
                    const entry = getTimelineEntry(step.id);
                    const isCompleted = !!entry;
                    
                    // Logic to handle rejection interrupting the flow
                    if (isRejected && idx > currentStepIndex && step.id !== "hired") {
                        return null; // Don't show future steps if rejected, except maybe final decision
                    }

                    if (isRejected && step.id === "hired") {
                        // Replace final step with rejection step
                        return (
                            <div key="rejected" className="relative z-10 flex gap-6 sm:gap-8 items-start opacity-100">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 border-4 border-white flex items-center justify-center shadow-sm relative z-10 mt-1">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="flex-1 pb-2">
                                    <h4 className="text-lg font-bold text-slate-900 line-through decoration-red-300">Final Decision</h4>
                                    <p className="text-red-600 font-bold text-sm mt-0.5">Application Rejected</p>
                                    <p className="text-xs font-bold text-slate-400 mt-1">{formatDate(rejectTimelineEntry?.timestamp)}</p>
                                    
                                    {feedback && (
                                        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex gap-3 items-start">
                                            <MessageSquareText className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Recruiter Feedback</p>
                                                <p className="text-sm font-medium text-red-800 leading-relaxed italic">&quot;{feedback}&quot;</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Normal flow rendering
                    const isCurrent = isCompleted && idx === currentStepIndex && !isRejected;
                    const isPending = !isCompleted && !isRejected;

                    return (
                        <div 
                            key={step.id} 
                            style={{ animationDelay: `${idx * 150}ms` }}
                            className={`relative z-10 flex gap-6 sm:gap-8 items-start animate-fade-in ${isPending ? 'opacity-50' : 'opacity-100'}`}
                        >
                            
                            {/* Icon / Marker */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm relative z-10 mt-1 transition-all duration-500 ${
                                isCompleted ? 'bg-indigo-600 text-white' : 
                                isPending ? 'bg-slate-200 text-slate-400' : 'bg-slate-200 text-slate-400'
                            }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                
                                {isCurrent && (
                                    <div className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20 z-[-1]"></div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-2">
                                <h4 className={`text-lg font-bold mb-0.5 transition-colors duration-500 ${isCurrent ? 'text-indigo-600' : 'text-slate-900'}`}>
                                    {step.label}
                                </h4>
                                {isCompleted ? (
                                    <p className="text-xs font-bold text-slate-500">{formatDate(entry.timestamp)}</p>
                                ) : (
                                    <p className="text-xs font-bold text-slate-400">Pending</p>
                                )}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
