import { WorkExperience } from "@/app/lib/CandidateData";
import React from "react";
import { Briefcase } from "lucide-react";

const CareerPath = () => {
  return (
    <div className="space-y-12">
      <div className="relative pl-10 border-l-2 border-indigo-50 ml-4 space-y-12">
        {WorkExperience.map((w, i) => (
          <div key={i} className="relative group">
            {/* Timeline Connector Dot */}
            <div className="absolute -left-[51px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-600 shadow-sm shadow-indigo-200 group-hover:scale-125 transition-transform" />

            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {w.title}
                </h3>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg uppercase tracking-wider">
                  {w.duration}
                </span>
              </div>

              <div className="flex items-center gap-2 text-indigo-600 font-bold text-[15px]">
                <Briefcase className="w-4 h-4" />
                <span>{w.company}</span>
              </div>

              <p className="text-slate-500 text-md leading-relaxed max-w-2xl pt-2">
                {w.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerPath;

