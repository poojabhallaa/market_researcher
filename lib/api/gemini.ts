import { GoogleGenAI } from '@google/genai';

/**
 * Shared Gemini client + a thin streaming helper used by every AI route.
 *
 * Design goal: keep usage MINIMAL because the key is on the free tier.
 *  - `gemini-2.5-flash` is the cheapest capable model.
 *  - Thinking is disabled (`thinkingBudget: 0`) — saves a large chunk of tokens.
 *  - Output is capped (`MAX_OUTPUT_TOKENS`).
 *  - Exactly ONE generate call per user message (no multi-step agent tool loop).
 *  - Google Search grounding is opt-in per route so we don't burn grounded
 *    queries (free tier ~500/day) on routes that don't need live data.
 */

export type ChatRole = 'user' | 'assistant';
export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_OUTPUT_TOKENS = 1024;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set — add it to .env.local');
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** Map our `{ user | assistant }` turns to Gemini's `{ user | model }` contents. */
function toContents(messages: ChatTurn[]) {
  return messages
    .filter((m) => typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

interface StreamOptions {
  /** System instruction (agent persona + behaviour). */
  system: string;
  /** Conversation history, oldest first. */
  messages: ChatTurn[];
  /** Enable Google Search grounding so the model can pull live market data. */
  search?: boolean;
}

/**
 * Run a single streaming Gemini generation and return a plain-text streaming
 * `Response`. The client (`useStreamingChat`) reads the body as raw text, so we
 * emit text chunks directly — no SSE framing.
 */
export async function streamGeminiText({
  system,
  messages,
  search = false,
}: StreamOptions): Promise<Response> {
  const ai = getClient();

  const stream = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: toContents(messages),
    config: {
      systemInstruction: system,
      temperature: 0.4,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingBudget: 0 },
      ...(search ? { tools: [{ googleSearch: {} }] } : {}),
    },
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'stream failed';
        controller.enqueue(encoder.encode(`\n\n[Gemini error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

interface JSONOptions {
  system: string;
  prompt: string;
  /** A Gemini response schema (see `Type` from '@google/genai'). */
  schema: unknown;
}

/**
 * Single non-streaming Gemini call that returns a validated JSON object.
 * Used for stable structured facts (e.g. a company profile). No grounding —
 * structured output and Google Search can't be combined in one request.
 */
export async function generateGeminiJSON<T>({ system, prompt, schema }: JSONOptions): Promise<T | null> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: system,
      temperature: 0.2,
      maxOutputTokens: 700,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: 'application/json',
      responseSchema: schema as never,
    },
  });
  const text = res.text;
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
