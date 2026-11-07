import React from 'react';
import { X, Sparkles, Cpu, ShieldCheck, Terminal, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="relative w-full max-w-xl bg-[#090b14] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 bg-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <img
                src="/assets/aistudio/1794037215776_5d40d62c.jpg"
                alt="ORVEXIS"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                ABOUT ORVEXIS AI
              </h2>
              <p className="text-[11px] font-mono text-cyan-300">
                KERNEL 2.4.0-NEXUS • COGNITIVE MATRIX
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Close about modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Hero Symbol */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl glass-panel border border-cyan-500/20">
            <div className="relative w-28 h-28 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-cyan-500/30 to-blue-600/40 blur-xl animate-pulse-glow" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.5)] p-0.5 bg-black">
                <img
                  src="/assets/aistudio/1794037215776_5d40d62c.jpg"
                  alt="ORVEXIS Core Symbol"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold font-display text-white tracking-wider mb-1">
              ORVEXIS AI
            </h3>
            <p className="text-xs font-mono text-cyan-300 mb-3">
              Beyond the Mind. Beyond Limits.
            </p>
            <p className="text-xs text-slate-400 font-light max-w-md">
              A bespoke, next-generation digital intelligence engineered to elevate human cognition,
              creative expression, software architecture, and scientific problem-solving.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-white">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Autonomous Cognition</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ORVEXIS THINK breaks multifaceted queries down through deductive hypothesis chains
                and counter-arguments.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-white">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Multimodal Vision</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct pixel perception powered by Gemini 3.8 Flash for UI reverse engineering,
                palette extraction, and aesthetic inspection.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-white">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Quantum Code Studio</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Software synthesis spanning TypeScript, Python, Rust, and Go with complexity
                analysis and unit testing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Retention Privacy</span>
              </div>
              <p className="text-[11px] text-slate-400">
                You maintain strict control of your memory vault. No unapproved persistence,
                and instant one-click history deletion.
              </p>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[11px] space-y-1.5 text-slate-400">
            <div className="text-xs font-semibold text-slate-300 uppercase mb-2">
              System Specifications
            </div>
            <div className="flex justify-between">
              <span>Primary Engine:</span>
              <span className="text-cyan-300">Gemini 3.8 Flash (Server-Side)</span>
            </div>
            <div className="flex justify-between">
              <span>Response Protocol:</span>
              <span className="text-purple-300">HTTP/2 Server-Sent Events (SSE)</span>
            </div>
            <div className="flex justify-between">
              <span>Speech Engine:</span>
              <span className="text-slate-200">Web Speech API + Synthesizer Matrix</span>
            </div>
            <div className="flex justify-between">
              <span>Interface Framework:</span>
              <span className="text-slate-200">React 19 + Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            © 2026 ORVEXIS AI • All Systems Nominal
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
