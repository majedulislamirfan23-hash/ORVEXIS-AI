import test from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeAutonomousResponse } from './autonomousSynthesizer';

test('synthesizeAutonomousResponse handles Bengali science queries', () => {
  const result = synthesizeAutonomousResponse('কোয়ান্টাম মেকানিক্স কি?');
  assert.match(result, /কোয়ান্টাম মেকানিক্স/);
  assert.match(result, /সুপারপজিশন/);
  assert.match(result, /এন্ট্যাঙ্গলমেন্ট/);
});

test('synthesizeAutonomousResponse handles Bengali literature and grammar queries', () => {
  const result = synthesizeAutonomousResponse('সন্ধি ও সমাসের পার্থক্য এবং নজরুল');
  assert.match(result, /সন্ধি ও সমাস/);
  assert.match(result, /কাজী নজরুল ইসলাম/);
});

test('synthesizeAutonomousResponse handles coding & architecture queries', () => {
  const result = synthesizeAutonomousResponse('Design a distributed architecture with TypeScript and Redis');
  assert.match(result, /Distributed Architecture/i);
  assert.match(result, /```typescript/);
  assert.match(result, /DistributedEventPipeline/);
});

test('synthesizeAutonomousResponse handles quantum mechanics STEM queries', () => {
  const result = synthesizeAutonomousResponse('Explain quantum state superposition and Schrodinger equation');
  assert.match(result, /Schrödinger equation/i);
  assert.match(result, /Superposition Principle/i);
});

test('synthesizeAutonomousResponse handles study and pedagogical queries', () => {
  const result = synthesizeAutonomousResponse('Can you tutor me on system design?', { mode: 'study' });
  assert.match(result, /Pedagogical Masterclass/i);
  assert.match(result, /Level 1: Conceptual Intuition/);
  assert.match(result, /3-Question Mastery Verification/);
});
