import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Upload,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  MessageSquare,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface DocumentExperienceProps {
  onSendToChat: (content: string, docAttachment?: any) => void;
}

export const DocumentExperience: React.FC<DocumentExperienceProps> = ({ onSendToChat }) => {
  const [docName, setDocName] = useState('System_Architecture_Spec.md');
  const [docContent, setDocContent] = useState(`# ORVEXIS Core Architecture Specification
Version: 2.4.0-Nexus
Author: Orvexis Autonomous Intelligence Systems

## 1. Executive Summary
ORVEXIS AI utilizes a distributed neural gateway combining low-latency client state synchronization with server-authoritative cognitive pipelines. All contextual reasoning is processed via dedicated high-dimension embedding projections.

## 2. Key Invariants
- Zero unverified assertions: The model must flag uncertain inductive steps.
- Complete data privacy: User memory records require explicit user toggle and allow instant deletion.
- Multimodal convergence: Visual, textual, and audio inputs map into unified semantic tokens.`);

  const [question, setQuestion] = useState('Summarize the key architectural invariants and data privacy guarantees.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocContent(reader.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!docContent.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prompt = `You are ORVEXIS DOCUMENT ASSISTANT.
Analyze the following document: "${docName}".
User Directive / Question: "${question}"

Document Content:
"""
${docContent}
"""

Provide:
1. Executive Summary: Core message and purpose.
2. Direct Answer to the User Directive: Deep factual extraction.
3. Key Entities, Data Points & Notable Clauses.
4. Strategic Gaps, Ambiguities or Recommendations.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemInstruction: 'You are ORVEXIS DOCUMENT ASSISTANT, providing precision document synthesis.',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze document');
      }

      // Read SSE stream
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
                  // ignore heartbeat
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during document analysis.');
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
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                DOCUMENT ASSISTANT
              </h2>
              <p className="text-xs font-mono text-blue-300">
                CONTEXTUAL SYNTHESIS & FACT EXTRACTION
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Upload text specifications, reports, papers, or markdown logs. Query specific sections,
            extract vital figures, or synthesize executive summaries.
          </p>
        </div>

        {/* Document Editor / Loader */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Document:</span>
              <span className="text-xs font-semibold text-cyan-300 font-mono truncate max-w-xs">
                {docName}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.py,.ts,.html"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load File</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            placeholder="Paste document text or content here..."
            className="w-full rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-400"
          />

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Analysis Directive / Inquiry
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Summarize main findings, identify risk points, extract key metrics..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              disabled={!docContent.trim() || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs font-display tracking-wider transition-all cursor-pointer ${
                docContent.trim() && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-blue-300" />
                  <span>SYNTHESIZING DOCUMENT INTELLIGENCE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>ANALYZE DOCUMENT</span>
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

        {/* Result */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-blue-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-blue-300 uppercase">
                  DOCUMENT SYNTHESIS DOSSIER
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
                  onClick={() =>
                    onSendToChat(`[ORVEXIS DOCUMENT ANALYSIS: ${docName}]\n\n${result}`, {
                      name: docName,
                      content: docContent,
                      size: docContent.length,
                      type: 'text/plain',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-xs text-blue-200 border border-blue-500/40 transition-colors"
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
