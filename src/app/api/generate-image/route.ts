import { NextRequest, NextResponse } from "next/server";

const PLATFORM_SPECS: Record<string, { width: number; height: number; style: string }> = {
  Instagram: { width: 1080, height: 1080, style: "square Instagram post, vibrant lifestyle photography, aesthetic composition, beautiful colors" },
  "Instagram Story": { width: 1080, height: 1920, style: "vertical Instagram Story, bold full-bleed visual, lifestyle, portrait orientation" },
  TikTok: { width: 1080, height: 1920, style: "vertical TikTok thumbnail, energetic, Gen Z aesthetic, dynamic portrait composition" },
  Facebook: { width: 1200, height: 628, style: "horizontal Facebook ad banner, friendly lifestyle photography, wide composition" },
  LinkedIn: { width: 1200, height: 628, style: "professional LinkedIn ad, clean business photography, horizontal, corporate aesthetic" },
  Pinterest: { width: 1000, height: 1500, style: "tall Pinterest pin, aspirational warm aesthetic, portrait 2:3 composition, lifestyle photography" },
  "Twitter/X": { width: 1200, height: 675, style: "horizontal Twitter post, punchy bold visual, attention-grabbing, wide format" },
  YouTube: { width: 1280, height: 720, style: "YouTube thumbnail, dramatic bold 16:9 landscape, high contrast, thumbnail style" },
  "Google Ads": { width: 1200, height: 628, style: "display ad banner, clean product-focused, professional horizontal" },
  Snapchat: { width: 1080, height: 1920, style: "vertical Snapchat ad, youthful fun vibrant, vertical portrait" },
  Reddit: { width: 1200, height: 628, style: "Reddit ad, authentic community-oriented photography, horizontal" },
  Amazon: { width: 1000, height: 1000, style: "product photography, clean white background, square product shot, professional e-commerce" },
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const { platform, headline, body, productSummary } = await req.json();

    const spec = PLATFORM_SPECS[platform] ?? PLATFORM_SPECS["Instagram"];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `Write a concise, vivid image generation prompt for a ${platform} advertisement.

Product: ${productSummary}
Ad headline: ${headline}
Ad body: ${body}
Platform style: ${spec.style}

Write ONLY the image prompt — no preamble, no explanation. The prompt should describe the visual scene, mood, lighting, colors, and composition. NO text in the image. Professional advertising photography quality. Max 80 words.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `AI error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const prompt = data.content?.[0]?.text?.trim() ?? "";

    const encoded = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${spec.width}&height=${spec.height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 9999)}`;

    return NextResponse.json({ imageUrl, prompt, width: spec.width, height: spec.height });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
