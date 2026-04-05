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
      text: `Analyze this product and generate a comprehensive advertising strategy:

PRODUCT DESCRIPTION:
${description}

${imageFiles.length > 0 ? `(${imageFiles.length} product image(s) provided above — analyze them for visual positioning cues, target market signals, quality level, and aesthetic.)` : "(No product images provided — base your analysis entirely on the description.)"}

Please provide:
1. A clear product summary
2. Detailed ideal demographic profile with reasoning backed by real consumer research data
3. All relevant advertising platforms ranked by effectiveness (score each 1-10), including Meta/Facebook, Instagram, TikTok, Pinterest, LinkedIn, YouTube, Google Ads, Twitter/X, Reddit, Snapchat, Yelp, and Amazon (where applicable)
4. Ad copy for the top 3-4 most effective platforms — make it compelling, platform-native, and targeted to the demographic
5. The specific data sources you drew from for demographic and platform data

IMPORTANT: Respond with ONLY a valid JSON object — no markdown, no code fences, no explanation. The JSON must have exactly these top-level keys: product_summary, demographics, platforms, ad_copies, data_sources.

demographics must include: age_range, primary_age, gender (with male_percent, female_percent, nonbinary_percent), locations (array), interests (array), behaviors (array), income_level, education_level, reasoning.

Each platform in platforms must include: name, score (1-10 number), category, why, best_format, audience_size, cpm_estimate, priority ("primary"|"secondary"|"optional").

Each item in ad_copies must include: platform, headline, body, cta, hashtags (array, empty if not applicable), reasoning.

Each item in data_sources must include: name, description, url, data_type.

Return at least 8 platforms covering Meta/Facebook, Instagram, TikTok, Pinterest, LinkedIn, YouTube, Google Ads, Twitter/X, Reddit, Yelp, Snapchat, Amazon (score each appropriately).
Return ad_copies for the top 3-4 highest scoring platforms.`,
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
        model: "claude-opus-4-6",
        max_tokens: 8192,
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
