import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, X, Signal, Wifi, Battery, Clock } from "lucide-react";
import { Button } from "./ui/button";

interface MobilePreviewWrapperProps {
  children: React.ReactNode;
}

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  type: "ios" | "android";
  notch: "classic" | "island" | "punch";
}

const DEVICE_PRESETS: DevicePreset[] = [
  { id: "iphone14pro", name: "iPhone 14 Pro", width: 393, height: 852, type: "ios", notch: "island" },
  { id: "iphonese", name: "iPhone SE", width: 375, height: 667, type: "ios", notch: "classic" },
  { id: "iphone12", name: "iPhone 12/13", width: 390, height: 844, type: "ios", notch: "classic" },
  { id: "pixel7", name: "Pixel 7", width: 412, height: 915, type: "android", notch: "punch" },
  { id: "s21", name: "Galaxy S21", width: 360, height: 800, type: "android", notch: "punch" },
];

export const MobilePreviewWrapper = ({ children }: MobilePreviewWrapperProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [activeDevice, setActiveDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const [currentTime, setCurrentTime] = useState("9:41");

  // Detect if we are already inside an iframe
  const isInsideIframe = typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => {
    // Update time for the status bar
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    // Auto-enable logic
    const params = new URLSearchParams(window.location.search);
    const mobileParam = params.get("mobile");
    const storedChoice = localStorage.getItem("mobile-preview-enabled");

    if (mobileParam === "true" || storedChoice === "true") {
      setIsEnabled(true);
    }

    return () => clearInterval(interval);
  }, []);

  const togglePreview = () => {
    const newVal = !isEnabled;
    setIsEnabled(newVal);
    localStorage.setItem("mobile-preview-enabled", String(newVal));
  };

  // If inside an iframe or not enabled, just render children
  if (isInsideIframe || !isEnabled) {
    return (
      <>
        {children}
        {/* Persistent Dev Toggle - Always in the corner for developers */}
        {!isInsideIframe && (
          <div className="fixed bottom-6 right-6 z-[99999] hidden md:block group">
            <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button 
              onClick={togglePreview}
              className="relative h-14 w-14 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.4)] bg-zinc-900 border border-gold/40 text-gold hover:bg-zinc-800 hover:scale-110 transition-all duration-300 flex items-center justify-center overflow-hidden p-0"
              title="Toggle Mobile Simulator (Dev Only)"
            >
              <Smartphone className="w-6 h-6" />
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent pointer-events-none" />
            </Button>
            
            {/* Tooltip-like label */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
              Mobile Template
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden z-[99999]">
      {/* Dev Control Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-2xl z-50">
        <div className="flex items-center gap-2 mr-2">
          <Smartphone className="w-4 h-4 text-gold" />
          <span className="hidden sm:block text-[10px] font-bold text-white uppercase tracking-widest">Simulator</span>
        </div>
        
        {/* Device Selector */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
          {DEVICE_PRESETS.map((device) => (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device)}
              className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                activeDevice.id === device.id 
                  ? "bg-gold text-black shadow-lg" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              {device.name}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-white/20 mx-2" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePreview}
          className="text-white hover:text-gold hover:bg-white/5 h-8 gap-2 px-3"
        >
          <Monitor className="w-3 h-3" />
          <span className="text-[10px] font-bold">EXIT</span>
        </Button>
      </div>

      {/* Main Simulation Container */}
      <div className="relative flex items-center justify-center w-full h-full scale-[0.7] sm:scale-[0.85] lg:scale-100 transition-all duration-500 pt-12">
        
        {/* Device Frame */}
        <div 
          className="relative bg-zinc-900 p-3 shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.1)] border-[8px] border-zinc-800 transition-all duration-500"
          style={{ 
            width: activeDevice.width + 24 + 16, // Width + padding + border
            height: activeDevice.height + 24 + 16,
            borderRadius: activeDevice.id === 'iphonese' ? '2.5rem' : '3.5rem'
          }}
        >
          
          {/* Inner Display Area */}
          <div 
            className="relative w-full h-full bg-black overflow-hidden border border-zinc-950 shadow-inner"
            style={{ borderRadius: activeDevice.id === 'iphonese' ? '1.5rem' : '2.5rem' }}
          >
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 z-[100] flex items-center justify-between px-8 bg-transparent">
              <div className="text-[13px] font-bold text-white flex-1">{currentTime}</div>
              
              {/* Notch Area */}
              {activeDevice.notch === 'island' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full flex items-center justify-center border border-white/5">
                  <div className="absolute right-3 w-2 h-2 rounded-full bg-zinc-800/50" />
                </div>
              )}

              {activeDevice.notch === 'classic' && activeDevice.id !== 'iphonese' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-950 rounded-b-3xl flex items-center justify-center gap-4">
                  <div className="w-12 h-1.5 bg-zinc-900 rounded-full border border-white/5" />
                  <div className="w-2 h-2 rounded-full bg-zinc-900 border border-white/5" />
                </div>
              )}

              {activeDevice.notch === 'punch' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950 rounded-full flex items-center justify-center border border-white/5">
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                </div>
              )}

              <div className="flex items-center gap-1.5 justify-end flex-1">
                <Signal className="w-3 h-3 text-white" />
                <Wifi className="w-3 h-3 text-white" />
                <Battery className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Iframe Content: The actual app */}
            <iframe 
              src={window.location.href}
              className="w-full h-full border-none"
              title="Mobile Preview"
              onLoad={(e) => {
                // Remove scrollbars from iframe body
                const doc = (e.target as HTMLIFrameElement).contentDocument;
                if (doc) {
                  const style = doc.createElement('style');
                  style.innerHTML = `
                    ::-webkit-scrollbar { display: none; }
                    body { -ms-overflow-style: none; scrollbar-width: none; }
                  `;
                  doc.head.appendChild(style);
                }
              }}
            />

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/30 rounded-full z-[100]" />
          </div>

          {/* Device Buttons (Hardware aesthetic) */}
          <div className="absolute -left-2 top-24 w-1 h-8 bg-zinc-800 rounded-l-md opacity-50" />
          <div className="absolute -left-2 top-36 w-1 h-14 bg-zinc-800 rounded-l-md opacity-50" />
          <div className="absolute -left-2 top-52 w-1 h-14 bg-zinc-800 rounded-l-md opacity-50" />
          <div className="absolute -right-2 top-40 w-1 h-20 bg-zinc-800 rounded-r-md opacity-50" />
        </div>
      </div>
    </div>
  );
};
