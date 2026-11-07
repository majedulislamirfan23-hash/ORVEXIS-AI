import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Terminal,
  Brain,
  Sparkles,
  GraduationCap,
  Briefcase,
  Gamepad2,
  Atom,
  ArrowRight,
  Search,
} from 'lucide-react';
import { ActiveView } from '../types';

interface ExploreHubProps {
  onSelectPrompt: (prompt: string, view?: ActiveView) => void;
  onNavigateView: (view: ActiveView) => void;
}

export const ExploreHub: React.FC<ExploreHubProps> = ({ onSelectPrompt, onNavigateView }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'coding', label: 'Software & Code' },
    { id: 'science', label: 'Science & Math' },
    { id: 'reasoning', label: 'Reasoning & Logic' },
    { id: 'creative', label: 'Creative & Media' },
    { id: 'business', label: 'Strategy & Enterprise' },
  ];

  const cards = [
    {
      title: 'ORVEXIS THINK Protocol',
      category: 'reasoning',
      icon: Brain,
      color: 'text-purple-400',
      badge: 'Reasoning',
      prompt: 'Deconstruct the systemic trade-offs between centralized AI deployment vs federated edge intelligence.',
      view: 'think' as ActiveView,
    },
    {
      title: 'Quantum Entanglement Visualizer',
      category: 'science',
      icon: Atom,
      color: 'text-cyan-400',
      badge: 'Physics',
      prompt: 'Explain the Einstein-Podolsky-Rosen paradox and Bell theorem inequalities in clear mathematical and conceptual steps.',
      view: 'study' as ActiveView,
    },
    {
      title: 'Rust Concurrency Workstation',
      category: 'coding',
      icon: Terminal,
      color: 'text-blue-400',
      badge: 'Code',
      prompt: 'Write an asynchronous channel-based thread pool in Rust utilizing Tokio, Arc, and Mutex with graceful shutdown.',
      view: 'code' as ActiveView,
    },
    {
      title: 'Multimodal Vision Inspection',
      category: 'creative',
      icon: Sparkles,
      color: 'text-pink-400',
      badge: 'Vision',
      prompt: 'Inspect the optical refraction, internal particulate luminescence, and color dynamics of the ORVEXIS neural symbol.',
      view: 'vision' as ActiveView,
    },
    {
      title: 'SaaS Go-To-Market Architecture',
      category: 'business',
      icon: Briefcase,
      color: 'text-emerald-400',
      badge: 'Strategy',
      prompt: 'Formulate a 12-month zero-CAC developer adoption funnel for an open-source vector database.',
      view: 'chat' as ActiveView,
    },
    {
      title: 'Game Loop & Physics Mechanics',
      category: 'coding',
      icon: Gamepad2,
      color: 'text-amber-400',
      badge: 'Gaming',
      prompt: 'Implement a spatial partition grid algorithm in TypeScript for broadphase collision detection in a 2D canvas game.',
      view: 'code' as ActiveView,
    },
    {
      title: 'Dyson Swarm Worldbuilding',
      category: 'creative',
      icon: Compass,
      color: 'text-purple-400',
      badge: 'Worldbuilding',
      prompt: 'Draft an evocative chronicle documenting the first generation of orbital engineers building solar collectors around Betelgeuse.',
      view: 'create' as ActiveView,
    },
    {
      title: 'Deep Machine Learning Math',
      category: 'science',
      icon: Cpu,
      color: 'text-cyan-400',
      badge: 'Mathematics',
      prompt: 'Derive backpropagation equations for Multi-Head Attention step-by-step with matrix dimension notations.',
      view: 'study' as ActiveView,
    },
  ];

  const filtered = cards.filter((c) => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.prompt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#05060b] text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300">
              <Compass className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                EXPLORE ORVEXIS INTELLIGENCE
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                CURATED PROMPTS, COGNITIVE DOMAINS & TOOL MATRIX
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Discover the expansive multi-discipline breadth of ORVEXIS AI. Select a domain below
            or click any card to load the prompt directly into its specialized module.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search capabilities..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectPrompt(card.prompt, card.view)}
                className="p-5 rounded-2xl glass-panel glass-panel-hover transition-all duration-300 flex flex-col justify-between group cursor-pointer border border-white/[0.06]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10">
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-display text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {card.prompt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-cyan-400 font-mono">
                  <span>LAUNCH PROTOCOL</span>
                  <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
