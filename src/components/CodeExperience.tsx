import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Code2,
  Terminal,
  Bug,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface CodeExperienceProps {
  onSendToChat: (content: string) => void;
}

export const CodeExperience: React.FC<CodeExperienceProps> = ({ onSendToChat }) => {
  const [code, setCode] = useState(`// Sample TypeScript: LRU Cache Implementation
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`);

  const [language, setLanguage] = useState('typescript');
  const [task, setTask] = useState<'explain' | 'debug' | 'optimize' | 'tests' | 'generate'>('optimize');
  const [contextNote, setContextNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tasks = [
    { id: 'optimize', label: 'Optimize Complexity', icon: Zap, desc: 'Enhance runtime & space complexity' },
    { id: 'debug', label: 'Detect & Fix Bugs', icon: Bug, desc: 'Find vulnerabilities & edge cases' },
    { id: 'explain', label: 'Explain Logic', icon: Code2, desc: 'Architecture & algorithmic breakdown' },
    { id: 'tests', label: 'Generate Unit Tests', icon: CheckCircle2, desc: 'Comprehensive test suites' },
    { id: 'generate', label: 'Extend Feature', icon: Terminal, desc: 'Add new capabilities' },
  ];

  const handleRun = async () => {
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          task,
          language,
          additionalContext: contextNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Code synthesis failed');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during code processing.');
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300">
              <Code2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                ORVEXIS CODE
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                ADVANCED SOFTWARE ENGINEERING & CODE SYNTHESIS
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Autonomous software engineering suite. Analyze algorithmic bottlenecks, generate
            resilient unit tests, refactor legacy code, or craft production-grade components.
          </p>
        </div>

        {/* Task Selection Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tasks.map((t) => {
            const Icon = t.icon;
            const isSelected = task === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTask(t.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <div className="text-xs font-semibold">{t.label}</div>
              </button>
            );
          })}
        </div>

        {/* Editor & Settings */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
                <option value="html">HTML/CSS</option>
              </select>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              {code.split('\n').length} lines
            </span>
          </div>

          {/* Code Textarea */}
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#080912]">
            <textarea
              rows={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code or describe what code to build..."
              className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-cyan-100 placeholder-slate-600 focus:outline-none leading-relaxed resize-y selection:bg-cyan-500/30"
              spellCheck={false}
            />
          </div>

          {/* Optional context */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Additional Instructions / Constraints (Optional)
            </label>
            <input
              type="text"
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="e.g. Ensure thread-safety, use O(1) space, add JSDoc annotations..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleRun}
              disabled={!code.trim() || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs font-display tracking-wider transition-all cursor-pointer ${
                code.trim() && !loading
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>SYNTHESIZING CODE SOLUTION...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>RUN ORVEXIS CODE ANALYSIS</span>
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

        {/* Output */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-cyan-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
                  SYNTHESIS RESULT ({task.toUpperCase()})
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
                  onClick={() => onSendToChat(`[ORVEXIS CODE RESULT]\n\n${result}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-xs text-cyan-200 border border-cyan-500/40 transition-colors"
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
