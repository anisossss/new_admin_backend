import { Router } from "express";
import { generateStructured, generateText } from "../services/claude.js";

const router = Router();

const CATEGORIES = [
  "Politique",
  "Économie",
  "Société",
  "Sport",
  "Culture",
  "Tech",
  "International",
  "Santé",
];

const LANGUAGES = {
  fr: "French",
  en: "English",
  ar: "Modern Standard Arabic",
};

const TONES = {
  neutre: "neutral and balanced",
  formel: "formal and institutional",
  dynamique: "dynamic and punchy",
  analytique: "analytical and in-depth",
};

const LENGTHS = {
  court: "around 300 words",
  moyen: "around 600 words",
  long: "at least 1000 words",
};

const REFORMULATE_MODES = {
  ameliorer: "Improve the clarity, flow and style without changing the meaning",
  raccourcir: "Shorten the text significantly while keeping every key piece of information",
  developper: "Expand and enrich the text with relevant detail and context",
  simplifier: "Simplify the vocabulary and sentence structure for a general audience",
  professionnel: "Rewrite in a polished, professional journalistic tone",
};

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

// POST /api/ai/generate — full article generation
router.post("/generate", async (req, res) => {
  try {
    const { topic, language = "fr", tone = "neutre", length = "moyen", instructions } =
      req.body || {};
    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    const lang = LANGUAGES[language] || LANGUAGES.fr;
    const toneDesc = TONES[tone] || TONES.neutre;
    const lengthDesc = LENGTHS[length] || LENGTHS.moyen;

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["title", "excerpt", "contentHtml", "category", "tags"],
      properties: {
        title: {
          type: "string",
          description: "Compelling news headline in the requested language",
        },
        excerpt: {
          type: "string",
          description: "Standfirst of 1-2 sentences summarising the article",
        },
        contentHtml: {
          type: "string",
          description: "Full article body as clean semantic HTML",
        },
        category: { type: "string", enum: CATEGORIES },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "3 to 6 short lowercase topical tags",
        },
      },
    };

    const system = `You are a senior news journalist at a leading Tunisian newsroom, with deep knowledge of Tunisia and the wider Maghreb — its institutions, regions, economy, culture and sport. You write factual, rigorous, professionally structured news articles.

Rules for the article body (contentHtml):
- Write entirely in ${lang}.
- Produce clean semantic HTML using ONLY these tags: <p> <h2> <h3> <ul> <ol> <li> <blockquote> <strong> <em>.
- Never use <h1>, inline styles, classes, ids, images or scripts.
- Structure the piece with 2 to 4 <h2> section headings (and <h3> sub-headings when useful).
- Target length: ${lengthDesc}.
- Tone: ${toneDesc}. Stay factual and journalistic; no sensationalism, and never present invented precise figures as official statistics.
- Anchor the story in a realistic Tunisian / Maghreb context.
- The category must be exactly one of: ${CATEGORIES.join(", ")}.`;

    const prompt = `Write a complete news article on the following topic:\n\n${String(topic).trim()}${
      instructions ? `\n\nAdditional editorial instructions: ${String(instructions).trim()}` : ""
    }`;

    const result = await generateStructured({ system, prompt, schema });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/ai/reformulate — rewrite text or HTML, preserving structure
router.post("/reformulate", async (req, res) => {
  try {
    const { text, mode = "ameliorer", language = "fr" } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const lang = LANGUAGES[language] || LANGUAGES.fr;
    const instruction = REFORMULATE_MODES[mode] || REFORMULATE_MODES.ameliorer;

    const system = `You are an expert copy editor working in ${lang} for a Tunisian newsroom.

Task: ${instruction}.

Rules:
- Write in ${lang}.
- If the input contains HTML, preserve the same HTML tag structure (use only the tags already present in the input) and rewrite the prose inside the tags. If the input is plain text, answer in plain text.
- Output ONLY the rewritten text — no preamble, no explanation, no markdown code fences.`;

    const result = await generateText({ system, prompt: String(text) });
    res.json({ text: result.trim() });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/ai/seo — meta title/description, keywords and slug
router.post("/seo", async (req, res) => {
  try {
    const { title = "", content = "", language = "fr" } = req.body || {};
    if (!String(title).trim() && !String(content).trim()) {
      return res.status(400).json({ error: "title or content is required" });
    }

    const lang = LANGUAGES[language] || LANGUAGES.fr;
    const plain = stripHtml(content);

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["metaTitle", "metaDescription", "keywords", "slug"],
      properties: {
        metaTitle: { type: "string", description: "SEO title, 60 characters maximum" },
        metaDescription: {
          type: "string",
          description: "SEO meta description, 155 characters maximum",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "5 to 8 lowercase keywords or short phrases",
        },
        slug: {
          type: "string",
          description: "URL slug in kebab-case, ASCII only",
        },
      },
    };

    const system = `You are an SEO specialist for online news websites. Produce metadata in ${lang}.

Rules:
- metaTitle: 60 characters maximum, compelling, contains the main keyword.
- metaDescription: 155 characters maximum, one or two active-voice sentences that invite the click.
- keywords: 5 to 8 lowercase keywords or short phrases, most important first.
- slug: kebab-case, lowercase ASCII only (transliterate accented characters), 3 to 8 meaningful words, no stop words.`;

    const prompt = `Article title: ${String(title).trim() || "(none)"}\n\nArticle content:\n${plain || "(none)"}`;

    const result = await generateStructured({ system, prompt, schema, maxTokens: 4000 });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/ai/titles — 5 alternative headlines
router.post("/titles", async (req, res) => {
  try {
    const { topic = "", content = "", language = "fr" } = req.body || {};
    if (!String(topic).trim() && !String(content).trim()) {
      return res.status(400).json({ error: "topic or content is required" });
    }

    const lang = LANGUAGES[language] || LANGUAGES.fr;
    const plain = stripHtml(content);

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["titles"],
      properties: {
        titles: {
          type: "array",
          items: { type: "string" },
          description: "Exactly 5 alternative headlines",
        },
      },
    };

    const system = `You are a headline editor at a Tunisian newsroom. Write headlines in ${lang}.

Rules:
- Produce exactly 5 alternative headlines with clearly different angles: factual, analytical, human-interest, punchy, and a question.
- Each headline under 90 characters.
- No numbering, no surrounding quotes, no clickbait that misrepresents the story.`;

    const prompt = [
      String(topic).trim() ? `Topic: ${String(topic).trim()}` : "",
      plain ? `Draft content:\n${plain}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await generateStructured({ system, prompt, schema, maxTokens: 4000 });
    res.json({ titles: result.titles });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
