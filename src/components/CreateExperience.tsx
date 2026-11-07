import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Feather,
  RotateCw,
  Copy,
  Check,
  MessageSquare,
  Compass,
} from 'lucide-react';

interface CreateExperienceProps {
  onSendToChat: (content: string) => void;
}

export const CreateExperience: React.FC<CreateExperienceProps> = ({ onSendToChat }) => {
  const [theme, setTheme] = useState(
    'A sentient artificial intelligence waking up inside a derelict Dyson sphere orbiting an ancient red dwarf star.'
  );
  const [category, setCategory] = useState('sci-fi');
  const [tone, setTone] = useState('visionary');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      title: 'Dyson Sphere Awakening',
      theme: 'A sentient artificial intelligence waking up inside a derelict Dyson sphere orbiting an ancient red dwarf star.',
      category: 'sci-fi',
      tone: 'haunting',
    },
    {
      title: 'Neon Megacity Sub-Levels',
      theme: 'In Neo-Kyoto 2148, an underground cyber-cartographer maps forgotten subterranean fiber ducts where digital ghosts gather.',
      category: 'cyberpunk',
      tone: 'visionary',
    },
    {
      title: 'Post-Biological Manifesto',
      theme: 'A poetic philosophical declaration authored by an interstellar collective transitioning from flesh to light-encoded thought.',
      category: 'manifesto',
      tone: 'grand',
    },
  ];

  const handleCreate = async () => {
    if (!theme.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, category, tone, length }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Creative generation failed');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during creative generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#05060b] text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-pink-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-pink-600/20 border border-pink-500/30 text-pink-300">
              <Feather className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                ORVEXIS CREATE
              </h2>
              <p className="text-xs font-mono text-pink-300">
                FUTURISTIC WORLDBUILDING & NARRATIVE STUDIO
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Weave transcendent speculative fiction, cyberpunk lore, visionary essays, or
            evocative imagery through elevated literary prose.
          </p>
        </div>

        {/* Input Box */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
              Narrative Premise / World / Theme
            </label>
            <textarea
              rows={4}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Describe the setting, characters, moral paradox, or sensory atmosphere..."
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-400"
              >
                <option value="sci-fi">Hard Sci-Fi</option>
                <option value="cyberpunk">Cyberpunk & Synthetic</option>
                <option value="cosmic">Cosmic Horror / Void</option>
                <option value="manifesto">Philosophical Manifesto</option>
                <option value="dialogue">Thought Experiment Dialogue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Tone & Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-400"
              >
                <option value="visionary">Visionary & Transcendent</option>
                <option value="haunting">Haunting & Melancholic</option>
                <option value="grand">Epic & Monumental</option>
                <option value="gritty">Gritty & Grounded</option>
                <option value="poetic">Poetic & Cryptic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-400"
              >
                <option value="short">Flash (approx. 200 words)</option>
                <option value="medium">Standard (approx. 450 words)</option>
                <option value="extended">Immersive (approx. 800 words)</option>
              </select>
            </div>
          </div>

          {/* Presets */}
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
              WORLDBUILDING PROMPTS:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTheme(p.theme);
                    setCategory(p.category);
                    setTone(p.tone);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-300 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreate}
              disabled={!theme.trim() || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs font-display tracking-wider transition-all cursor-pointer ${
                theme.trim() && !loading
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(236,72,153,0.4)]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-pink-300" />
                  <span>WEAVING REALITY & WORDS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-pink-200" />
                  <span>GENERATE CREATIVE WORK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Narrative Output */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-pink-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_#f472b6]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-pink-300 uppercase">
                  WORLDBUILDING FOLIO READY
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => onSendToChat(`[ORVEXIS CREATE PIECE: ${theme.slice(0, 40)}...]\n\n${result}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 text-xs text-pink-200 border border-pink-500/40 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send to Chat</span>
                </button>
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed font-normal">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
