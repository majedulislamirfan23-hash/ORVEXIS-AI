import { Conversation, MemoryItem, UserSettings, ResponseStyle } from '../types';

/**
 * Filter conversations by search term across title and message contents
 */
export function filterConversations(
  conversations: Conversation[],
  searchQuery: string
): Conversation[] {
  if (!searchQuery || !searchQuery.trim()) {
    return conversations;
  }
  const query = searchQuery.toLowerCase().trim();
  return conversations.filter((conv) => {
    if (conv.title.toLowerCase().includes(query)) {
      return true;
    }
    return conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(query)
    );
  });
}

/**
 * Format active user memories into a compact context block for the AI model
 */
export function formatMemoryContext(
  memories: MemoryItem[],
  settings: Partial<UserSettings>
): string {
  if (!settings.memoryEnabled) {
    return '';
  }

  const active = memories.filter((m) => m.enabled);
  if (active.length === 0 && !settings.userName) {
    return '';
  }

  const lines: string[] = ['[ACTIVE USER MEMORY & PREFERENCES]'];
  if (settings.userName) {
    lines.push(`- User Preferred Name: ${settings.userName}`);
  }

  for (const item of active) {
    lines.push(`- [${item.category.toUpperCase()}] ${item.key}: ${item.value}`);
  }

  return lines.join('\n');
}

/**
 * Build dynamic system prompt based on user settings, response style, and active memories
 */
export function buildSystemPrompt(
  settings: UserSettings,
  memories: MemoryItem[],
  activeMode?: string
): string {
  const parts: string[] = [];

  // Style directive
  const styleDirectives: Record<ResponseStyle, string> = {
    balanced: 'Maintain a balanced, conversational, yet deeply insightful tone.',
    concise: 'Be extremely concise, direct, and avoid unnecessary filler or throat-clearing.',
    deep: 'Provide deep, multi-angle analytical depth with underlying rationale and principles.',
    creative: 'Express yourself with vivid, visionary, and creative conceptual phrasing.',
    technical: 'Prioritize precision, engineering rigor, algorithmic considerations, and code elegance.',
  };

  parts.push(`Response Style Directive: ${styleDirectives[settings.responseStyle] || styleDirectives.balanced}`);

  if (settings.language && settings.language !== 'en' && settings.language !== 'English') {
    parts.push(`Communicate in the user's preferred language: ${settings.language}.`);
  }

  if (activeMode) {
    parts.push(`Current Operational Focus: ORVEXIS ${activeMode.toUpperCase()}`);
  }

  const memoryContext = formatMemoryContext(memories, settings);
  if (memoryContext) {
    parts.push(memoryContext);
  }

  return parts.join('\n\n');
}

export interface ExtractedCodeBlock {
  language: string;
  code: string;
}

/**
 * Extract code blocks from a markdown string
 */
export function extractCodeBlocks(markdown: string): ExtractedCodeBlock[] {
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const blocks: ExtractedCodeBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1]?.trim() || 'plaintext',
      code: match[2]?.trimEnd() || '',
    });
  }

  return blocks;
}

/**
 * Estimate word count of a string
 */
export function estimateWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Format timestamp into friendly hour:minute format
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
