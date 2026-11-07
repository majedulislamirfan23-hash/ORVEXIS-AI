import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  MessageSquare,
  Calculator,
  Languages,
  Atom,
  Binary,
  Layers,
} from 'lucide-react';

interface StudyExperienceProps {
  onSendToChat: (content: string) => void;
}

export const StudyExperience: React.FC<StudyExperienceProps> = ({ onSendToChat }) => {
  const [subjectArea, setSubjectArea] = useState<string>('math');
  const [topic, setTopic] = useState('Calculus: Fundamental Theorem of Calculus & Step-by-Step Derivation');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'master' | 'all'>('all');
  const [teachingLanguage, setTeachingLanguage] = useState<'English' | 'Bangla'>('English');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectTabs = [
    {
      id: 'math',
      label: 'Mathematics',
      icon: Calculator,
      defaultTopic: 'Calculus: Fundamental Theorem of Calculus & Step-by-Step Derivation',
      desc: 'Step-by-step proofs, algebra, calculus & discrete math',
    },
    {
      id: 'bangla',
      label: 'Bangla Education (বাংলা)',
      icon: Languages,
      defaultTopic: 'বাংলা ব্যাকরণ: সন্ধি, সমাস ও কারক-বিভক্তি সহজ বিশ্লেষণ',
      desc: 'বাংলা ভাষা, ব্যাকরণ ও সাহিত্য বিশ্লেষণ (Bangla Grammar & Literature)',
    },
    {
      id: 'english',
      label: 'English Learning',
      icon: BookOpen,
      defaultTopic: 'Advanced English Idioms, Phrasal Verbs & Sentence Structures for Fluency',
      desc: 'Grammar, vocabulary acquisition, writing style & speech',
    },
    {
      id: 'science',
      label: 'Physics & Science',
      icon: Atom,
      defaultTopic: 'Electromagnetism: Maxwell Equations & Intuitive Physical Meaning',
      desc: 'Physics, chemistry, biology & cosmic astrophysics',
    },
    {
      id: 'computing',
      label: 'Computer Science',
      icon: Binary,
      defaultTopic: 'Dynamic Programming: Knapsack & Longest Common Subsequence Mechanics',
      desc: 'Algorithms, data structures & computational theory',
    },
  ];

  const handleTabSwitch = (tab: (typeof subjectTabs)[0]) => {
    setSubjectArea(tab.id);
    setTopic(tab.defaultTopic);
    if (tab.id === 'bangla') {
      setTeachingLanguage('Bangla');
    }
  };

  const handleStudy = async () => {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subjectArea,
          level,
          language: teachingLanguage,
          includeQuiz,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pedagogical synthesis failed');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred during study session generation.');
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
              <GraduationCap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                ORVEXIS STUDY MODE
              </h2>
              <p className="text-xs font-mono text-purple-300">
                PEDAGOGICAL ACCELERATION, MATH, ENGLISH & BANGLA EDUCATION
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Master complex school and academic subjects through intuitive mental models,
            3-tier depth breakdowns, step-by-step derivations, mnemonic anchors, and quizzes.
          </p>
        </div>

        {/* Subject Area Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {subjectTabs.map((tab) => {
            const Icon = tab.icon;
            const isSel = subjectArea === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? 'bg-purple-950/50 border-purple-400/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSel ? 'text-purple-300' : 'text-slate-400'}`} />
                <div className="text-xs font-semibold">{tab.label}</div>
              </button>
            );
          })}
        </div>

        {/* Input Configuration Box */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
              Topic / Concept / Problem to Learn
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Eigenvalues, বাংলা সমাস, English Conditional Clauses..."
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Depth Level */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                COGNITIVE DEPTH
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All 3 Tiers (Foundations to Master)</option>
                <option value="beginner">Foundations (ELI5 Intuitive)</option>
                <option value="intermediate">Working Knowledge & Rules</option>
                <option value="master">Frontier Mastery & Nuances</option>
              </select>
            </div>

            {/* Teaching Language */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                EXPLANATION LANGUAGE
              </label>
              <select
                value={teachingLanguage}
                onChange={(e) => setTeachingLanguage(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="English">English</option>
                <option value="Bangla">বাংলা (Bangla)</option>
              </select>
            </div>

            {/* Quiz Toggle */}
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQuiz}
                  onChange={(e) => setIncludeQuiz(e.target.checked)}
                  className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-0"
                />
                <span>Generate Interactive Quiz</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStudy}
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
                  <span>SYNTHESIZING CURRICULUM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>INITIALIZE STUDY MASTERCLASS</span>
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

        {/* Masterclass Dossier */}
        {result && (
          <div className="p-6 rounded-2xl glass-panel space-y-4 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-purple-300 uppercase">
                  MASTERCLASS CURRICULUM READY
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
                  onClick={() => onSendToChat(`[ORVEXIS STUDY DOSSIER: ${topic}]\n\n${result}`)}
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
