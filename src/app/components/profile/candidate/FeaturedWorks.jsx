import { FeaturedWorksData } from "@/app/lib/CandidateData";
import { Github, Globe } from "lucide-react";
import Image from "next/image";
import React from "react";

const FeaturedWorks = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {FeaturedWorksData.map((w, i) => (
        <div
          key={i}
          className="bg-white rounded-[2rem] border border-slate-100 premium-shadow overflow-hidden group hover:border-indigo-200 transition-all"
        >
          {/* Project Image */}
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={w.img}
              alt={w.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <span className="text-white text-sm font-bold bg-indigo-600/80 backdrop-blur-md px-3 py-1 rounded-lg">
                View Project
              </span>
            </div>
          </div>

          <div className="p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {w.title}
                </h4>
                <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mt-1">
                  {w.company}
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
              {w.description}
            </p>

            <div className="flex gap-3 pt-4 border-t border-slate-50">
              <a
                href={w.live}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Live Demo
              </a>
              <a
                href={w.github}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Github className="w-4 h-4" />
                Code
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedWorks;

