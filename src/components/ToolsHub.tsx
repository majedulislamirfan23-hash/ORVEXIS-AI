import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Terminal,
  FileCode,
  Sliders,
  Copy,
  Check,
  RotateCw,
  MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ToolsHubProps {
  onSendToChat: (content: string) => void;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({ onSendToChat }) => {
  const [activeTool, setActiveTool] = useState<'prompt-opt' | 'regex' | 'json' | 'perf'>('prompt-opt');
  const [toolInput, setToolInput] = useState(
    'Make a responsive dashboard in React that displays live crypto prices and candlestick charts.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'prompt-opt',
      title: 'Prompt Synthesizer',
      desc: 'Transforms rough ideas into high-clarity structured system prompts',
      icon: Sparkles,
      placeholder: 'Enter a casual prompt to elevate into production-grade instructions...',
    },
    {
      id: 'regex',
      title: 'Regex Architect',
      desc: 'Constructs resilient regular expressions with breakdowns & edge test cases',
      icon: Terminal,
      placeholder: 'Describe what pattern you need to match or extract (e.g. ISO 8601 timestamps, semver)...',
    },
    {
      id: 'json',
      title: 'JSON Schema Generator',
      desc: 'Generates strict TypeScript types & JSON schemas from raw descriptions or data',
      icon: FileCode,
      placeholder: 'Describe entities or paste a sample payload to generate TypeScript interfaces & schema...',
    },
    {
      id: 'perf',
      title: 'Latency & Scale Estimator',
      desc: 'Calculates concurrency, bandwidth, Redis memory footprint, and database indexing',
      icon: Sliders,
      placeholder: 'Describe your expected RPS, payload size, write-to-read ratio, and growth horizon...',
    },
  ];

  const handleRunTool = async () => {
    if (!toolInput.trim() || loading) return;

    setLoading(true);
    setResult(null);

    const promptsByTool: Record<string, string> = {
      'prompt-opt': `You are ORVEXIS PROMPT SYNTHESIZER. Elevate this raw user prompt into an elite, structured master prompt with Role, Objective, Context, Constraints, and Output Format:\n"${toolInput}"`,
      regex: `You are ORVEXIS REGEX ARCHITECT. Provide a robust, production-tested regular expression for this requirement: "${toolInput}". Include breakdown, visual explanation, sample matches, and edge case failures.`,
      json: `You are ORVEXIS SCHEMA GENERATOR. Provide the pristine TypeScript interface, Zod validator schema, and JSON Schema for: "${toolInput}".`,
      perf: `You are ORVEXIS ARCHITECTURAL ESTIMATOR. Provide back-of-the-envelope calculations for throughput, network egress, storage capacity over 1 year, and caching strategy for: "${toolInput}".`,
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptsByTool[activeTool] }],
          systemInstruction: 'You are ORVEXIS AI TOOLS, providing mathematically sound, production-ready engineering answers.',
        }),
      });

      if (!res.ok) throw new Error('Tool execution failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const payload = line.replace('data: ', '').trim();
                if (payload === '[DONE]') break;
                try {
                  const parsed = JSON.parse(payload);
                  if (parsed.text) fullText += parsed.text;
                  setResult(fullText);
                } catch {
                  // ignore
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setResult('Tool operation encountered an error.');
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
              <Wrench className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                ORVEXIS AI TOOLS
              </h2>
              <p className="text-xs font-mono text-purple-300">
                SPECIALIZED RAPID DEVELOPMENT & COMPUTATIONAL SUITE
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Targeted precision utilities for prompt synthesis, regex construction, data modeling,
            and capacity planning.
          </p>
        </div>

        {/* Tool Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const isSel = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id as any);
                  setResult(null);
                }}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSel ? 'text-purple-300' : 'text-slate-400'}`} />
                <div className="text-xs font-semibold">{t.title}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Tool Work Area */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
              Input Specification
            </label>
            <textarea
              rows={4}
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              placeholder={tools.find((t) => t.id === activeTool)?.placeholder}
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunTool}
              disabled={!toolInput.trim() || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs font-display tracking-wider transition-all cursor-pointer ${
                toolInput.trim() && !loading
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-purple-300" />
                  <span>CALCULATING PRECISION OUTPUT...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>EXECUTE TOOL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-purple-300 uppercase">
                  TOOL SYNTHESIS OUTPUT
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
                  onClick={() => onSendToChat(`[ORVEXIS TOOL RESULT]\n\n${result}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-xs text-purple-200 border border-purple-500/40 transition-colors"
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
