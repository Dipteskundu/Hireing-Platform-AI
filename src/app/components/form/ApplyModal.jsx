"use client";

import { X, Upload, Send, FileText, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ApplyModal({ isOpen, onClose, jobTitle, companyName }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
            }, 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in transition-all"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {isSuccess ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Application Sent!</h2>
                        <p className="text-slate-500 text-lg">Your profile has been shared with {companyName}.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-6 sm:px-8 py-6 sm:py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Apply for Position</h2>
                                <p className="text-indigo-600 font-bold text-xs sm:text-sm">
                                    {jobTitle} <span className="text-slate-400 font-medium px-1 sm:px-2">•</span> {companyName}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 sm:p-3 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900 shadow-sm"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="name@email.com"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Resume / Portfolio</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-slate-900">Click to upload or drag and drop</p>
                                    <p className="text-sm text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cover Letter (Optional)</label>
                                <textarea
                                    rows="4"
                                    placeholder="Tell us why you are a great fit..."
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium resize-none"
                                />
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700">
                                <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium leading-relaxed">
                                    By applying, you agree to share your profile and contact information with {companyName}. We recommend double-checking your resume for the latest updates.
                                </p>
                            </div>

                            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-[1.5rem] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Submit Application <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 sm:px-10 py-4 sm:py-5 border border-slate-200 rounded-xl sm:rounded-[1.5rem] font-bold text-slate-500 hover:bg-slate-50 transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
