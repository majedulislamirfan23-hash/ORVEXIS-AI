import React from 'react';
import {
  Menu,
  Mic,
  Brain,
  Globe,
  Settings,
  Sparkles,
  Layers,
  Volume2,
  User,
} from 'lucide-react';
import { ActiveView, UserSettings } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  onOpenMobileMenu: () => void;
  onOpenVoiceModal: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onReplayIntro: () => void;
  settings: UserSettings;
  onToggleWebSearch: () => void;
  memoryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenMobileMenu,
  onOpenVoiceModal,
  onOpenSettings,
  onOpenProfile,
  onReplayIntro,
  settings,
  onToggleWebSearch,
  memoryCount,
}) => {
  const getViewTitle = (view: ActiveView): { title: string; subtitle: string; icon: any } => {
    switch (view) {
      case 'chat':
        return { title: 'ORVEXIS CHAT', subtitle: 'Autonomous Conversational Core', icon: Sparkles };
      case 'explore':
        return { title: 'EXPLORE AI', subtitle: 'Capabilities & Intelligent Prompts', icon: Layers };
      case 'think':
        return { title: 'ORVEXIS THINK', subtitle: 'Structured Cognitive Analysis Protocol', icon: Brain };
      case 'code':
        return { title: 'ORVEXIS CODE', subtitle: 'Software Engineering & Synthesis', icon: Brain };
      case 'vision':
        return { title: 'ORVEXIS VISION', subtitle: 'Multimodal Image Inspector', icon: Sparkles };
      case 'study':
        return { title: 'ORVEXIS STUDY', subtitle: 'Pedagogical Deep Learning Matrix', icon: Sparkles };
      case 'document':
        return { title: 'DOCUMENT ASSISTANT', subtitle: 'Contextual Document Synthesizer', icon: Layers };
      case 'create':
        return { title: 'ORVEXIS CREATE', subtitle: 'Visionary Narrative & Worldbuilding', icon: Sparkles };
      case 'tools':
        return { title: 'INTELLIGENCE TOOLS', subtitle: 'Modular Problem Solvers', icon: Layers };
      case 'settings':
        return { title: 'SETTINGS & MEMORY', subtitle: 'Personalization & Neural Vault', icon: Settings };
      case 'profile':
        return { title: 'PERSONAL PROFILE', subtitle: 'User Credentials & Synapse Metrics', icon: User };
      case 'about':
        return { title: 'ABOUT ORVEXIS', subtitle: 'Kernel Architecture & Vision', icon: Layers };
      default:
        return { title: 'ORVEXIS AI', subtitle: 'Beyond Limits', icon: Sparkles };
    }
  };

  const { title, subtitle } = getViewTitle(activeView);

  return (
    <header className="h-16 px-4 lg:px-6 bg-[#07080f]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between shrink-0 z-20">
      {/* Left: Mobile Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-7 h-7 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <img
              src="/assets/aistudio/1794037215776_5d40d62c.jpg"
              alt="ORVEXIS"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider font-display text-white">
                {title}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                ONLINE
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                <Brain className="w-2.5 h-2.5 text-purple-400" />
                EXTRAORDINARY COGNITION
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-light truncate max-w-xs sm:max-w-md">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Web Search Grounding Toggle */}
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            settings.webSearchEnabled
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-white/[0.06]'
          }`}
          title="Toggle Web Search Grounding"
          aria-label="Toggle Web Search"
        >
          <Globe className={`w-3.5 h-3.5 ${settings.webSearchEnabled ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline font-mono text-[11px]">
            {settings.webSearchEnabled ? 'Search ON' : 'Search OFF'}
          </span>
        </button>

        {/* Memory Vault Pill */}
        <button
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-purple-500/30 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 transition-colors"
          title="Memory & Preferences"
          aria-label="Personal Memory Vault"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono text-[11px]">
            Memory: {settings.memoryEnabled ? `${memoryCount} facts` : 'Off'}
          </span>
        </button>

        {/* Voice Mode Button */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 cursor-pointer"
          aria-label="Launch ORVEXIS Voice System"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-200" />
          <span className="hidden sm:inline font-display tracking-wider">VOICE MODE</span>
          <span className="sm:hidden font-mono">VOICE</span>
        </button>

        {/* Profile button */}
        <button
          onClick={onOpenProfile}
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors"
          title="Personal Profile & Synapse Metrics"
          aria-label="Open Personal Profile"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Personalization & Settings"
          aria-label="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Replay Intro button */}
        <button
          onClick={onReplayIntro}
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-slate-400 hover:text-purple-300 hover:bg-white/[0.05]"
          title="Replay cinematic entrance"
          aria-label="Replay intro entrance"
        >
          INTRO
        </button>
      </div>
    </header>
  );
};
