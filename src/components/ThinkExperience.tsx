import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  RotateCw,
  MessageSquare,
} from 'lucide-react';

interface ThinkExperienceProps {
  onSendToChat: (content: string) => void;
}

export const ThinkExperience: React.FC<ThinkExperienceProps> = ({ onSendToChat }) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'exhaustive'>('deep');
  const [domain, setDomain] = useState('tech');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleProblems = [
    {
      title: 'Distributed Consensus',
      prompt: 'How to design a Byzantine Fault Tolerant consensus mechanism with sub-second finality under high network partition risk?',
      domain: 'tech',
    },
    {
      title: 'Fermi Paradox Solution',
      prompt: 'Re-evaluating the Great Filter hypothesis against modern exoplanet discoveries and self-replicating von Neumann probes.',
      domain: 'science',
    },
    {
      title: 'Scalable Monorepo Migration',
      prompt: 'Trade-offs between micro-frontends vs unified monorepo with Turborepo for an engineering team of 250 developers.',
      domain: 'tech',
    },
  ];

  const handleExecute = async () => {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, depth, domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete cognitive breakdown');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during structured analysis.');
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
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-purple-500/20">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                ORVEXIS THINK
              </h2>
              <p className="text-xs font-mono text-purple-300">
                STRUCTURED COGNITIVE REASONING PROTOCOL
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mt-3 max-w-2xl">
            Deconstruct high-complexity problems through a multi-phase cognitive pipeline:
            Premise framing, branching hypotheses, deductive analysis, blind-spot counter-arguments,
            and an actionable synthesis.
          </p>
        </div>

        {/* Input Configuration Box */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Problem / Dilemma / Complex Inquiry
            </label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a complex challenge, architectural dilemma, scientific paradox, or strategy problem..."
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 leading-relaxed"
            />
          </div>

          {/* Depth and Domain selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Cognitive Depth
              </label>
              <div className="flex rounded-lg bg-black/30 p-1 border border-white/10">
                {(['standard', 'deep', 'exhaustive'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all cursor-pointer ${
                      depth === d
                        ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Domain Matrix
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/10 p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="tech">Software Architecture & Technology</option>
                <option value="science">Physics, Mathematics & Science</option>
                <option value="strategy">Business Strategy & Product</option>
                <option value="logic">Pure Logic & Analytical Reasoning</option>
                <option value="philosophy">Philosophy & Ethics</option>
              </select>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-mono text-slate-500 block mb-2">
              OR TEST WITH SAMPLE CHALLENGES:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleProblems.map((prob, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(prob.prompt);
                    setDomain(prob.domain);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-300 transition-colors"
                >
                  {prob.title}
                </button>
              ))}
            </div>
          </div>

          {/* Execute button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleExecute}
              disabled={!topic.trim() || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs font-display tracking-wider transition-all cursor-pointer ${
                topic.trim() && !loading
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-purple-300" />
                  <span>ANALYZING SYNAPSE PATHS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>EXECUTE COGNITIVE PROTOCOL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Structured Result Display */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-cyan-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
                  COGNITIVE SYNTHESIS COMPLETE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Analysis'}</span>
                </button>

                <button
                  onClick={() => onSendToChat(`[ORVEXIS THINK REPORT]\n\n${result}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-xs text-purple-200 border border-purple-500/40 transition-colors"
                  title="Open in Chat to explore deeper"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send to Chat</span>
                </button>
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
