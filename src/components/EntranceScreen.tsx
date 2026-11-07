import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Cpu, Mic, Terminal, Globe, Shield } from 'lucide-react';

interface EntranceScreenProps {
  onEnter: () => void;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // 3D Tilt calculation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = ((clientX - innerWidth / 2) / (innerWidth / 2)) * 14;
    const y = -((clientY - innerHeight / 2) / (innerHeight / 2)) * 14;
    setTilt({ x, y });
  };

  // 3D Canvas Particle Starfield & Neural Lattice
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D particles with z-depth
    const count = Math.min(80, Math.floor((width * height) / 16000));
    const particles = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 800 + 100,
      radius: Math.random() * 2 + 1,
      color:
        Math.random() > 0.6
          ? 'rgba(6, 182, 212, ' // Cyan
          : Math.random() > 0.3
          ? 'rgba(168, 85, 247, ' // Purple
          : 'rgba(226, 232, 240, ', // Silver
      alpha: Math.random() * 0.6 + 0.2,
      baseSpeed: Math.random() * 0.4 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      // Draw particles with 3D projection
      for (const p of particles) {
        p.z -= p.baseSpeed;
        if (p.z <= 10) {
          p.z = 800;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        const size = p.radius * scale * 2.2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * scale})`;
          ctx.shadowBlur = 10 * scale;
          ctx.shadowColor = p.color.includes('182') ? '#06b6d4' : '#a855f7';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Enter on key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter]);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#040508] text-white flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden select-none"
      style={{ perspective: '1200px' }}
    >
      {/* 3D Particle Starfield */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      {/* Radial ambient lighting: purple, electric blue & silver */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-gradient-to-tr from-purple-900/25 via-cyan-900/20 to-slate-800/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header / Neural Status */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#22d3ee]" />
          <span className="text-xs tracking-[0.25em] uppercase text-cyan-300 font-mono font-semibold">
            NEURAL ENGINE ONLINE
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-purple-300">
            ORVEXIS V2.0 — NEXT GEN
          </span>
          <span className="text-cyan-300 font-semibold">GEMINI 3.8 FLASH</span>
        </div>
      </header>

      {/* Center 3D Holographic AI Core */}
      <main className="relative z-10 flex flex-col items-center text-center my-auto py-8 max-w-3xl">
        {/* Welcome Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-indigo-900/40 border border-cyan-400/30 text-xs font-mono tracking-widest text-cyan-200 uppercase mb-6 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
          <span>WELCOME TO ORVEXIS</span>
        </div>

        {/* 3D Holographic Core & Orbital Rings with Tilt Reaction */}
        <div
          ref={coreRef}
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.15s ease-out',
          }}
          className="relative w-56 h-56 sm:w-68 sm:h-68 mb-8 flex items-center justify-center cursor-pointer group"
          onClick={onEnter}
        >
          {/* Outermost Cybernetic Orbital Ring */}
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="absolute inset-[-24px] rounded-full border border-purple-500/30 border-dashed animate-spin-slow pointer-events-none"
          />

          {/* Secondary Counter-Rotating Holographic Ring */}
          <div
            style={{ transform: 'translateZ(15px)' }}
            className="absolute inset-[-10px] rounded-full border-2 border-cyan-400/40 border-t-transparent border-b-transparent animate-spin-reverse-slow pointer-events-none"
          />

          {/* Volumetric Holographic Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-cyan-500/40 to-blue-600/40 blur-2xl animate-pulse-glow" />

          {/* Central ORVEXIS Core Image Symbol */}
          <div
            style={{ transform: 'translateZ(45px)' }}
            className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.6),0_0_120px_rgba(168,85,247,0.4)] border-2 border-cyan-400/60 p-1 bg-[#090a14] transition-transform duration-500 group-hover:scale-105"
          >
            <img
              src="/assets/aistudio/1794037215776_5d40d62c.jpg"
              alt="ORVEXIS AI Core Symbol"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* 3D Floating Hologram Badge */}
          <div
            style={{ transform: 'translateZ(65px)' }}
            className="absolute -bottom-4 bg-[#0d0f1c]/95 backdrop-blur-xl px-4 py-1.2 rounded-full border border-cyan-400/50 text-[11px] font-mono tracking-widest text-cyan-300 uppercase shadow-xl shadow-cyan-950/80"
          >
            QUANTUM SYNAPSE CORE
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider mb-3">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent font-display drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]">
            ORVEXIS AI
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-light tracking-wide text-slate-200 mb-6 max-w-xl">
          Beyond the Mind.{' '}
          <span className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-indigo-300 bg-clip-text">
            Beyond Limits.
          </span>
        </p>

        {/* Subtitle brief */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-10 leading-relaxed font-light">
          Next-generation digital intelligence engineered for voice conversations, autonomous
          cognitive reasoning, software development, multimodal vision, and pedagogical mastery.
        </p>

        {/* Start Exploring Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl font-medium text-white text-base tracking-wide transition-all duration-300 overflow-hidden shadow-[0_0_35px_-5px_rgba(139,92,246,0.7)] hover:shadow-[0_0_55px_rgba(6,182,212,0.9)] active:scale-95 cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400"
            aria-label="Start Exploring ORVEXIS AI"
          >
            <span className="relative z-10 font-bold tracking-wider font-display">
              START EXPLORING
            </span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5 text-cyan-200" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-4 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300 text-[10px]">
            ENTER ↵
          </kbd>
          <span>to initialize holographic interface</span>
        </div>
      </main>

      {/* Feature Capabilities Matrix */}
      <footer className="relative z-10 w-full max-w-4xl pt-6 border-t border-white/[0.08]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <Mic className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">VOICE MATRIX</div>
              <div className="text-[10px] text-slate-400">Natural voice assistant</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">ORVEXIS THINK</div>
              <div className="text-[10px] text-slate-400">Structured reasoning</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">CODE STUDIO</div>
              <div className="text-[10px] text-slate-400">Engineering & debug</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">WEB SEARCH</div>
              <div className="text-[10px] text-slate-400">Verified live citations</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
