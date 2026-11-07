import { ActiveView } from '../types';

export type VoiceActionType =
  | 'navigate'
  | 'new-chat'
  | 'toggle-search'
  | 'change-theme'
  | 'repeat'
  | 'stop-speaking'
  | 'open-settings'
  | 'open-profile'
  | 'query';

export interface VoiceCommandResult {
  isCommand: boolean;
  action: VoiceActionType;
  targetView?: ActiveView;
  spokenFeedback: string;
  cleanedQuery?: string;
}

/**
 * Parses user voice transcript to determine if it is a system command or general query
 */
export function parseVoiceCommand(transcript: string): VoiceCommandResult {
  if (!transcript || !transcript.trim()) {
    return {
      isCommand: false,
      action: 'query',
      spokenFeedback: '',
      cleanedQuery: '',
    };
  }

  const raw = transcript.trim();
  // Strip wake words like "hey orvexis", "orvexis", "ok orvexis"
  const clean = raw
    .toLowerCase()
    .replace(/^(hey\s+)?orvexis[,\s]*/i, '')
    .trim();

  // 1. Open coding
  if (/^(open|launch|start|switch to|go to)\s+(coding|code|programming|coding studio)/i.test(clean) || clean === 'coding') {
    return {
      isCommand: true,
      action: 'navigate',
      targetView: 'code',
      spokenFeedback: 'Initializing ORVEXIS Coding Studio.',
    };
  }

  // 2. Open Think
  if (/^(open|launch|start|switch to|go to)\s+(think|thinking|reasoning|think mode|orvexis think)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'navigate',
      targetView: 'think',
      spokenFeedback: 'Accessing ORVEXIS structured cognitive protocol.',
    };
  }

  // 3. Open Vision / Image Studio
  if (/^(open|launch|start|switch to|go to)\s+(vision|image studio|images|vision mode|orvexis vision)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'navigate',
      targetView: 'vision',
      spokenFeedback: 'Opening ORVEXIS Multimodal Vision Studio.',
    };
  }

  // 4. Open Study
  if (/^(open|launch|start|switch to|go to)\s+(study|study mode|education|learning assistant)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'navigate',
      targetView: 'study',
      spokenFeedback: 'Opening ORVEXIS Study Mode.',
    };
  }

  // 5. Open Document
  if (/^(open|read|analyze|go to)\s+(this\s+)?(document|documents|doc assistant|document assistant)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'navigate',
      targetView: 'document',
      spokenFeedback: 'Opening Document Assistant.',
    };
  }

  // 6. Open Tools
  if (/^(open|launch|show)\s+(ai\s+)?tools/i.test(clean)) {
    return {
      isCommand: true,
      action: 'navigate',
      targetView: 'tools',
      spokenFeedback: 'Opening AI Tools suite.',
    };
  }

  // 7. Start a new conversation
  if (/^(start|create|begin|open)\s+(a\s+)?(new\s+)?(chat|conversation|session)/i.test(clean) || clean === 'new chat') {
    return {
      isCommand: true,
      action: 'new-chat',
      targetView: 'chat',
      spokenFeedback: 'Starting a brand new conversation session.',
    };
  }

  // 8. Search the internet
  if (/^(search(\s+the)?\s+(internet|web)|turn on search|enable search|search online)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'toggle-search',
      spokenFeedback: 'Web search grounding toggled.',
    };
  }

  // 9. Change the theme
  if (/^(change(\s+the)?\s+theme|switch theme|toggle theme|next theme)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'change-theme',
      spokenFeedback: 'Adjusting atmospheric theme.',
    };
  }

  // 10. Open Settings
  if (/^(open|show|access)\s+settings/i.test(clean)) {
    return {
      isCommand: true,
      action: 'open-settings',
      spokenFeedback: 'Opening Personalization and Memory settings.',
    };
  }

  // 11. Open Profile
  if (/^(open|show|view)\s+(my\s+)?(profile|personal profile|account)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'open-profile',
      spokenFeedback: 'Opening personal intelligence profile.',
    };
  }

  // 12. Stop speaking
  if (/^(stop speaking|be quiet|shut up|silence|stop talking|pause audio)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'stop-speaking',
      spokenFeedback: '',
    };
  }

  // 13. Repeat answer
  if (/^(repeat( answer)?|say again|replay answer|repeat that)/i.test(clean)) {
    return {
      isCommand: true,
      action: 'repeat',
      spokenFeedback: 'Repeating last response.',
    };
  }

  // General conversational query
  return {
    isCommand: false,
    action: 'query',
    spokenFeedback: '',
    cleanedQuery: clean || raw,
  };
}
