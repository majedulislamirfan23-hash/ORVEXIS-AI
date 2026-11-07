import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Square,
  Sparkles,
  Radio,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';
import { UserSettings, VoiceGender, ActiveView } from '../types';
import { parseVoiceCommand, VoiceCommandResult } from '../utils/voiceCommands';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSendVoiceQuery: (query: string) => Promise<string>;
  onExecuteVoiceAction: (actionResult: VoiceCommandResult) => void;
  lastResponse: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSendVoiceQuery,
  onExecuteVoiceAction,
  lastResponse,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState(lastResponse || '');
  const [isMuted, setIsMuted] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceStatusNotice, setVoiceStatusNotice] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const silenceTimerRef = useRef<any>(null);

  // Load browser TTS voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Filter voices by gender/language preference
  const getSelectedVoice = useCallback(() => {
    if (!availableVoices.length) return null;

    // Filter by language if possible
    const langCode =
      settings.language === 'Bangla'
        ? 'bn'
        : settings.language === 'Spanish'
        ? 'es'
        : settings.language === 'French'
        ? 'fr'
        : settings.language === 'German'
        ? 'de'
        : settings.language === 'Japanese'
        ? 'ja'
        : 'en';

    const langVoices = availableVoices.filter((v) => v.lang.startsWith(langCode));
    const targetPool = langVoices.length > 0 ? langVoices : availableVoices;

    if (settings.voiceGender === 'female') {
      const female = targetPool.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('google uk english female')
      );
      if (female) return female;
    } else if (settings.voiceGender === 'male') {
      const male = targetPool.find(
        (v) =>
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('google uk english male')
      );
      if (male) return male;
    }

    return targetPool[0];
  }, [availableVoices, settings.language, settings.voiceGender]);

  // Animated Audio Visualizer Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 400);
      const height = (canvas.height = 140);

      ctx.clearRect(0, 0, width, height);

      const bars = 52;
      const barWidth = width / bars;
      const centerY = height / 2;

      for (let i = 0; i < bars; i++) {
        let amplitude = 0.12;
        if (isListening) {
          amplitude = Math.sin(phase + i * 0.25) * 0.45 + 0.5 + Math.random() * 0.25;
        } else if (isSpeaking) {
          amplitude = Math.sin(phase * 1.8 + i * 0.35) * 0.5 + 0.45;
        } else if (isProcessing) {
          amplitude = Math.sin(phase * 2.2 + i * 0.2) * 0.25 + 0.25;
        }

        const barHeight = Math.max(6, amplitude * (height * 0.75));
        const x = i * barWidth;
        const y = centerY - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#06b6d4'); // Cyan
        grad.addColorStop(0.5, '#8b5cf6'); // Purple
        grad.addColorStop(1, '#a855f7'); // Violet

        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      }

      phase += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, isListening, isSpeaking, isProcessing]);

  // Speech output helper
  const speakText = useCallback(
    (text: string) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`[\]()]/g, '').trim();
      if (!cleanText) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const chosenVoice = getSelectedVoice();
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.rate = settings.voiceRate || 1.0;
      utterance.pitch = settings.voicePitch || 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Hands-Free Conversation: Automatically start listening again once speech finishes!
        if (settings.handsFreeMode && isOpen) {
          setTimeout(() => {
            startListening();
          }, 450);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, getSelectedVoice, settings.voiceRate, settings.voicePitch, settings.handsFreeMode, isOpen]
  );

  // Stop speaking
  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setVoiceStatusNotice('Speech interrupted');
    setTimeout(() => setVoiceStatusNotice(''), 2000);
  };

  // Repeat last answer
  const handleRepeatAnswer = () => {
    if (lastAIResponse) {
      speakText(lastAIResponse);
    }
  };

  // Process voice input & evaluate voice commands
  const processTranscript = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    // First check if it matches a voice command
    const commandResult = parseVoiceCommand(text);

    if (commandResult.isCommand) {
      // Execute recognized command
      setVoiceStatusNotice(commandResult.spokenFeedback || 'Executing command...');
      onExecuteVoiceAction(commandResult);

      if (commandResult.spokenFeedback) {
        speakText(commandResult.spokenFeedback);
      }

      if (commandResult.action === 'stop-speaking') {
        handleStopSpeaking();
      } else if (commandResult.action === 'repeat') {
        handleRepeatAnswer();
      }
      return;
    }

    // General query to ORVEXIS
    setIsProcessing(true);
    setLiveTranscript('');
    try {
      const response = await onSendVoiceQuery(commandResult.cleanedQuery || text);
      setLastAIResponse(response);
      setIsProcessing(false);
      speakText(response);
    } catch (err) {
      setIsProcessing(false);
      setLastAIResponse('ORVEXIS synapse link encountered an interruption.');
      speakText('Synapse link encountered an interruption.');
    }
  };

  // Start Speech Recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop ongoing speech on user interruption
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        settings.language === 'Bangla'
          ? 'bn-BD'
          : settings.language === 'Spanish'
          ? 'es-ES'
          : settings.language === 'French'
          ? 'fr-FR'
          : settings.language === 'German'
          ? 'de-DE'
          : settings.language === 'Japanese'
          ? 'ja-JP'
          : 'en-US';

      let finalCaptured = '';

      recognition.onstart = () => {
        setIsListening(true);
        setLiveTranscript('');
        setVoiceStatusNotice('Listening to user...');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalCaptured += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setLiveTranscript(finalCaptured || interim);

        // Reset silence timer on fresh speech
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
        }, 1800);
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setVoiceStatusNotice('');
      };

      recognition.onend = async () => {
        setIsListening(false);
        setVoiceStatusNotice('');
        const captured = finalCaptured || liveTranscript;
        if (captured && captured.trim()) {
          await processTranscript(captured);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#040509]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-white tracking-wider flex items-center gap-2">
              <span>ORVEXIS VOICE INTELLIGENCE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
                V2.0
              </span>
            </h2>
            <p className="text-xs font-mono text-cyan-300">
              {isListening
                ? 'LISTENING TO USER...'
                : isSpeaking
                ? 'ORVEXIS TRANSMITTING AUDIO...'
                : isProcessing
                ? 'REASONING & SYNTHESIZING...'
                : voiceStatusNotice || 'VOICE CHANNEL READY'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hands-Free Toggle */}
          <button
            onClick={() => onUpdateSettings({ handsFreeMode: !settings.handsFreeMode })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              settings.handsFreeMode
                ? 'bg-purple-600/30 border-purple-400/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="When active, ORVEXIS listens continuously without pressing record again."
          >
            Hands-Free: {settings.handsFreeMode ? 'ON' : 'OFF'}
          </button>

          {/* Voice Config Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Configure voice persona and speed"
            aria-label="Voice settings"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-white/[0.06] border-white/10 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute speech output' : 'Mute speech output'}
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Close voice mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Configuration Drawer / Settings Bar */}
      {showConfig && (
        <div className="w-full max-w-2xl p-4 my-2 rounded-2xl glass-panel border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
          <div>
            <label className="block text-slate-400 font-mono mb-1">VOICE GENDER</label>
            <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
              {(['female', 'male', 'neutral'] as VoiceGender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => onUpdateSettings({ voiceGender: g })}
                  className={`flex-1 py-1 rounded text-center capitalize transition-colors ${
                    settings.voiceGender === g
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 font-mono mb-1">
              <span>SPEED / CADENCE</span>
              <span>{settings.voiceRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={settings.voiceRate}
              onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">VOICE LANGUAGE</label>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
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
        </div>
      )}

      {/* Center Holographic Orb Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-md text-center">
        {/* Holographic Glowing Orb with concentric pulsing rings */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 mb-6 flex items-center justify-center">
          <div
            className={`absolute inset-[-18px] rounded-full border border-purple-500/30 border-dashed animate-spin-slow transition-opacity ${
              isListening || isSpeaking ? 'opacity-100' : 'opacity-40'
            }`}
          />
          <div
            className={`absolute inset-[-6px] rounded-full border-2 border-cyan-400/40 animate-spin-reverse-slow transition-opacity ${
              isListening || isSpeaking ? 'opacity-100' : 'opacity-30'
            }`}
          />

          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/50 via-cyan-500/40 to-blue-600/50 blur-2xl transition-transform duration-500 ${
              isSpeaking
                ? 'scale-125 opacity-95 animate-pulse'
                : isListening
                ? 'scale-115 opacity-85'
                : 'scale-95 opacity-50'
            }`}
          />

          {/* Orb Image */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_80px_rgba(6,182,212,0.6)] bg-black p-1">
            <img
              src="/assets/aistudio/1794037215776_5d40d62c.jpg"
              alt="ORVEXIS Core"
              className={`w-full h-full object-cover rounded-full transition-transform duration-700 ${
                isSpeaking ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        </div>

        {/* Live Audio Equalizer Waveform */}
        <div className="w-full h-24 mb-4">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Live Speech Feedback & Transcript */}
        <div className="min-h-[64px] w-full px-4 mb-4">
          {liveTranscript ? (
            <p className="text-sm font-medium text-cyan-200 font-mono bg-cyan-950/40 p-3 rounded-xl border border-cyan-500/40 shadow-lg">
              "{liveTranscript}"
            </p>
          ) : lastAIResponse ? (
            <div className="text-xs text-slate-300 line-clamp-3 bg-white/[0.04] p-3 rounded-xl border border-white/[0.06] text-left">
              <span className="font-mono text-cyan-400 block mb-1 uppercase text-[10px]">
                ORVEXIS RESPONSE:
              </span>
              {lastAIResponse}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-light">
              Tap the microphone or say commands like:
              <span className="text-cyan-300 block mt-1 font-mono text-[11px]">
                "Hey ORVEXIS, open coding" • "Search the internet" • "Change theme"
              </span>
            </p>
          )}
        </div>

        {/* Voice Interruption & Repeat Controls */}
        <div className="flex items-center gap-3 mb-2">
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-mono transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-red-300" />
              <span>Stop Speaking</span>
            </button>
          )}

          {lastAIResponse && !isSpeaking && (
            <button
              onClick={handleRepeatAnswer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Repeat Answer</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Microphone Control */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`relative p-5 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white shadow-[0_0_45px_rgba(239,68,68,0.8)] scale-110 animate-pulse'
              : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          {isListening ? 'LISTENING (TAP TO STOP)' : 'TAP TO TRANSMIT'}
        </span>
      </div>
    </div>
  );
};
