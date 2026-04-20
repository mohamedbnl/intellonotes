"use client";

import React, { useEffect, useState } from "react";

export function GlobalBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden isolate">
      {/* Base soft gradients */}
      <div className="absolute inset-0 bg-slate-50 opacity-90 transition-opacity duration-1000" />
      
      {/* Moving gradient meshes */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply flex items-center justify-center">
        <div 
          className="absolute w-[80vw] h-[80vh] bg-blue-100 rounded-[100%] blur-[120px] mix-blend-multiply opacity-60 animate-wave-slowest left-[-10%] top-[-20%]"
          style={{ animationDuration: '25s' }}
        />
        <div 
          className="absolute w-[70vw] h-[70vh] bg-indigo-50 rounded-[100%] blur-[140px] mix-blend-multiply opacity-50 animate-wave-slow right-[-5%] top-[10%]"
          style={{ animationDuration: '30s', animationDelay: '-5s' }}
        />
        <div 
          className="absolute w-[90vw] h-[60vh] bg-[var(--color-primary-50)] rounded-[100%] blur-[100px] mix-blend-multiply opacity-70 animate-wave-medium bottom-[-10%] left-[10%]"
          style={{ animationDuration: '20s', animationDelay: '-10s' }}
        />
      </div>

      {/* Subtle overlay texture/noise if needed, kept very minimal */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay"></div>
    </div>
  );
}

export function AuthBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden isolate bg-[#0f172a]">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[var(--color-primary-900)] to-slate-950 opacity-95"></div>

      {/* Dynamic glowing orbs and waves inside the auth block */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60 mix-blend-screen mix-blend-color-dodge">
        <div 
          className="absolute w-[120%] h-[120%] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-wave-slow"
          style={{ animationDuration: '18s' }}
        />
        <div 
          className="absolute right-[-20%] top-[-10%] w-[60%] h-[70%] bg-indigo-500 rounded-full blur-[120px] opacity-30 animate-wave-medium"
          style={{ animationDuration: '15s', animationDelay: '-4s' }}
        />
        <div 
          className="absolute left-[-10%] bottom-[-20%] w-[80%] h-[60%] bg-[var(--color-primary-600)] rounded-full blur-[140px] opacity-20 animate-wave-slowest"
          style={{ animationDuration: '22s', animationDelay: '-8s' }}
        />
      </div>

      {/* Subtle grid line layer for premium tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none"></div>

      <Floating3DElements />
    </div>
  );
}

function Floating3DElements() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden perspective-1000">
      {/* Orb 1: Top right */}
      <div className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full glass bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1),inset_0_0_20px_rgba(255,255,255,0.2)] backdrop-blur-md animate-float-slow opacity-80" 
           style={{ animationDuration: '12s', animationDelay: '0s' }}>
        <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-white/20 to-transparent blur-sm"></div>
      </div>

      {/* Orb 2: Bottom left huge */}
      <div className="absolute bottom-[10%] left-[5%] w-48 h-48 rounded-full glass bg-blue-400/5 border border-blue-200/10 shadow-[0_0_60px_rgba(37,99,235,0.1),inset_0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-xl animate-float-medium opacity-60"
           style={{ animationDuration: '15s', animationDelay: '-5s' }}>
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-tl from-blue-300/10 to-transparent blur-md"></div>
      </div>

      {/* Orb 3: Small passing by */}
      <div className="absolute top-[40%] left-[20%] w-16 h-16 rounded-full glass border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-sm animate-float-fast opacity-50"
           style={{ animationDuration: '8s', animationDelay: '-2s' }}>
      </div>

      {/* Abstract floating ring / card */}
      <div className="absolute bottom-[35%] right-[15%] w-40 h-24 rounded-2xl glass border border-indigo-200/10 bg-indigo-500/5 backdrop-blur-xl shadow-2xl animate-float-slow rotate-12 opacity-70"
           style={{ animationDuration: '18s', animationDelay: '-7s' }}>
        <div className="w-full h-full border-t border-l border-white/10 rounded-2xl absolute inset-0"></div>
      </div>
    </div>
  );
}
