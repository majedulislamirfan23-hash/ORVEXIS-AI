/**
 * ORVEXIS Speech Intelligence System
 * Provides ChatGPT-style expressive voice synthesis, bilingual Bengali/English routing,
 * voice interruption, and natural pronunciation cleaning.
 */

export interface SpeechOptions {
  voiceGender?: 'female' | 'male' | 'neutral';
  voiceRate?: number;
  voicePitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Clean markdown symbols, code blocks, and URLs so the spoken output is completely natural.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' Code snippet provided in message. ')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove markdown links [title](url) -> title
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headers #, ##, etc.
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bullet asterisks, dashes
      .replace(/^[\s*-+]\s+/gm, '')
      // Remove bold/italics
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove blockquotes >
      .replace(/^>\s+/gm, '')
      // Collapse multiple newlines/spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Detect if text contains Bengali characters
 */
export function containsBengali(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * Get the best matching browser SpeechSynthesisVoice for the text and preferred gender
 */
export function getBestVoice(text: string, gender: 'female' | 'male' | 'neutral' = 'female'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const isBengali = containsBengali(text);

  if (isBengali) {
    // Look for Bengali voices
    const bnVoice = voices.find(
      (v) => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')
    );
    if (bnVoice) return bnVoice;
  }

  // Look for preferred English voice by gender
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  if (gender === 'female') {
    const femaleVoice = englishVoices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes('female') ||
        name.includes('samantha') ||
        name.includes('zira') ||
        name.includes('victoria') ||
        name.includes('karen') ||
        name.includes('moira') ||
        name.includes('natural')
      );
    });
    if (femaleVoice) return femaleVoice;
  } else if (gender === 'male') {
    const maleVoice = englishVoices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes('male') ||
        name.includes('david') ||
        name.includes('alex') ||
        name.includes('daniel') ||
        name.includes('oliver') ||
        name.includes('george')
      );
    });
    if (maleVoice) return maleVoice;
  }

  // Fallback to highest quality English voice or default
  return englishVoices[0] || voices[0] || null;
}

/**
 * Speak text aloud with ChatGPT-style natural flow and interruption support
 */
export function speakText(text: string, options: SpeechOptions = {}): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) return false;

  try {
    const utterance = new SpeechSynthesisUtterance(clean);
    currentUtterance = utterance;

    const voice = getBestVoice(clean, options.voiceGender || 'female');
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = options.voiceRate || 1.0;
    utterance.pitch = options.voicePitch || 1.0;

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      options.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}

/**
 * Stop any active speech immediately (ChatGPT style interruption)
 */
export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  } catch {}
}

/**
 * Check if the browser is currently speaking
 */
export function isCurrentlySpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}
