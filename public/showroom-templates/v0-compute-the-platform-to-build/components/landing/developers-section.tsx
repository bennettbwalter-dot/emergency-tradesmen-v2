"use client";

import { useState, useEffect, useRef } from "react";

const features = [
  { 
    title: "Residential locks", 
    description: "Deadbolts, knob locks, smart locks for homes."
  },
  { 
    title: "Commercial systems", 
    description: "High-security locks and access control."
  },
  { 
    title: "Automotive keys", 
    description: "Car key cutting and transponder programming."
  },
  { 
    title: "Emergency service", 
    description: "24/7 lockout assistance, any time of day."
  },
];

export function DevelopersSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">

      {/* Image — absolute, bottom-right, behind all content */}
      <div
        className={`absolute bottom-0 right-0 w-[55%] h-[85%] pointer-events-none transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src="/images/locksmith-tools.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-left-top rounded-lg"
        />
        {/* Red accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-red-600/40 via-red-800/20 to-transparent mix-blend-multiply rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-t from-red-700/30 via-transparent to-red-500/20 rounded-lg" />
        {/* Fade left edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        {/* Fade top edge */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
      </div>

      {/* All text content sits on top */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header — Full width */}
        <div
          className={`mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Our Expertise
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]">
            Any lock.
            <br />
            <span className="text-muted-foreground">Any situation.</span>
          </h2>
        </div>

        {/* Description + Features — left half only */}
        <div
          className={`max-w-[50%] transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-md">
            From vintage antique locks to cutting-edge smart security systems, 
            our technicians have the training and tools to handle it all.
          </p>
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 50 + 200}ms` }}
              >
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
