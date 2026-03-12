"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Briefcase, Zap, Globe } from "lucide-react";

const slides = [
  {
    title: "Find Your Dream Job SkillMatch AI",
    description: "Our AI-powered platform matches your unique skills with the perfect career opportunities.",
    icon: <Briefcase className="w-6 h-6 text-primary" />,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
    cta: "Explore Jobs",
    accent: "bg-indigo-50"
  },
  {
    title: "Accelerate Your Career Growth",
    description: "Get personalized recommendations and insights to stay ahead in the competitive job market.",
    icon: <Zap className="w-6 h-6 text-primary" />,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    cta: "Get Started",
    accent: "bg-rose-50"
  },
  {
    title: "Connect with Global Opportunities",
    description: "Access a worldwide network of top companies and remote-friendly roles tailored for you.",
    icon: <Globe className="w-6 h-6 text-primary" />,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    cta: "Join Now",
    accent: "bg-blue-50"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="relative w-full min-h-[520px] sm:min-h-[600px] lg:min-h-[700px] overflow-hidden bg-white -mt-25">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <div className="mx-auto max-w-7xl h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-6 lg:px-10 pt-4 pb-14 sm:pt-8 sm:pb-16 lg:py-0 gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="w-full lg:w-[52%] text-center lg:text-left space-y-4 sm:space-y-6 animate-slide-in">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${slide.accent} border border-indigo-100`}>
                {slide.icon}
                <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider font-sans">
                  New Features Available
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {slide.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {slide.description}
              </p>
              <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl premium-shadow transition-all transform hover:-translate-y-1 active:scale-95">
                  {slide.cta}
                </button>
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white border border-slate-200 text-slate-700 font-bold text-sm sm:text-base rounded-2xl hover:bg-slate-50 transition-all">
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Image - hidden on mobile, visible lg+ */}
            <div className="hidden lg:block w-[44%] h-[420px] xl:h-[480px] relative flex-shrink-0">
              <div className="absolute inset-0 bg-indigo-100 rounded-[3rem] rotate-3 -z-10 animate-pulse transition-all duration-1000"></div>
              <div className="w-full h-full relative rounded-[3rem] overflow-hidden premium-shadow transform -rotate-3 transition-transform duration-700 hover:rotate-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-2xl premium-shadow shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">★</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Top Rated</p>
                  <p className="text-[10px] text-slate-500">by 10k+ users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3 sm:gap-4">
        <button
          onClick={prev}
          className="p-3 rounded-full glass hover:bg-white text-slate-700 transition-all premium-shadow border border-slate-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-indigo-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="p-3 rounded-full glass hover:bg-white text-slate-700 transition-all premium-shadow border border-slate-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
