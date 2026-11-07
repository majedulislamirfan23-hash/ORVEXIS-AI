import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Square,
  Copy,
  Check,
  RotateCw,
  Image as ImageIcon,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Terminal,
  Cpu,
  Brain,
  FileText,
  AlertCircle,
  Globe,
  ExternalLink,
  Zap,
  Search,
  Gauge,
  Volume1,
  Radio,
} from 'lucide-react';
import { Message, ImageAttachment, DocumentAttachment, UserSettings } from '../types';
import { formatTimestamp } from '../utils/logic';
import {
  playSendSound,
  playReceiveSound,
  playMicOnSound,
  playMicOffSound,
  playClickSound,
} from '../utils/audioSystem';
import {
  speakText,
  stopSpeaking,
  isCurrentlySpeaking,
} from '../utils/speechSystem';

interface ChatInterfaceProps {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (
    content: string,
    imageAttachment?: ImageAttachment,
    documentAttachment?: DocumentAttachment
  ) => void;
  onRegenerate: () => void;
  onStopGeneration: () => void;
  onNewChat: () => void;
  settings: UserSettings;
  onUpdateSettings?: (updated: Partial<UserSettings>) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onRegenerate,
  onStopGeneration,
  onNewChat,
  settings,
  onUpdateSettings,
}) => {
  const [input, setInput] = useState('');
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | null>(null);
  const [documentAttachment, setDocumentAttachment] = useState<DocumentAttachment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  // Handle Speech-to-Text via Web Speech API with sound effects
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      playMicOffSound(settings.soundEffects);
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        settings.language === 'Bengali'
          ? 'bn-BD'
          : settings.language === 'Spanish'
          ? 'es-ES'
          : 'en-US';

      recognition.onstart = () => {
        playMicOnSound(settings.soundEffects);
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        playMicOffSound(settings.soundEffects);
        setIsRecording(false);
      };

      recognition.onend = () => {
        playMicOffSound(settings.soundEffects);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  // Text-to-speech for reading message aloud like ChatGPT Voice
  const handleSpeak = (text: string, id: string) => {
    if (currentlySpeakingId === id) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
      return;
    }

    stopSpeaking();
    setCurrentlySpeakingId(id);
    speakText(text, {
      voiceGender: settings.voiceGender,
      voiceRate: settings.voiceRate,
      voicePitch: settings.voicePitch,
      onStart: () => setCurrentlySpeakingId(id),
      onEnd: () => setCurrentlySpeakingId(null),
      onError: () => setCurrentlySpeakingId(null),
    });
  };

  // Handle Submit
  const handleSend = () => {
    if ((!input.trim() && !imageAttachment && !documentAttachment) || isStreaming) {
      return;
    }

    // Stop active speech playback if any
    stopSpeaking();
    setCurrentlySpeakingId(null);

    onSendMessage(input, imageAttachment || undefined, documentAttachment || undefined);
    setInput('');
    setImageAttachment(null);
    setDocumentAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle image upload
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Image size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageAttachment({
        data: reader.result as string,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle document upload
  const handleDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocumentAttachment({
        name: file.name,
        content: reader.result as string,
        size: file.size,
        type: file.type || 'text/plain',
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestionPrompts = [
    {
      title: 'কোয়ান্টাম মেকানিক্স ও বিজ্ঞান',
      desc: 'কোয়ান্টাম সুপারপজিশন এবং এন্ট্যাঙ্গলমেন্টের রহস্যময় নিয়মগুলো সহজ বাস্তব উপমায় ব্যাখ্যা করো।',
      icon: Cpu,
    },
    {
      title: 'ফুল-স্ট্যাক সিস্টেম আর্কিটেকচার',
      desc: 'Design an ultra-scale modern microservices architecture with Redis, event streams, and PostgreSQL.',
      icon: Terminal,
    },
    {
      title: 'বাংলা ব্যাকরণ ও সাহিত্য',
      desc: 'বাংলা ব্যাকরণের সন্ধি ও সমাসের মধ্যে পার্থক্য এবং কাজী নজরুল ইসলামের বিদ্রোহী কবিতার মূল দর্শন আলোচনা করো।',
      icon: Sparkles,
    },
    {
      title: 'গভীর চিন্তন ও সিদ্ধান্ত গ্রহণ',
      desc: 'জটিল অনিশ্চয়তার মধ্যে যৌক্তিক সমস্যা সমাধান ও বিশ্লেষণাত্মক চিন্তন পদ্ধতি ব্যাখ্যা করো।',
      icon: Brain,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05060a] relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-purple-900/10 blur-[130px] pointer-events-none" />

      {/* Modern ChatGPT-Style Top Floating Interior Bar */}
      <div className="px-4 py-2.5 bg-[#070810]/95 border-b border-white/[0.07] backdrop-blur-md flex items-center justify-between gap-3 text-xs z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold text-white">ORVEXIS AI 2.0</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300">Omni-Cognition</span>
          </div>

          {/* Active Speaking Indicator */}
          {currentlySpeakingId && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/50 text-[11px] text-purple-200 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" />
                <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              <span className="font-mono text-[10px] hidden sm:inline">ভয়েস চলছে (SPEAKING)</span>
              <button
                onClick={() => {
                  stopSpeaking();
                  setCurrentlySpeakingId(null);
                }}
                className="ml-1 px-1.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-[9px] font-semibold text-red-300 cursor-pointer"
                title="Stop voice playback"
              >
                থামো
              </button>
            </div>
          )}
        </div>

        {/* Audio & Sound Controls */}
        <div className="flex items-center gap-2">
          {/* ChatGPT-style Auto-Readout Voice Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound(settings.soundEffects);
              onUpdateSettings?.({
                autoReadResponses: !settings.autoReadResponses,
              });
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
              settings.autoReadResponses
                ? 'bg-purple-600/30 text-purple-200 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.35)] font-semibold'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.08]'
            }`}
            title="Auto-Read Voice (Every response is spoken aloud like ChatGPT Voice)"
          >
            {settings.autoReadResponses ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>ভয়েস চালু (VOICE ON)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>ভয়েস বন্ধ (VOICE OFF)</span>
              </>
            )}
          </button>

          {/* Sound Effects SFX Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !settings.soundEffects;
              onUpdateSettings?.({ soundEffects: next });
              if (next) playReceiveSound(true);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              settings.soundEffects
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-500'
            }`}
            title={settings.soundEffects ? 'UI Sound Effects Active' : 'UI Sound Effects Muted'}
            aria-label="Toggle Sound Effects"
          >
            {settings.soundEffects ? <Volume1 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        {messages.length === 0 ? (
          // Empty State / Welcome Screen
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-8">
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-transparent blur-lg animate-pulse-glow" />
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-black p-0.5">
                <img
                  src="/assets/aistudio/1794037215776_5d40d62c.jpg"
                  alt="ORVEXIS AI"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide mb-2 font-display text-white">
              WELCOME TO{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                ORVEXIS AI
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-lg font-light leading-relaxed">
              চ্যাট জিপিটির মতো অত্যাধুনিক ইন্টেলিজেন্স ও স্পষ্ট বাংলা-ইংরেজি ভয়েস স্পিচ। যেকোনো জটিল বিষয় জানতে প্রশ্ন করো, ভয়েস শোনো বা কোড বিশ্লেষণ করো।
            </p>

            {/* Quick Inspiration Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {suggestionPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.desc)}
                    className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 transition-all text-left group cursor-pointer"
                    aria-label={`Prompt: ${item.title}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-4 h-4 text-cyan-400 group-hover:text-purple-300 transition-colors" />
                      <span className="text-xs font-semibold text-slate-200 font-display">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            const isSpeaking = currentlySpeakingId === message.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="relative shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] bg-black">
                      <img
                        src="/assets/aistudio/1794037215776_5d40d62c.jpg"
                        alt="ORVEXIS AI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Top Meta: Name & Timestamp & Speed Metrics */}
                  <div className="flex flex-wrap items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-mono tracking-wider text-slate-400 font-semibold">
                      {isUser ? 'YOU' : 'ORVEXIS AI'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {!isUser && message.speedMetrics && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        <Zap className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{message.speedMetrics.tokensPerSec} tok/s</span>
                        <span className="text-slate-500">•</span>
                        <span>{message.speedMetrics.elapsedMs}ms</span>
                      </span>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 relative ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-500/30 text-white shadow-lg shadow-purple-950/20'
                        : message.error
                        ? 'bg-red-950/30 border border-red-500/40 text-red-200'
                        : 'glass-panel text-slate-100 shadow-xl'
                    }`}
                  >
                    {/* Attached Image if present */}
                    {message.imageAttachment && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-white/10 max-w-sm">
                        <img
                          src={message.imageAttachment.data}
                          alt="Attachment"
                          className="w-full max-h-64 object-cover"
                        />
                        <div className="bg-black/50 px-2 py-1 text-[10px] font-mono text-slate-400 truncate">
                          {message.imageAttachment.name}
                        </div>
                      </div>
                    )}

                    {/* Attached Document info if present */}
                    {message.documentAttachment && (
                      <div className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div className="truncate">
                          <div className="font-medium text-slate-200 truncate">
                            {message.documentAttachment.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Document attached • {Math.round(message.documentAttachment.size / 1024)} KB
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verified Google Search Grounding Queries */}
                    {message.searchQueries && message.searchQueries.length > 0 && (
                      <div className="mb-3 flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
                        <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-mono uppercase text-emerald-300 font-semibold tracking-wider">
                          Google Search Grounding:
                        </span>
                        {message.searchQueries.map((query, qIdx) => (
                          <span
                            key={qIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.06] border border-emerald-400/30 text-[10px] font-mono text-emerald-200"
                          >
                            {query}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Markdown Body */}
                    <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            const codeString = String(children).replace(/\n$/, '');

                            if (!inline && language) {
                              return (
                                <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#090b12] shadow-md">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06] text-xs font-mono text-slate-400">
                                    <span className="text-cyan-300 font-semibold uppercase text-[10px]">
                                      {language}
                                    </span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(codeString);
                                        setCopiedId(`code-${message.id}`);
                                        setTimeout(() => setCopiedId(null), 1500);
                                      }}
                                      className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                                      aria-label="Copy code"
                                    >
                                      {copiedId === `code-${message.id}` ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-emerald-400">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-3 text-xs overflow-x-auto text-slate-200 font-mono bg-transparent">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code
                                className="px-1.5 py-0.5 rounded bg-white/[0.08] text-cyan-200 font-mono text-xs"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Quota Limit Notice Card */}
                    {message.error && message.isQuota && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 font-semibold font-mono">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>SYNAPTIC RATE-LIMIT NOTICE (HTTP 429)</span>
                        </div>
                        <p className="text-[11px] text-amber-200/90 leading-relaxed">
                          Your current free-tier Gemini API request limit has been reached. Requests reset every 60 seconds.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={onRegenerate}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-mono text-amber-200 transition-colors cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3 text-amber-300" />
                            <span>Retry Transmission</span>
                          </button>
                          <a
                            href="https://ai.dev/rate-limit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            <span>Monitor Quota (ai.dev)</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Verified Web Grounding Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.08] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-cyan-300 font-semibold tracking-wider">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          <span>Verified Web Grounding Sources:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 border border-cyan-500/20 text-[10px] text-cyan-200 hover:text-white transition-colors"
                              title={s.uri}
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                              <span className="truncate max-w-[190px]">{s.title || s.uri}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pulsing cursor while streaming */}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse rounded-sm align-middle" />
                    )}
                  </div>

                  {/* Bottom Actions for AI Message */}
                  {!isUser && !message.isStreaming && (
                    <div className="flex items-center gap-1.5 mt-2 px-1 text-slate-400">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="p-1 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                        title="Copy message"
                        aria-label="Copy AI response"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Text-to-Speech Readout */}
                      <button
                        onClick={() => handleSpeak(message.content, message.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSpeaking
                            ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                            : 'hover:bg-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                        title={isSpeaking ? 'Stop voice readout' : 'Read aloud with voice'}
                        aria-label="Read response aloud"
                      >
                        {isSpeaking ? (
                          <>
                            <span className="flex items-center gap-0.5">
                              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" />
                              <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce [animation-delay:150ms]" />
                              <span className="w-1 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:300ms]" />
                            </span>
                            <span className="text-[10px] font-mono text-cyan-200">ভয়েস চলছে...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono hidden sm:inline">শুনুন</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate (only for last message) */}
                      {message.id === messages[messages.length - 1]?.id && (
                        <button
                          onClick={onRegenerate}
                          className="p-1 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                          title="Regenerate response"
                          aria-label="Regenerate response"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading state indicator when waiting for initial stream tokens */}
        {isStreaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-3 max-w-4xl mx-auto py-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)] bg-black animate-pulse-glow">
              <img
                src="/assets/aistudio/1794037215776_5d40d62c.jpg"
                alt="Thinking"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-xs text-cyan-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ORVEXIS AI is synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray & Controls */}
      <div className="p-3 sm:p-4 bg-[#080911]/95 border-t border-white/[0.08] backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Quick Engine & Intelligence Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 py-0.5">
              {/* Turbo Speed Switcher */}
              <button
                type="button"
                onClick={() => {
                  const isCurrentlyTurbo = settings.speedEngine === 'hyper-fast' || settings.thinkingLevel === 'fast';
                  onUpdateSettings?.({
                    speedEngine: isCurrentlyTurbo ? 'quantum-balanced' : 'hyper-fast',
                    thinkingLevel: isCurrentlyTurbo ? 'balanced' : 'fast',
                  });
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  settings.speedEngine === 'hyper-fast' || settings.thinkingLevel === 'fast'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
                title="Turbo High Speed (Fastest-growing tokens, ultra-low latency streaming)"
                aria-label="Toggle Turbo Speed"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>TURBO SPEED</span>
                {(settings.speedEngine === 'hyper-fast' || settings.thinkingLevel === 'fast') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>

              {/* Extraordinary Thinking Level Switcher */}
              <button
                type="button"
                onClick={() => {
                  const isCurrentlyExtraordinary =
                    settings.thinkingLevel === 'extraordinary' || settings.speedEngine === 'deep-cognitive';
                  onUpdateSettings?.({
                    thinkingLevel: isCurrentlyExtraordinary ? 'fast' : 'extraordinary',
                    speedEngine: isCurrentlyExtraordinary ? 'hyper-fast' : 'deep-cognitive',
                  });
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  settings.thinkingLevel === 'extraordinary' || settings.speedEngine === 'deep-cognitive'
                    ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-semibold'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
                title="Extraordinary Deep Mind (High-level cognitive decomposition & multi-step rigor)"
                aria-label="Toggle Extraordinary Thinking Level"
              >
                <Brain className="w-3 h-3 text-purple-400" />
                <span>EXTRAORDINARY MIND</span>
                {(settings.thinkingLevel === 'extraordinary' || settings.speedEngine === 'deep-cognitive') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>

              {/* Web Search Grounding Engine Toggle */}
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings?.({
                    webSearchEnabled: !settings.webSearchEnabled,
                  });
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  settings.webSearchEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-semibold'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
                title="Google Grounded Web Search Engine (Live internet citations & verified sources)"
                aria-label="Toggle Web Search Grounding"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>LIVE WEB SEARCH</span>
                {settings.webSearchEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Live Streaming Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/40 animate-pulse">
                <Gauge className="w-3 h-3 text-cyan-400" />
                <span>FAST STREAM ACTIVE</span>
              </div>
            )}
          </div>
          {/* Active Attachments Preview Bar */}
          {(imageAttachment || documentAttachment) && (
            <div className="flex items-center gap-2 px-2 py-1">
              {imageAttachment && (
                <div className="relative group inline-flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-white/[0.06] border border-cyan-400/30 text-xs">
                  <img
                    src={imageAttachment.data}
                    alt="Preview"
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="truncate max-w-[150px] text-slate-200">
                    {imageAttachment.name}
                  </span>
                  <button
                    onClick={() => setImageAttachment(null)}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {documentAttachment && (
                <div className="relative group inline-flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-white/[0.06] border border-purple-400/30 text-xs">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="truncate max-w-[150px] text-slate-200">
                    {documentAttachment.name}
                  </span>
                  <button
                    onClick={() => setDocumentAttachment(null)}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                    aria-label="Remove document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Input Bar */}
          <div className="relative flex items-end gap-2 p-2 rounded-2xl glass-panel focus-within:border-purple-500/50 transition-colors">
            {/* Attachment Buttons */}
            <div className="flex items-center gap-1 pb-1">
              {/* Image Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
                id="image-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors"
                title="Attach image for visual analysis"
                aria-label="Upload image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Document Input */}
              <input
                ref={docInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.py,.ts,.js,.html,.css"
                onChange={handleDocumentFile}
                className="hidden"
                id="doc-upload"
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-purple-300 hover:bg-white/[0.06] transition-colors"
                title="Attach text or code document"
                aria-label="Upload document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Speech-to-text mic */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title={isRecording ? 'Listening... click to stop' : 'Voice input'}
                aria-label="Voice input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording
                  ? 'Listening to speech...'
                  : 'Message ORVEXIS AI...'
              }
              className="flex-1 bg-transparent border-0 resize-none py-2 px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 leading-relaxed font-normal min-h-[36px]"
              aria-label="Message input"
            />

            {/* Send / Stop Generation Button */}
            <div className="pb-1">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
                  title="Stop generating"
                  aria-label="Stop generation"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() && !imageAttachment && !documentAttachment}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    input.trim() || imageAttachment || documentAttachment
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95'
                      : 'bg-white/[0.06] text-slate-600 cursor-not-allowed'
                  }`}
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Footer Subtext */}
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-mono">
            <span>ORVEXIS AI 2.4-Nexus</span>
            <span className="hidden sm:inline">Gemini 3.8 Flash • Real-Time Streaming</span>
            <span className="sm:hidden">Gemini 3.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
