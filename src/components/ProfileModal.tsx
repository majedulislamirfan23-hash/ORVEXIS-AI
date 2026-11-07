import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Sparkles,
  Cpu,
  Terminal,
  Mic,
  Brain,
  Check,
  Edit2,
  Bookmark,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  totalConversations: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  totalConversations,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [callSign, setCallSign] = useState(profile.callSign || 'Architect');
  const [title, setTitle] = useState(profile.title || 'Autonomous Systems Engineer');
  const [bio, setBio] = useState(
    profile.bio || 'Exploring frontier AI, quantum computing, and high-performance digital systems.'
  );
  const [nativeLanguage, setNativeLanguage] = useState(profile.nativeLanguage || 'English');
  const [newInterest, setNewInterest] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile({
      callSign,
      title,
      bio,
      nativeLanguage,
    });
    setIsEditing(false);
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    const clean = newInterest.trim();
    if (!profile.interests.includes(clean)) {
      onUpdateProfile({
        interests: [...profile.interests, clean],
      });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    onUpdateProfile({
      interests: profile.interests.filter((i) => i !== interest),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="relative w-full max-w-2xl bg-[#090b14] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300">
              <User className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                ORVEXIS PERSONAL PROFILE
              </h2>
              <p className="text-[11px] font-mono text-cyan-300">
                USER SYNAPSE CREDENTIALS & COGNITIVE METRICS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
          {/* Hero Avatar & Identity Card */}
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Holographic Avatar with glowing ring */}
            <div className="relative w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] p-0.5 bg-black">
              <img
                src="/assets/aistudio/1794037215776_5d40d62c.jpg"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold font-display text-white tracking-wide">
                    {callSign}
                  </h3>
                  <p className="text-xs font-mono text-cyan-300">{title}</p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {!isEditing ? (
                <p className="text-xs text-slate-400 leading-relaxed font-light">{bio}</p>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Call-Sign / Name
                      </label>
                      <input
                        type="text"
                        value={callSign}
                        onChange={(e) => setCallSign(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Professional Role / Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Bio / Focus Areas
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Native Language
                    </label>
                    <select
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="English">English</option>
                      <option value="Bangla">বাংলা (Bangla)</option>
                      <option value="Spanish">Español (Spanish)</option>
                      <option value="French">Français (French)</option>
                      <option value="German">Deutsch (German)</option>
                      <option value="Japanese">日本語 (Japanese)</option>
                      <option value="Chinese">中文 (Chinese)</option>
                      <option value="Arabic">العربية (Arabic)</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600/40 hover:bg-cyan-600/60 text-cyan-200 text-xs font-semibold border border-cyan-400/50 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity & Cognitive Metrics Grid */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider">
              INTELLIGENCE SYNAPSE METRICS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <Cpu className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold font-display text-white">
                  {profile.stats.queriesCount}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Cognitive Queries</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <Mic className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold font-display text-white">
                  {profile.stats.voiceSessions}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Voice Transmissions</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <Terminal className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold font-display text-white">
                  {profile.stats.codeModulesBuilt}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Code Modules</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <Brain className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold font-display text-white">
                  {profile.stats.memoriesStored}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Stored Facts</div>
              </div>
            </div>
          </div>

          {/* Research & Study Interests */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider">
              DOMAIN & STUDY INTERESTS
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-red-400 transition-colors ml-1"
                    title={`Remove ${interest}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddInterest} className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add new research or study domain..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!newInterest.trim()}
                className="px-4 py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-medium cursor-pointer disabled:opacity-40"
              >
                Add
              </button>
            </form>
          </div>

          {/* Total Sessions Banner */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs font-mono text-purple-300">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>TOTAL ACTIVE CONVERSATION SESSIONS</span>
            </div>
            <span className="font-bold text-white text-sm">{totalConversations}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
