"use client";

export default function Skeleton({ className = "", variant = "rectangular" }) {
    const baseClasses = "bg-slate-200 animate-pulse";
    
    const variants = {
        circular: "rounded-full",
        rectangular: "rounded-lg",
        rounded: "rounded-[2rem]",
        text: "rounded-md h-4 w-full",
    };

    return (
        <div 
            className={`${baseClasses} ${variants[variant] || variants.rectangular} ${className}`}
            aria-hidden="true"
        />
    );
}
