import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Eye,
  RotateCw,
  Copy,
  Check,
  MessageSquare,
  Palette,
  Code,
  Layout,
} from 'lucide-react';

interface VisionExperienceProps {
  onSendToChat: (content: string, imageAttachment?: any) => void;
}

export const VisionExperience: React.FC<VisionExperienceProps> = ({ onSendToChat }) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    '/assets/aistudio/1794037215776_5d40d62c.jpg'
  );
  const [prompt, setPrompt] = useState(
    'Perform a comprehensive visual inspection: analyze color palette, lighting vectors, geometric refraction, inner particulate motion, and digital identity significance.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = [
    {
      title: 'ORVEXIS Neural Orb (Official Symbol)',
      url: '/assets/aistudio/1794037215776_5d40d62c.jpg',
      prompt: 'Perform a comprehensive visual inspection: analyze color palette, lighting vectors, geometric refraction, inner particulate motion, and digital identity significance.',
    },
  ];

  const analysisPresets = [
    {
      label: 'Complete Aesthetic & Geometric Breakdown',
      icon: Eye,
      text: 'Analyze composition, lighting vectors, color harmony, refraction indices, and visual symbolism in detail.',
    },
    {
      label: 'UI/UX Component Extraction',
      icon: Layout,
      text: 'Extract UI/UX patterns, component hierarchy, accessibility contrast, and interface tokens from this image.',
    },
    {
      label: 'Color Palette & Atmosphere',
      icon: Palette,
      text: 'Extract the primary, secondary, and accent hex color palette, along with lighting mood and gradient styles.',
    },
    {
      label: 'Reverse-Engineer to Tailwind/CSS',
      icon: Code,
      text: 'Provide exact modern CSS/Tailwind classes and styling instructions to recreate this visual aesthetic in code.',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let imageBase64 = selectedImage;

      // If it's a relative URL, fetch it and convert to base64
      if (selectedImage.startsWith('/')) {
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        imageBase64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
          prompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Visual perception pipeline failed');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during visual perception.');
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
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                ORVEXIS VISION
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                MULTIMODAL PERCEPTION & VISUAL DECONSTRUCTION
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Upload images, charts, diagrams, or UI mockups. ORVEXIS VISION performs
            pixel-level multimodal analysis, color palette extraction, and architectural critique.
          </p>
        </div>

        {/* Main Work Area: Image Preview + Prompt Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Image Viewer & Upload (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="p-4 rounded-2xl glass-panel flex flex-col items-center">
              <div className="relative w-full aspect-square max-h-80 rounded-xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center p-2 group shadow-2xl">
                <img
                  src={selectedImage}
                  alt="Inspection target"
                  className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Upload trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Image</span>
              </button>
            </div>

            {/* Presets */}
            <div className="p-3 rounded-xl glass-panel">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                ACTIVE IMAGE ASSET
              </span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(p.url);
                    setPrompt(p.prompt);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-left text-xs text-slate-300"
                >
                  <img src={p.url} alt="Preset" className="w-7 h-7 rounded object-cover" />
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Prompt & Directives (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-5 rounded-2xl glass-panel space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
                  Perception Objective & Directives
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like ORVEXIS VISION to analyze about this image?"
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Quick Analysis Presets */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  ANALYSIS PROTOCOLS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysisPresets.map((ap, idx) => {
                    const Icon = ap.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(ap.text)}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-400/30 text-left transition-all"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1">
                          <Icon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{ap.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{ap.text}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-xs font-display tracking-wider transition-all cursor-pointer ${
                    selectedImage && !loading
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>PERCEIVING MULTIMODAL PIXELS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>EXECUTE VISION PERCEPTION</span>
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
          </div>
        </div>

        {/* Output Report */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-cyan-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
                  ORVEXIS VISION PERCEPTION DOSSIER
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
                  onClick={() => onSendToChat(`[ORVEXIS VISION REPORT]\n\n${result}`, { data: selectedImage, mimeType: 'image/jpeg', name: 'Inspection Target' })}
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
