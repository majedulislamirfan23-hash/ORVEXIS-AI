import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterConversations,
  formatMemoryContext,
  buildSystemPrompt,
  extractCodeBlocks,
  estimateWordCount,
  formatTimestamp,
} from './logic';
import { Conversation, MemoryItem, UserSettings } from '../types';

test('filterConversations matches by title or message text', () => {
  const dummyConvs: Conversation[] = [
    {
      id: '1',
      title: 'Quantum Computing Theory',
      createdAt: 1000,
      updatedAt: 1000,
      messages: [
        { id: 'm1', role: 'user', content: 'Explain superposition', timestamp: 1000 },
        { id: 'm2', role: 'assistant', content: 'Qubits exist in linear combination', timestamp: 1001 },
      ],
    },
    {
      id: '2',
      title: 'Web Design System',
      createdAt: 2000,
      updatedAt: 2000,
      messages: [
        { id: 'm3', role: 'user', content: 'Design buttons in purple', timestamp: 2000 },
      ],
    },
  ];

  // Search by title
  const quantum = filterConversations(dummyConvs, 'quantum');
  assert.equal(quantum.length, 1);
  assert.equal(quantum[0].id, '1');

  // Search by message content
  const buttons = filterConversations(dummyConvs, 'buttons');
  assert.equal(buttons.length, 1);
  assert.equal(buttons[0].id, '2');

  // Empty query returns all
  assert.equal(filterConversations(dummyConvs, '').length, 2);

  // Non-matching query returns 0
  assert.equal(filterConversations(dummyConvs, 'unrelated keyword xyz').length, 0);
});

test('formatMemoryContext omits when memory is disabled', () => {
  const memories: MemoryItem[] = [
    {
      id: 'mem1',
      key: 'Framework',
      value: 'Prefers React & TypeScript',
      category: 'preference',
      createdAt: Date.now(),
      enabled: true,
    },
  ];
  const settings: Partial<UserSettings> = {
    memoryEnabled: false,
    userName: 'Alex',
  };

  const output = formatMemoryContext(memories, settings);
  assert.equal(output, '');
});

test('formatMemoryContext includes active enabled memories and user name', () => {
  const memories: MemoryItem[] = [
    {
      id: 'mem1',
      key: 'Role',
      value: 'Lead Architect',
      category: 'work',
      createdAt: Date.now(),
      enabled: true,
    },
    {
      id: 'mem2',
      key: 'Old Fact',
      value: 'Inactive fact',
      category: 'fact',
      createdAt: Date.now(),
      enabled: false,
    },
  ];
  const settings: Partial<UserSettings> = {
    memoryEnabled: true,
    userName: 'Kaelen',
  };

  const output = formatMemoryContext(memories, settings);
  assert.match(output, /User Preferred Name: Kaelen/);
  assert.match(output, /\[WORK\] Role: Lead Architect/);
  assert.doesNotMatch(output, /Inactive fact/);
});

test('buildSystemPrompt adjusts for responseStyle and mode', () => {
  const settings: UserSettings = {
    theme: 'obsidian',
    accentColor: 'purple',
    fontSize: 'md',
    language: 'English',
    responseStyle: 'concise',
    voiceVoice: 'Orvexis Nova',
    voiceGender: 'female',
    voicePitch: 1,
    voiceRate: 1,
    autoReadResponses: false,
    handsFreeMode: false,
    memoryEnabled: true,
    webSearchEnabled: false,
    soundEffects: true,
    userName: 'Developer',
  };

  const prompt = buildSystemPrompt(settings, [], 'think');
  assert.match(prompt, /extremely concise/);
  assert.match(prompt, /Current Operational Focus: ORVEXIS THINK/);
});

test('extractCodeBlocks correctly extracts multiple languages and content', () => {
  const md = `
Here is typescript:
\`\`\`typescript
const x: number = 42;
console.log(x);
\`\`\`

And python:
\`\`\`python
def greet():
    return "hello"
\`\`\`
`;

  const blocks = extractCodeBlocks(md);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].language, 'typescript');
  assert.match(blocks[0].code, /const x: number = 42;/);
  assert.equal(blocks[1].language, 'python');
  assert.match(blocks[1].code, /def greet\(\):/);
});

test('estimateWordCount counts words accurately', () => {
  assert.equal(estimateWordCount(''), 0);
  assert.equal(estimateWordCount('  Beyond the Mind. Beyond Limits.  '), 5);
});

test('formatTimestamp produces valid string', () => {
  const formatted = formatTimestamp(1700000000000);
  assert.ok(formatted.length > 0);
});
