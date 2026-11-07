import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVoiceCommand } from './voiceCommands';

test('parseVoiceCommand identifies navigation commands with wake words', () => {
  const res1 = parseVoiceCommand('Hey ORVEXIS, open coding.');
  assert.equal(res1.isCommand, true);
  assert.equal(res1.action, 'navigate');
  assert.equal(res1.targetView, 'code');

  const res2 = parseVoiceCommand('ORVEXIS, open think');
  assert.equal(res2.isCommand, true);
  assert.equal(res2.targetView, 'think');

  const res3 = parseVoiceCommand('open study mode');
  assert.equal(res3.isCommand, true);
  assert.equal(res3.targetView, 'study');

  const res4 = parseVoiceCommand('Open vision');
  assert.equal(res4.isCommand, true);
  assert.equal(res4.targetView, 'vision');
});

test('parseVoiceCommand identifies system actions', () => {
  const searchCmd = parseVoiceCommand('Search the internet.');
  assert.equal(searchCmd.isCommand, true);
  assert.equal(searchCmd.action, 'toggle-search');

  const themeCmd = parseVoiceCommand('Change the theme.');
  assert.equal(themeCmd.isCommand, true);
  assert.equal(themeCmd.action, 'change-theme');

  const chatCmd = parseVoiceCommand('Start a new conversation.');
  assert.equal(chatCmd.isCommand, true);
  assert.equal(chatCmd.action, 'new-chat');

  const stopCmd = parseVoiceCommand('Stop speaking');
  assert.equal(stopCmd.isCommand, true);
  assert.equal(stopCmd.action, 'stop-speaking');

  const repeatCmd = parseVoiceCommand('Repeat answer');
  assert.equal(repeatCmd.isCommand, true);
  assert.equal(repeatCmd.action, 'repeat');
});

test('parseVoiceCommand treats conversational queries as query action', () => {
  const query = parseVoiceCommand('Hey ORVEXIS, what is the speed of light in quantum gravity?');
  assert.equal(query.isCommand, false);
  assert.equal(query.action, 'query');
  assert.match(query.cleanedQuery || '', /speed of light in quantum gravity/);
});
