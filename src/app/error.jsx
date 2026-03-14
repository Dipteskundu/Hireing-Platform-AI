"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
    const router = useRouter();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md text-center animate-page-enter">

                {/* Animated icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                            <RefreshCw className="w-11 h-11 text-red-400 animate-spin-slow" aria-hidden="true" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-9 h-9 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md animate-scale-in delay-300">
                            500
                        </span>
                        <span className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping-slow opacity-40" aria-hidden="true" />
                    </div>
                </div>

                {/* Text */}
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                    Something went wrong
                </h1>
                <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
                    An unexpected error occurred. You can try again or head back home.
                </p>

                {/* Buttons — stacked on mobile, row on sm+ */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        Go Back
                    </button>
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:scale-95 shadow-sm shadow-red-200"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 shadow-sm shadow-indigo-200"
                    >
                        <Home className="w-4 h-4" aria-hidden="true" />
                        Go Home
                    </Link>
                </div>

                <p className="mt-10 text-xs text-slate-400">
                    If this keeps happening,{" "}
                    <Link href="/contact" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
                        contact support
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
