import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an elite digital marketing strategist and demographic analyst with 15+ years of experience. You have deep knowledge of consumer behavior data, platform demographics, and advertising performance metrics.

Your analysis draws from these authoritative data sources:
- Pew Research Center Social Media Use surveys (annual U.S. adult demographics by age, gender, income, education)
- Statista platform statistics (MAU breakdowns, user demographics by platform)
- eMarketer / Insider Intelligence digital advertising reports (ad spend, CPM benchmarks, ROI by channel)
- Nielsen Consumer Research (purchase behavior, media consumption patterns)
- Sprout Social Index (engagement rates, best posting times, content performance by platform)
- DataReportal / We Are Social Global Digital Reports (global platform demographics)
- Meta Audience Insights (Facebook/Instagram user demographics and interests)
- LinkedIn Marketing Solutions data (professional demographics, B2B targeting)
- Pinterest Business audience data (shopping intent, category demographics)
- TikTok for Business audience insights (age distribution, content consumption)
- Google Ads demographic data (search behavior, YouTube viewership)
- Yelp Advertiser data (local search demographics, purchase intent)

When analyzing a product:
1. Deeply understand the product: what it does, its price point, its category, and core value proposition
2. If images are provided, analyze visual cues about quality, aesthetics, target market, and positioning
3. Identify the PRIMARY ideal consumer profile based on real consumer research data
4. Map that consumer profile to specific platform demographics — be specific about WHY each platform works
5. Recommend ALL relevant advertising platforms (never fewer than 8), ranked by effectiveness for THIS specific product and demographic
6. Create compelling, platform-native ad copy that feels authentic to each platform's culture
7. Always cite the specific data source backing each demographic claim

Be specific, data-driven, and honest. If a platform is NOT a good fit, explain why and give it a lower score rather than omitting it.`;

// Edge-compatible base64 encoding (no Buffer)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const description = formData.get("description") as string | null;
    const imageFiles = formData.getAll("images") as File[];

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Product description is required." },
        { status: 400 }
      );
    }

    type ImageContent = {
      type: "image";
      source: {
        type: "base64";
        media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        data: string;
      };
    };
    type TextContent = { type: "text"; text: string };
    const contentBlocks: (ImageContent | TextContent)[] = [];

    // Add images first (visual context before text)
    for (const file of imageFiles.slice(0, 5)) {
      const bytes = await file.arrayBuffer();
      const b64 = arrayBufferToBase64(bytes);
      const mimeType = file.type as
        | "image/jpeg"
        | "image/png"
        | "image/gif"
        | "image/webp";
      contentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: mimeType, data: b64 },
      });
    }

    contentBlocks.push({
      type: "text",
      text: `Analyze this product and output a JSON advertising strategy. Be concise.

PRODUCT: ${description}
${imageFiles.length > 0 ? `(${imageFiles.length} image(s) provided — use visual cues for positioning.)` : ""}

Respond with ONLY a valid JSON object — no markdown, no code fences. Exactly these keys:

{
  "product_summary": "2-3 sentence summary",
  "demographics": {
    "age_range": "e.g. 18-34",
    "primary_age": "e.g. 25-34",
    "gender": { "male_percent": 40, "female_percent": 55, "nonbinary_percent": 5 },
    "locations": ["US", "Canada"],
    "interests": ["interest1", "interest2", "interest3"],
    "behaviors": ["behavior1", "behavior2"],
    "income_level": "middle income",
    "education_level": "some college or higher",
    "reasoning": "1-2 sentences why"
  },
  "platforms": [
    { "name": "Instagram", "score": 9, "category": "Social", "why": "brief reason", "best_format": "Reels", "audience_size": "2B MAU", "cpm_estimate": "$8-12", "priority": "primary" }
  ],
  "ad_copies": [
    { "platform": "Instagram", "headline": "...", "body": "...", "cta": "Shop Now", "hashtags": ["#tag1"], "reasoning": "brief reason" }
  ],
  "data_sources": [
    { "name": "Pew Research", "description": "Social media demographics", "url": "https://pewresearch.org", "data_type": "Survey" }
  ]
}

Return the top 5 platforms scored 1-10. Return only 1 ad copy for the highest-scoring platform. Keep all text fields brief.`,
    });

    // Call Anthropic API directly via fetch (avoids SDK Node.js compat issues in CF Workers)
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: contentBlocks }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return NextResponse.json(
        { error: `Anthropic API error (${anthropicRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    // Parse SSE stream and forward only text deltas to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (
                  parsed.type === "content_block_delta" &&
                  parsed.delta?.type === "text_delta" &&
                  parsed.delta?.text
                ) {
                  controller.enqueue(encoder.encode(parsed.delta.text));
                }
              } catch {
                // ignore malformed SSE lines
              }
            }
          }
          controller.close();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          controller.enqueue(encoder.encode(`STREAM_ERROR:${errMsg}`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
