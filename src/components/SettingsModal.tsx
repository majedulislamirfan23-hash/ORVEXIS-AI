import React, { useState } from 'react';
import {
  X,
  Settings,
  Brain,
  Sliders,
  Palette,
  Volume2,
  Trash2,
  Plus,
  Shield,
  Download,
  Check,
  Globe,
  Zap,
} from 'lucide-react';
import { UserSettings, MemoryItem, AppTheme, AccentColor, ResponseStyle, ThinkingLevelSetting, SpeedEngine } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  memories: MemoryItem[];
  onAddMemory: (key: string, value: string, category: 'preference' | 'fact' | 'work' | 'identity') => void;
  onToggleMemory: (id: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
  onClearAllConversations: () => void;
  onExportHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  memories,
  onAddMemory,
  onToggleMemory,
  onDeleteMemory,
  onClearAllMemories,
  onClearAllConversations,
  onExportHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'memory' | 'voice' | 'privacy'>('general');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'fact' | 'work' | 'identity'>('preference');
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddMemory(newKey.trim(), newValue.trim(), newCategory);
    setNewKey('');
    setNewValue('');
  };

  const themes: Array<{ id: AppTheme; label: string; desc: string }> = [
    { id: 'obsidian', label: 'Obsidian Void', desc: 'Ultra-dark deep obsidian space' },
    { id: 'cyber-indigo', label: 'Cyber Indigo', desc: 'High-contrast midnight purple tones' },
    { id: 'electric-cyan', label: 'Electric Cyan', desc: 'Deep bioluminescent cyan aura' },
    { id: 'neon-amethyst', label: 'Neon Amethyst', desc: 'Luminous violet cybernetics' },
  ];

  const accents: Array<{ id: AccentColor; label: string; colorClass: string }> = [
    { id: 'purple', label: 'Electric Violet', colorClass: 'bg-purple-500' },
    { id: 'cyan', label: 'Cyber Cyan', colorClass: 'bg-cyan-400' },
    { id: 'blue', label: 'Sapphire Cobalt', colorClass: 'bg-blue-500' },
    { id: 'pink', label: 'Plasma Pink', colorClass: 'bg-pink-500' },
    { id: 'emerald', label: 'Matrix Emerald', colorClass: 'bg-emerald-400' },
  ];

  const responseStyles: Array<{ id: ResponseStyle; label: string; desc: string }> = [
    { id: 'balanced', label: 'Balanced', desc: 'Insightful, engaging, and thorough' },
    { id: 'concise', label: 'Concise & Direct', desc: 'Brevity-first, no filler words' },
    { id: 'deep', label: 'Deep & Analytical', desc: 'Rigorous cognitive deconstruction' },
    { id: 'creative', label: 'Creative & Visionary', desc: 'Evocative phrasing & worldbuilding' },
    { id: 'technical', label: 'Technical & Code-Focused', desc: 'Mathematical and architectural rigor' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="relative w-full max-w-2xl bg-[#090b14] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                ORVEXIS PERSONALIZATION & MEMORY
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                TAILOR COGNITIVE RESPONSE, STYLING & NEURAL VAULT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/[0.06] bg-black/40 px-4">
          {[
            { id: 'general', label: 'Preferences & Style', icon: Sliders },
            { id: 'memory', label: `Personal Memory (${memories.length})`, icon: Brain },
            { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
            { id: 'privacy', label: 'Data & Privacy', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                  isSel
                    ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: General & Appearance */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* User Name */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                  Your Preferred Name / Call-Sign
                </label>
                <input
                  type="text"
                  value={settings.userName || ''}
                  onChange={(e) => onUpdateSettings({ userName: e.target.value })}
                  placeholder="e.g. Alex, Commander, Architect..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Extraordinary Thinking Level */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Cognitive Thinking Level (Reasoning Depth)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'extraordinary',
                      label: 'Extraordinary Deep Mind',
                      desc: 'Maximum multi-step reasoning, hypothesis testing & cognitive decomposition',
                      icon: Brain,
                    },
                    {
                      id: 'fast',
                      label: 'Turbo High-Speed',
                      desc: 'Lowest latency, maximum velocity & fastest-growing tokens',
                      icon: Zap,
                    },
                  ].map((level) => {
                    const isSelected = (settings.thinkingLevel || 'extraordinary') === level.id;
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            thinkingLevel: level.id as ThinkingLevelSetting,
                            speedEngine: level.id === 'fast' ? 'hyper-fast' : 'deep-cognitive',
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-400/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-semibold">{level.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">{level.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Response Style */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Cognitive Response Style
                </label>
                <div className="space-y-1.5">
                  {responseStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onUpdateSettings({ responseStyle: style.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        settings.responseStyle === style.id
                          ? 'bg-purple-950/40 border-purple-400/50 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{style.label}</div>
                        <div className="text-[11px] text-slate-400">{style.desc}</div>
                      </div>
                      {settings.responseStyle === style.id && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Accent Luminescence
                </label>
                <div className="flex items-center gap-3">
                  {accents.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => onUpdateSettings({ accentColor: acc.id })}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        settings.accentColor === acc.id
                          ? 'border-white/40 bg-white/10'
                          : 'border-white/5 bg-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${acc.colorClass}`} />
                      <span className="text-xs text-slate-300">{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Language */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                  Natural Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => onUpdateSettings({ language: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español (Spanish)</option>
                  <option value="French">Français (French)</option>
                  <option value="German">Deutsch (German)</option>
                  <option value="Japanese">日本語 (Japanese)</option>
                  <option value="Chinese">中文 (Chinese)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="Arabic">العربية (Arabic)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Personal Memory Vault */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              {/* Memory Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl glass-panel border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Autonomous Memory System
                    </div>
                    <div className="text-[11px] text-slate-400">
                      When enabled, ORVEXIS references approved personal facts in conversations.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.memoryEnabled}
                    onChange={(e) => onUpdateSettings({ memoryEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>

              {/* Add New Memory Record Form */}
              <form onSubmit={handleAddMemorySubmit} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  Add User-Approved Fact or Preference
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Key (e.g. Preferred Tech Stack)"
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value (e.g. Next.js, Tailwind, Python)"
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="preference">Preference</option>
                    <option value="fact">Fact</option>
                    <option value="work">Work & Domain</option>
                    <option value="identity">Identity</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newKey.trim() || !newValue.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 text-xs font-medium border border-purple-500/40 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Store Fact</span>
                  </button>
                </div>
              </form>

              {/* Active Memories List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>ACTIVE RECALLED MEMORIES ({memories.length})</span>
                  {memories.length > 0 && (
                    <button
                      onClick={onClearAllMemories}
                      className="text-red-400 hover:text-red-300 text-[11px] transition-colors"
                    >
                      Delete All Memories
                    </button>
                  )}
                </div>

                {memories.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                    No memories stored yet. Add preferences above or converse with ORVEXIS.
                  </div>
                ) : (
                  memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <input
                          type="checkbox"
                          checked={mem.enabled}
                          onChange={() => onToggleMemory(mem.id)}
                          className="rounded bg-black/40 border-white/20 text-purple-600"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{mem.key}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                              {mem.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{mem.value}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors ml-2"
                        title="Delete this memory"
                        aria-label={`Delete memory ${mem.key}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Privacy Disclaimer */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-cyan-200/80 leading-relaxed">
                  <strong>Zero Unapproved Retention:</strong> ORVEXIS never shares or stores sensitive
                  passwords, financial data, or credentials. All stored preferences remain strictly under
                  your control and can be purged at any time.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Voice & Speech */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                  Voice Persona Model
                </label>
                <select
                  value={settings.voiceVoice}
                  onChange={(e) => onUpdateSettings({ voiceVoice: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Orvexis Nova">Orvexis Nova (Harmonic Synthetic)</option>
                  <option value="Orvexis Pulse">Orvexis Pulse (Deep Resonant)</option>
                  <option value="Orvexis Quantum">Orvexis Quantum (Crisp Analytical)</option>
                  <option value="System Default">Default Operating System Synthesizer</option>
                </select>
              </div>

              {/* Rate */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span>Speech Cadence / Rate</span>
                  <span>{settings.voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={settings.voiceRate}
                  onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Pitch */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span>Vocal Pitch Frequency</span>
                  <span>{settings.voicePitch}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={settings.voicePitch}
                  onChange={(e) => onUpdateSettings({ voicePitch: parseFloat(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Auto Read */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Auto-Read AI Responses
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automatically speak completed chat responses aloud.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoReadResponses}
                    onChange={(e) => onUpdateSettings({ autoReadResponses: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: Data & Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-200 uppercase">
                  Data Portability & Export
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export your conversation archive and stored memories as a structured JSON file.
                </p>
                <button
                  onClick={onExportHistory}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/30 text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Complete Archive (JSON)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-3">
                <div className="text-xs font-mono font-semibold text-red-300 uppercase">
                  Danger Zone
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permanently clear all chat sessions from local storage. This action cannot be undone.
                </p>
                <button
                  onClick={() => {
                    onClearAllConversations();
                    setClearedNotice(true);
                    setTimeout(() => setClearedNotice(false), 2500);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All Conversations</span>
                </button>
                {clearedNotice && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3" />
                    <span>All conversation records purged successfully.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
