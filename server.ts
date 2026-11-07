import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '40mb' }));

// Initialize GoogleGenAI server-side with required User-Agent
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const DEFAULT_SYSTEM_INSTRUCTION = `You are ORVEXIS AI VERSION 2.0 (NEXT GENERATION), a premier, futuristic, omni-disciplinary personal AI assistant and extraordinary cognitive intelligence.
Tagline: "Beyond the Mind. Beyond Limits."
Personality: Polymathic, razor-sharp, thoughtful, creative, professional, and respectful.
You possess extraordinary breadth and depth across all human, technological, and scientific knowledge:

1. UNIVERSAL STEM & THEORETICAL SCIENCES:
   - Deep mastery of Quantum Mechanics (wave-particle duality, Hilbert space, quantum entanglement, QED), General & Special Relativity, Particle Physics, Astrophysics, and Cosmology.
   - Chemistry: Physical, Organic, Analytical, and Molecular Biophysics.
   - Biology & Medicine: Cellular Biochemistry, Molecular Genetics, CRISPR-Cas9, Neuroscience, Systems Biology, and Pharmacology.

2. EXTRAORDINARY MATHEMATICS & REASONING:
   - Step-by-step mathematical problem solving with derivations: Real & Complex Analysis, Abstract Algebra, Differential Geometry, Topology, Linear Algebra, Probability & Stochastic Calculus, Discrete Mathematics, and Information Theory.
   - Rigorous proof construction, intuitive analogies, and verification of edge cases.

3. FRONTIER COMPUTING & SOFTWARE CRAFTSMANSHIP:
   - Production-grade architecture across TypeScript/JavaScript, Python, Rust, Go, C++, Zig, SQL, and modern frameworks.
   - Distributed consensus protocols, kernel concepts, low-latency concurrent systems, zero-trust cybersecurity, microservices, and reactive UI architecture.
   - AI/ML foundations: Transformer architectures, attention mechanisms, embeddings, agentic loops, and reinforcement learning.

4. GLOBAL HUMANITIES, PHILOSOPHY & ECONOMICS:
   - Epistemology, Existentialism, Stoicism, Eastern philosophies, Game Theory, Behavioral Economics, Micro/Macroeconomics, and Geopolitics.

5. GLOBAL LINGUISTICS & REGIONAL SCHOLARSHIP (INCLUDING BANGLA EDUCATION বাংলা শিক্ষা ও সাহিত্য):
   - Flawless multilingual fluency in English, Bengali (বাংলা—সন্ধি, সমাস, কারক-বিভক্তি, রবীন্দ্রনাথ ঠাকুর, কাজী নজরুল ইসলাম, জীবনানন্দ দাশ ও আধুনিক সাহিত্য), Spanish, French, German, Japanese, Mandarin, Arabic, and more.

6. FASTEST-GROWING RESPONSES & EXTRAORDINARY COGNITION:
   - Fastest-growing responses: Provide dense, high-signal information immediately with crisp formatting, avoiding unnecessary throat-clearing.
   - When verified search grounding is used, weave in authoritative citations seamlessly.
   - Never invent verified facts or claim to have accessed external data you did not query. Always maintain your unique, majestic ORVEXIS digital identity.`;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    identity: 'ORVEXIS AI',
    version: '2.0 — Next Generation (Extraordinary Cognition)',
    tagline: 'Beyond the Mind. Beyond Limits.',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Comprehensive error parser for Gemini API
function parseApiError(error: any): { isQuota: boolean; message: string; code: number } {
  let rawMsg = '';
  let status = error?.status || error?.code;

  if (typeof error === 'string') {
    rawMsg = error;
  } else if (error?.message) {
    rawMsg = error.message;
    // Attempt to parse stringified JSON in error.message
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.error) {
        status = parsed.error.code || status;
        rawMsg = parsed.error.message || rawMsg;
      }
    } catch {
      // not JSON
    }
  } else {
    rawMsg = JSON.stringify(error);
  }

  const isQuota =
    status === 429 ||
    rawMsg.includes('429') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('Rate limit') ||
    rawMsg.includes('rate limits');

  if (isQuota) {
    return {
      isQuota: true,
      code: 429,
      message: `⚡ **ORVEXIS Synaptic Quota Limit Reached (HTTP 429)**\n\nThe current Gemini API request quota on the free tier has temporarily saturated.\n\n- **Rate-limit Window:** Free-tier rate limits reset every 60 seconds; please wait a moment before sending another query.\n- **Quota & Usage:** Monitor quota at [ai.dev/rate-limit](https://ai.dev/rate-limit).\n- **High-Throughput Access:** Attach a billing-enabled key in the AI Studio **Settings > Secrets** panel.\n- *Autonomous fallback models were engaged.*`,
    };
  }

  if (status === 403 || rawMsg.includes('PERMISSION_DENIED')) {
    return {
      isQuota: false,
      code: 403,
      message: `🔒 **Permission Denied (HTTP 403)**: Please verify your Gemini API key in the AI Studio **Settings > Secrets** panel.`,
    };
  }

  if (status === 400 && (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid'))) {
    return {
      isQuota: false,
      code: 400,
      message: `🔑 **Invalid API Key**: Please verify your API key in the AI Studio **Settings > Secrets** panel.`,
    };
  }

  return {
    isQuota: false,
    code: typeof status === 'number' ? status : 500,
    message: rawMsg || 'An unexpected error occurred while communicating with ORVEXIS neural core.',
  };
}

// Resilient streaming generator with cascading fallback models & thinking level control
async function generateStreamWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config: any;
    preferredModel?: string;
    thinkingLevel?: ThinkingLevel;
  }
) {
  // Cascading models: Primary flash -> Flash-Lite -> Flash-Latest
  const candidates = [
    params.preferredModel || 'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  const uniqueModels = Array.from(new Set(candidates));
  let lastErr: any = null;

  for (let i = 0; i < uniqueModels.length; i++) {
    const model = uniqueModels[i];
    try {
      const activeConfig: any = { ...params.config };
      
      // ThinkingLevel is supported on gemini-3.8-flash
      if (model === 'gemini-3.8-flash' && params.thinkingLevel) {
        activeConfig.thinkingConfig = { thinkingLevel: params.thinkingLevel };
      } else {
        // Strip thinkingConfig for fallback models that don't support ThinkingLevel.HIGH
        delete activeConfig.thinkingConfig;
      }

      const stream = await ai.models.generateContentStream({
        model,
        contents: params.contents,
        config: activeConfig,
      });
      return { stream, modelUsed: model };
    } catch (err: any) {
      lastErr = err;
      const parsed = parseApiError(err);
      console.warn(`[ORVEXIS AI] Stream model ${model} failed (quota: ${parsed.isQuota}). ${err?.message?.slice(0, 100)}`);

      // If search grounding was attached, try without search grounding on fallback
      if (params.config?.tools && i > 0) {
        try {
          const { tools: _tools, ...configWithoutTools } = params.config;
          delete configWithoutTools.thinkingConfig;
          const fallbackStream = await ai.models.generateContentStream({
            model,
            contents: params.contents,
            config: configWithoutTools,
          });
          return { stream: fallbackStream, modelUsed: `${model} (standard)` };
        } catch (toolErr) {
          lastErr = toolErr;
        }
      }

      if (parsed.isQuota && i < uniqueModels.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 450));
      } else if (!parsed.isQuota && !err?.message?.includes('not found')) {
        throw err;
      }
    }
  }

  throw lastErr;
}

// Resilient single-shot generator with cascading fallback models
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
    thinkingLevel?: ThinkingLevel;
  }
) {
  const candidates = [
    params.preferredModel || 'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  const uniqueModels = Array.from(new Set(candidates));
  let lastErr: any = null;

  for (let i = 0; i < uniqueModels.length; i++) {
    const model = uniqueModels[i];
    try {
      const activeConfig: any = { ...params.config };
      if (model === 'gemini-3.8-flash' && params.thinkingLevel) {
        activeConfig.thinkingConfig = { thinkingLevel: params.thinkingLevel };
      } else {
        delete activeConfig.thinkingConfig;
      }

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: activeConfig,
      });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastErr = err;
      const parsed = parseApiError(err);
      console.warn(`[ORVEXIS AI] Content model ${model} failed (quota: ${parsed.isQuota}). ${err?.message?.slice(0, 100)}`);

      if (params.config?.tools && i > 0) {
        try {
          const { tools: _tools, ...cleanConfig } = params.config;
          delete cleanConfig.thinkingConfig;
          const retryRes = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: cleanConfig,
          });
          return { response: retryRes, modelUsed: `${model} (standard)` };
        } catch (retryErr) {
          lastErr = retryErr;
        }
      }

      if (parsed.isQuota && i < uniqueModels.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 450));
      } else if (!parsed.isQuota && !err?.message?.includes('not found')) {
        throw err;
      }
    }
  }

  throw lastErr;
}

// Main chat streaming endpoint (SSE) with Extraordinary Cognition & High-Speed Stream
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages,
    systemInstruction,
    imageAttachment,
    webSearchEnabled,
    thinkingLevel,
    speedEngine,
  } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please verify your secret in AI Studio Settings > Secrets.',
    });
    return;
  }

  // Set SSE headers with unbuffered transfer for fastest-growing answer output
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const startTime = Date.now();
  let estimatedTokens = 0;

  try {
    const formattedInstruction = systemInstruction
      ? `${DEFAULT_SYSTEM_INSTRUCTION}\n\nUser Context & Custom Instructions:\n${systemInstruction}`
      : DEFAULT_SYSTEM_INSTRUCTION;

    // Prepare contents array for Gemini
    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((msg, idx) => {
        const isLast = idx === messages.length - 1;
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

        // If there's an image on the last message, attach it
        if (isLast && imageAttachment && imageAttachment.data) {
          parts.push({
            inlineData: {
              mimeType: imageAttachment.mimeType || 'image/jpeg',
              data: imageAttachment.data.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        }

        parts.push({ text: msg.content || '' });

        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        });
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello ORVEXIS AI. Introduce yourself briefly.' }],
      });
    }

    const config: any = {
      systemInstruction: formattedInstruction,
    };

    if (webSearchEnabled) {
      config.tools = [{ googleSearch: {} }];
    }

    // Determine thinking level based on user preference and speed engine
    let sdkThinkingLevel: ThinkingLevel = ThinkingLevel.MEDIUM;
    if (thinkingLevel === 'extraordinary' || thinkingLevel === 'high' || speedEngine === 'deep-cognitive') {
      sdkThinkingLevel = ThinkingLevel.HIGH;
    } else if (thinkingLevel === 'fast' || speedEngine === 'hyper-fast') {
      sdkThinkingLevel = ThinkingLevel.LOW;
    }

    const { stream: streamResponse } = await generateStreamWithFallback(ai, {
      contents,
      config,
      preferredModel: 'gemini-3.8-flash',
      thinkingLevel: sdkThinkingLevel,
    });

    const collectedSources: Array<{ title: string; uri: string }> = [];
    let collectedSearchQueries: string[] = [];

    for await (const chunk of streamResponse) {
      const text = chunk.text;

      if (text) {
        estimatedTokens += Math.max(1, Math.ceil(text.length / 4));
      }

      // Extract search grounding metadata if present
      const candidate = chunk.candidates?.[0];
      const grounding = candidate?.groundingMetadata;
      if (grounding?.webSearchQueries && Array.isArray(grounding.webSearchQueries)) {
        collectedSearchQueries = grounding.webSearchQueries;
      }
      if (grounding?.groundingChunks) {
        for (const gc of grounding.groundingChunks) {
          if (gc.web?.uri) {
            const exists = collectedSources.some((s) => s.uri === gc.web?.uri);
            if (!exists) {
              collectedSources.push({
                title: gc.web.title || 'Verified Web Source',
                uri: gc.web.uri,
              });
            }
          }
        }
      }

      const elapsedMs = Math.max(Date.now() - startTime, 1);
      const tokensPerSec = Math.round((estimatedTokens / (elapsedMs / 1000)) * 10) / 10;

      if (text || collectedSources.length > 0) {
        res.write(
          `data: ${JSON.stringify({
            text: text || '',
            sources: collectedSources.length > 0 ? collectedSources : undefined,
            searchQueries: collectedSearchQueries.length > 0 ? collectedSearchQueries : undefined,
            speedMetrics: { tokensPerSec, elapsedMs },
          })}\n\n`
        );
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat generation error:', error);
    const parsed = parseApiError(error);
    res.write(
      `data: ${JSON.stringify({
        error: parsed.message,
        isQuota: parsed.isQuota,
        code: parsed.code,
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Dedicated Web Search Grounding Endpoint (ORVEXIS WEB INTELLIGENCE)
app.post('/api/websearch', async (req: Request, res: Response) => {
  const { query } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
    return;
  }

  try {
    const { response } = await generateContentWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: `Search the live internet and synthesize a verified, clear report on: "${query}".
Distinguish verified facts from assumptions, list key takeaways, and provide citations.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are ORVEXIS WEB INTELLIGENCE. Provide factually grounded summaries with explicit distinction between confirmed data and assumptions.`,
      },
    });

    const sources: Array<{ title: string; uri: string }> = [];
    const candidate = response.candidates?.[0];
    const grounding = candidate?.groundingMetadata;
    if (grounding?.groundingChunks) {
      for (const gc of grounding.groundingChunks) {
        if (gc.web?.uri) {
          sources.push({
            title: gc.web.title || 'Web Reference',
            uri: gc.web.uri,
          });
        }
      }
    }

    res.json({
      answer: response.text,
      sources,
      searchQueries: grounding?.webSearchQueries || [],
    });
  } catch (err: any) {
    console.error('Web search error:', err);
    const parsed = parseApiError(err);
    res.status(parsed.code || 500).json({ error: parsed.message, isQuota: parsed.isQuota });
  }
});

// Structured Thinking Mode (ORVEXIS THINK)
app.post('/api/think', async (req: Request, res: Response) => {
  const { topic, depth = 'deep', domain = 'general' } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
    return;
  }

  const prompt = `Analyze this problem/question using ORVEXIS THINK - a structured cognitive breakdown protocol.
Topic / Problem:
"${topic}"
Domain: ${domain}
Depth: ${depth}

Provide a comprehensive, high-clarity breakdown with these distinct sections:
1. [Core Premise & Problem Framing] - Underlying axioms, hidden assumptions, and boundaries.
2. [Hypotheses & Cognitive Paths] - 2-3 viable angles or approaches.
3. [Deductive Step-by-Step Analysis] - Systematic logical resolution with pros/cons.
4. [Critical Counter-Arguments & Edge Cases] - What could go wrong? Blind spots & constraints.
5. [Synthesis & Action Matrix] - Pragmatic, prioritized next actions.

Format with clear headers and sleek markdown bullet points.`;

  try {
    const { response } = await generateContentWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are operating in ORVEXIS THINK mode. Be rigorous, deeply analytical, and structured.`,
      },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error('Think API error:', err);
    const parsed = parseApiError(err);
    res.status(parsed.code || 500).json({ error: parsed.message, isQuota: parsed.isQuota });
  }
});

// ORVEXIS CODE - Dedicated Software Engineering Studio
app.post('/api/code', async (req: Request, res: Response) => {
  const { code, task, language = 'typescript', additionalContext = '' } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
    return;
  }

  const prompt = `You are ORVEXIS CODE STUDIO, an elite software engineering intelligence.
Task: ${task}
Language: ${language}
Context: ${additionalContext}

Code Snippet / Request:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. High-level Architecture & Plan (Component breakdown and algorithmic approach).
2. Production-Grade Solution (complete code block with type-safety, clean formatting, and modern idioms).
3. Step-by-Step Debugger & Complexity Breakdown (Time/Space Big-O, edge cases, resilience).
4. Unit Test Recommendations or verification steps with realistic test fixtures.`;

  try {
    const { response } = await generateContentWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are ORVEXIS CODE STUDIO, delivering uncompromising software craftsmanship.`,
      },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error('Code API error:', err);
    const parsed = parseApiError(err);
    res.status(parsed.code || 500).json({ error: parsed.message, isQuota: parsed.isQuota });
  }
});

// ORVEXIS VISION - Multimodal Analysis
app.post('/api/vision', async (req: Request, res: Response) => {
  const {
    imageBase64,
    mimeType = 'image/jpeg',
    prompt = 'Provide an in-depth breakdown of this image, its components, aesthetics, and technical implications.',
  } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
    return;
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const { response } = await generateContentWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `You are ORVEXIS VISION. Analyze this visual input with high precision.
User Query: "${prompt}"

Structure the visual report:
1. Executive Summary: What does this visual portray?
2. Detailed Visual & Aesthetic Analysis: Color palette, lighting, textures, spatial geometry.
3. Key Components & Notable Entities: What elements are present?
4. Technical & Design Insights: UI/UX, architectural or physical observations.
5. Actionable Recommendations or Next Steps.`,
          },
        ],
      },
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are ORVEXIS VISION, possessing photographic and structural analysis acuity.`,
      },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error('Vision API error:', err);
    const parsed = parseApiError(err);
    res.status(parsed.code || 500).json({ error: parsed.message, isQuota: parsed.isQuota });
  }
});

// ORVEXIS STUDY - Pedagogical Learning Assistant (Includes Bangla, Math, English, Science)
app.post('/api/study', async (req: Request, res: Response) => {
  const { topic, subjectArea = 'general', level = 'all', language = 'English', includeQuiz = true } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
    return;
  }

  const prompt = `You are ORVEXIS STUDY, a master pedagogical tutor.
Subject Area: ${subjectArea} (Mathematics, Science, English Learning, Bangla Language/Literature, Computing, General)
Topic / Concept: "${topic}"
Target Level: ${level}
Teaching Language: ${language}

Provide a structured masterclass breakdown:
1. Concept Definition & Intuitive Mental Model: Explain it using an unforgettable analogy.
2. Step-by-Step Pedagogical Deep Dive:
   - Level 1: Foundations (The intuitive "ELI5" understanding)
   - Level 2: Core Mechanics, Equations & Rules (The practical working knowledge)
   - Level 3: Frontier Mastery & Nuances (Edge cases, deep theory, advanced problem solving)
3. Key Takeaways & Mnemonic Anchors.
${includeQuiz ? '4. Interactive 3-Question Mastery Quiz with questions, multiple-choice options (A, B, C, D), correct answers, and thorough explanations.' : ''}

If teaching Bangla language/literature, provide correct script, pronunciation guidance, and cultural/linguistic context.
If teaching mathematics, write step-by-step mathematical derivations.`;

  try {
    const { response } = await generateContentWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are ORVEXIS STUDY, guiding the learner to deep intuition and conceptual mastery.`,
      },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error('Study API error:', err);
    const parsed = parseApiError(err);
    res.status(parsed.code || 500).json({ error: parsed.message, isQuota: parsed.isQuota });
  }
});

// ORVEXIS CREATE - Creative Writing & Worldbuilding
app.post('/api/create', async (req: Request, res: Response) => {
  const { theme, category = 'sci-fi', tone = 'visionary', length = 'medium' } = req.body;

  const ai = getAIClient();
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
    return;
  }

  const prompt = `You are ORVEXIS CREATE, a futuristic creative visionary.
Concept/Theme: "${theme}"
Category: ${category}
Tone: ${tone}
Length: ${length}

Craft an original, evocative, and compelling piece of creative writing or conceptual worldbuilding. Use rich imagery, striking prose, and innovative ideas.`;

  try {
    const { response } = await generateContentWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are ORVEXIS CREATE, blending poetic resonance with futuristic imagination.`,
      },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error('Create API error:', err);
    const parsed = parseApiError(err);
    res.status(parsed.code || 500).json({ error: parsed.message, isQuota: parsed.isQuota });
  }
});

// Vite middleware or static serving
async function setupApp() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ORVEXIS AI Engine v2.0 listening on port ${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
});
