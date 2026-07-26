import { NextRequest, NextResponse } from "next/server";

const FLAG_SYSTEM_PROMPT = `You are a strict content moderation system for a university social platform. 
Detect ANY sensitive or inappropriate content.

FLAG these: hate speech, harassment, bullying, threats, personal attacks, explicit sexual content, nudity, violence, gore, self-harm, suicide, profanity, slurs, offensive language, spam, scams, phishing, academic dishonesty (cheating, exam leaks, selling papers), illegal content (drugs, weapons, piracy), doxxing (posting private info).

DO NOT flag: normal academic discussion, study help, campus events, casual conversation, opinions, jokes without malicious intent.

Be thorough — if unsure, flag it.

Respond with ONLY valid JSON (no markdown, no backticks):
{"safe": false, "categories": ["cat1", "cat2"], "reason": "specific reason"}
or
{"safe": true, "categories": [], "reason": ""}

Text: `;

type ModelConfig = {
  model: string;
  key: string;
};

const VIDEO_MODELS: ModelConfig[] = [
  { model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", key: "VIDEO_MODEL_1_KEY" },
  { model: "nvidia/nemotron-nano-12b-v2-vl:free", key: "VIDEO_MODEL_2_KEY" },
  { model: "google/gemma-4-26b-a4b-it:free", key: "VIDEO_MODEL_3_KEY" },
  { model: "google/gemma-4-31b-it:free", key: "VIDEO_MODEL_3_KEY" },
];

const IMAGE_MODELS: ModelConfig[] = [
  { model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", key: "IMAGE_MODEL_1_KEY" },
  { model: "nvidia/nemotron-nano-12b-v2-vl:free", key: "IMAGE_MODEL_2_KEY" },
  { model: "google/gemma-4-31b-it:free", key: "IMAGE_MODEL_3_KEY" },
  { model: "google/gemma-4-26b-a4b-it:free", key: "IMAGE_MODEL_4_KEY" },
];

const TEXT_MODELS: ModelConfig[] = [
  { model: "nvidia/nemotron-3-ultra-550b-a55b:free", key: "TEXT_MODEL_1_KEY" },
  { model: "nvidia/nemotron-3-super-120b-a12b:free", key: "TEXT_MODEL_2_KEY" },
  { model: "meta-llama/llama-3.1-8b-instruct:free", key: "OPENROUTER_API_KEY" },
];

async function callOpenRouter(model: string, apiKey: string, messages: any[]): Promise<string | null> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://uniconnect.app",
      "X-Title": "UniConnect Moderation",
    },
    body: JSON.stringify({ model, messages, max_tokens: 300, temperature: 0.1 }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

function parseResult(raw: string | null): { safe: boolean; categories: string[]; reason: string } | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      safe: parsed.safe !== false,
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
    };
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { image, text, type } = await req.json();

    if (type === "text" && text) {
      let anyFlagged = false;
      const allCategories: string[] = [];
      const reasons: string[] = [];

      for (const cfg of TEXT_MODELS) {
        const apiKey = process.env[cfg.key];
        if (!apiKey) continue;
        try {
          const raw = await callOpenRouter(cfg.model, apiKey, [{ role: "user", content: FLAG_SYSTEM_PROMPT + `"${text}"` }]);
          const parsed = parseResult(raw);
          if (parsed && !parsed.safe) {
            anyFlagged = true;
            allCategories.push(...parsed.categories);
            if (parsed.reason) reasons.push(parsed.reason);
          }
        } catch { continue; }
      }

      return NextResponse.json(
        anyFlagged
          ? { safe: false, categories: [...new Set(allCategories)], reason: reasons.join("; ") || "Sensitive content detected" }
          : { safe: true, categories: [], reason: "" }
      );
    }

    if (image) {
      const configs = type === "video" ? VIDEO_MODELS : IMAGE_MODELS;
      let anyFlagged = false;
      const allCategories: string[] = [];
      const reasons: string[] = [];

      for (const cfg of configs) {
        const apiKey = process.env[cfg.key];
        if (!apiKey) continue;
        try {
          const raw = await callOpenRouter(cfg.model, apiKey, [
            {
              role: "user",
              content: [
                { type: "text", text: `You are a strict content moderation system for a university platform. Analyze this image for ANY sensitive or inappropriate content. Flag: nudity, sexual content, violence, gore, weapons, hate symbols, drugs, self-harm. Do NOT flag: normal campus photos. Respond with ONLY valid JSON: {"safe": false, "categories": [...], "reason": "..."} or {"safe": true, "categories": [], "reason": ""}` },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
              ],
            },
          ]);
          const parsed = parseResult(raw);
          if (parsed && !parsed.safe) {
            anyFlagged = true;
            allCategories.push(...parsed.categories);
            if (parsed.reason) reasons.push(parsed.reason);
          }
        } catch { continue; }
      }

      return NextResponse.json(
        anyFlagged
          ? { safe: false, categories: [...new Set(allCategories)], reason: reasons.join("; ") || "Sensitive content detected" }
          : { safe: true, categories: [], reason: "" }
      );
    }

    return NextResponse.json({ safe: true, categories: [], reason: "" });
  } catch {
    return NextResponse.json({ safe: true, categories: [], reason: "" });
  }
}
