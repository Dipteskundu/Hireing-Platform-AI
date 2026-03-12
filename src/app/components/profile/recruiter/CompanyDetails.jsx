import React from "react";
import { Building2, Users, MapPin, Calendar, Globe } from "lucide-react";

const CompanyDetails = () => {
  return (
    <div className="space-y-12 animate-slide-in">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">About Company</h2>
        </div>

        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 italic font-sans text-slate-600 leading-relaxed">
          <p>
            Tech Innovators Inc. is a leading technology company specializing in software development, cloud computing, and AI solutions. Founded in 2010, we have a global presence with offices in North America, Europe, and Asia.
          </p>
          <br />
          <p>
            Our mission is to drive innovation and deliver cutting-edge technology solutions that empower businesses worldwide. We are committed to fostering a collaborative and inclusive work environment where creativity and diversity thrive.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[
          { label: "Company Size", value: "500-1000 employees", icon: <Users className="w-5 h-5" /> },
          { label: "Industry", value: "Technology", icon: <Globe className="w-5 h-5" /> },
          { label: "Headquarters", value: "San Francisco, CA", icon: <MapPin className="w-5 h-5" /> },
          { label: "Founded", value: "2010", icon: <Calendar className="w-5 h-5" /> }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] premium-shadow group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyDetails;

