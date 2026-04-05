"use client";

import { useState } from "react";
import type { AnalysisResult, Platform, AdCopy } from "@/types";

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const PLATFORM_COLORS: Record<string, string> = {
  "Meta": "#1877F2",
  "Facebook": "#1877F2",
  "Instagram": "#E1306C",
  "TikTok": "#69C9D0",
  "Pinterest": "#E60023",
  "LinkedIn": "#0A66C2",
  "YouTube": "#FF0000",
  "Google": "#4285F4",
  "Google Ads": "#4285F4",
  "Twitter": "#1DA1F2",
  "X (Twitter)": "#1DA1F2",
  "X": "#e2e8f0",
  "Reddit": "#FF4500",
  "Snapchat": "#FFFC00",
  "Yelp": "#D32323",
  "Amazon": "#FF9900",
};

function getPlatformColor(name: string): string {
  for (const [key, color] of Object.entries(PLATFORM_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#6366f1";
}

function getScoreClass(score: number) {
  if (score >= 8) return { text: "score-high", bar: "score-bar-high", label: "Highly Recommended" };
  if (score >= 6) return { text: "score-mid", bar: "score-bar-mid", label: "Recommended" };
  return { text: "score-low", bar: "score-bar-low", label: "Optional" };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-1 rounded transition-colors"
      style={{
        backgroundColor: copied ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.1)",
        color: copied ? "#4ade80" : "#94a3b8",
        border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(148,163,184,0.2)"}`,
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  const [expanded, setExpanded] = useState(false);
  const score = getScoreClass(platform.score);
  const color = getPlatformColor(platform.name);

  return (
    <div className="card p-4 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44`, color }}
          >
            {platform.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-100 text-sm truncate">
              {platform.name}
            </h4>
            <p className="text-xs text-slate-500 capitalize">{platform.category.replace(/_/g, " ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-lg font-bold ${score.text}`}>
            {platform.score}
            <span className="text-xs text-slate-500">/10</span>
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{
              backgroundColor:
                platform.priority === "primary"
                  ? "rgba(99,102,241,0.15)"
                  : platform.priority === "secondary"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(100,116,139,0.15)",
              color:
                platform.priority === "primary"
                  ? "#a5b4fc"
                  : platform.priority === "secondary"
                  ? "#fcd34d"
                  : "#94a3b8",
            }}
          >
            {platform.priority}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-3 h-1.5 rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${score.bar}`}
          style={{ width: `${platform.score * 10}%` }}
        />
      </div>

      {/* Details */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div style={{ color: "#94a3b8" }}>
          <span className="text-slate-500">Format: </span>
          <span>{platform.best_format}</span>
        </div>
        <div style={{ color: "#94a3b8" }}>
          <span className="text-slate-500">CPM: </span>
          <span>{platform.cpm_estimate}</span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
      >
        {expanded ? "Less" : "Why this platform?"}
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 text-xs text-slate-400 leading-relaxed border-t border-slate-700 pt-2">
          <p>{platform.why}</p>
          <p className="mt-1.5 text-slate-500">
            <span className="text-slate-400">Audience: </span>
            {platform.audience_size}
          </p>
        </div>
      )}
    </div>
  );
}

function AdCopyCard({ copy }: { copy: AdCopy }) {
  const color = getPlatformColor(copy.platform);
  const fullCopy = `${copy.headline}\n\n${copy.body}\n\n${copy.cta}${copy.hashtags.length ? "\n\n" + copy.hashtags.join(" ") : ""}`;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44`, color }}
          >
            {copy.platform.slice(0, 2).toUpperCase()}
          </div>
          <h4 className="font-semibold text-slate-200 text-sm">{copy.platform}</h4>
        </div>
        <CopyButton text={fullCopy} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Headline</p>
          <p className="text-white font-semibold">{copy.headline}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Body Copy</p>
          <p className="text-slate-300 text-sm leading-relaxed">{copy.body}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Call to Action</p>
          <span
            className="inline-block text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {copy.cta}
          </span>
        </div>

        {copy.hashtags.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {copy.hashtags.map((tag) => (
                <span key={tag} className="tag text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-4 p-3 rounded-lg text-xs text-slate-400 leading-relaxed"
        style={{ backgroundColor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
      >
        <span className="text-indigo-400 font-medium">Why this works: </span>
        {copy.reasoning}
      </div>
    </div>
  );
}

const PLATFORM_OPTIONS = [
  "Instagram",
  "Instagram Story",
  "TikTok",
  "Facebook",
  "Pinterest",
  "LinkedIn",
  "Twitter/X",
  "YouTube",
  "Google Ads",
  "Snapchat",
  "Reddit",
  "Amazon",
];

function AdImageGenerator({
  ad_copies,
  productSummary,
}: {
  ad_copies: AdCopy[];
  productSummary: string;
}) {
  const defaultPlatform =
    ad_copies[0]?.platform && PLATFORM_OPTIONS.includes(ad_copies[0].platform)
      ? ad_copies[0].platform
      : PLATFORM_OPTIONS[0];

  const [platform, setPlatform] = useState(defaultPlatform);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCopy =
    ad_copies.find((c) => c.platform === platform) ?? ad_copies[0];

  const generate = async () => {
    setLoading(true);
    setImageUrl(null);
    setImageLoaded(false);
    setPrompt(null);
    setError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          headline: activeCopy?.headline ?? "",
          body: activeCopy?.body ?? "",
          productSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate image");
      setImageUrl(data.imageUrl);
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card p-5 mt-4"
      style={{ borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h4 className="font-semibold text-slate-200 text-sm">Ad Image Generator</h4>
        <span className="text-xs px-2 py-0.5 rounded-full text-indigo-300" style={{ backgroundColor: "rgba(99,102,241,0.15)" }}>
          AI-Powered
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1.5 block">Platform & Dimensions</label>
          <select
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setImageUrl(null); setImageLoaded(false); setError(null); }}
            className="w-full text-sm rounded-lg px-3 py-2 text-slate-200 appearance-none cursor-pointer"
            style={{ backgroundColor: "#1e293b", border: "1px solid #334155", outline: "none" }}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: loading ? "#94a3b8" : "white",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {loading && !imageUrl && (
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-2 py-10"
          style={{ backgroundColor: "rgba(15,23,42,0.5)", border: "1px dashed #334155" }}
        >
          <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-slate-500">Crafting prompt & generating image…</p>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
            {!imageLoaded && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: "rgba(15,23,42,0.8)" }}
              >
                <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-xs text-slate-500">Rendering image (20–40s)…</p>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${platform} ad image`}
              className="w-full object-cover"
              style={{ maxHeight: "480px", display: imageLoaded ? "block" : "block", opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {imageLoaded && (
            <div className="flex items-center justify-between gap-3">
              {prompt && (
                <p className="text-xs text-slate-500 leading-relaxed flex-1 line-clamp-2">
                  <span className="text-slate-400">Prompt: </span>{prompt}
                </p>
              )}
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Open / Save
              </a>
            </div>
          )}
        </div>
      )}

      {!imageUrl && !loading && !error && (
        <p className="text-xs text-slate-600 text-center py-6">
          Select a platform and click Generate to create an AI ad image optimized for that format.
        </p>
      )}
    </div>
  );
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<"platforms" | "ad_copy" | "sources">("platforms");

  const primaryPlatforms = result.platforms
    .filter((p) => p.priority === "primary")
    .sort((a, b) => b.score - a.score);
  const otherPlatforms = result.platforms
    .filter((p) => p.priority !== "primary")
    .sort((a, b) => b.score - a.score);

  const { demographics: d } = result;

  const tabs = [
    { id: "platforms" as const, label: "Platforms", count: result.platforms.length },
    { id: "ad_copy" as const, label: "Ad Copy", count: result.ad_copies.length },
    { id: "sources" as const, label: "Data Sources", count: result.data_sources.length },
  ];

  return (
    <div className="space-y-6">
      {/* Product Summary */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Product Summary
          </h3>
        </div>
        <p className="text-slate-200 leading-relaxed">{result.product_summary}</p>
      </div>

      {/* Demographics */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Ideal Consumer Demographics
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Age Range", value: d.age_range },
            { label: "Primary Age", value: d.primary_age },
            { label: "Income Level", value: d.income_level },
            { label: "Education", value: d.education_level },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-3 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid #334155" }}
            >
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-200">{value}</p>
            </div>
          ))}
        </div>

        {/* Gender breakdown */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Gender Distribution</p>
          <div className="flex gap-1 h-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 flex items-center justify-center"
              style={{ width: `${d.gender.male_percent}%` }}
              title={`Male: ${d.gender.male_percent}%`}
            />
            <div
              className="h-full bg-pink-500 flex items-center justify-center"
              style={{ width: `${d.gender.female_percent}%` }}
              title={`Female: ${d.gender.female_percent}%`}
            />
            {d.gender.nonbinary_percent > 0 && (
              <div
                className="h-full bg-purple-500"
                style={{ width: `${d.gender.nonbinary_percent}%` }}
                title={`Non-binary: ${d.gender.nonbinary_percent}%`}
              />
            )}
          </div>
          <div className="flex gap-4 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Male {d.gender.male_percent}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
              Female {d.gender.female_percent}%
            </span>
            {d.gender.nonbinary_percent > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Non-binary {d.gender.nonbinary_percent}%
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">Top Locations</p>
            <div className="flex flex-wrap gap-1.5">
              {d.locations.map((loc) => (
                <span key={loc} className="tag">{loc}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Interests & Hobbies</p>
            <div className="flex flex-wrap gap-1.5">
              {d.interests.map((interest) => (
                <span key={interest} className="tag">{interest}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Purchase Behaviors</p>
            <div className="flex flex-wrap gap-1.5">
              {d.behaviors.map((b) => (
                <span key={b} className="tag">{b}</span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-4 p-3 rounded-lg text-sm text-slate-400 leading-relaxed"
          style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}
        >
          <span className="text-green-400 font-medium">Demographic Reasoning: </span>
          {d.reasoning}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div
          className="flex gap-1 p-1 rounded-xl mb-4"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: "#334155",
                      color: "#f1f5f9",
                    }
                  : { color: "#64748b" }
              }
            >
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? "rgba(99,102,241,0.3)"
                      : "rgba(100,116,139,0.2)",
                  color: activeTab === tab.id ? "#a5b4fc" : "#64748b",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Platforms Tab */}
        {activeTab === "platforms" && (
          <div className="space-y-4">
            {primaryPlatforms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">
                  Primary Channels
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {primaryPlatforms.map((p) => (
                    <PlatformCard key={p.name} platform={p} />
                  ))}
                </div>
              </div>
            )}

            {otherPlatforms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Secondary & Optional Channels
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {otherPlatforms.map((p) => (
                    <PlatformCard key={p.name} platform={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Copy Tab */}
        {activeTab === "ad_copy" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {result.ad_copies.map((copy, i) => (
                <AdCopyCard key={i} copy={copy} />
              ))}
            </div>
            <AdImageGenerator
              ad_copies={result.ad_copies}
              productSummary={result.product_summary}
            />
          </div>
        )}

        {/* Data Sources Tab */}
        {activeTab === "sources" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">
              The following authoritative data sources were used to generate this analysis:
            </p>
            {result.data_sources.map((source, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-200 text-sm">
                        {source.name}
                      </h4>
                      <span className="tag text-xs">{source.data_type}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {source.description}
                    </p>
                  </div>
                  {source.url && source.url.startsWith("http") && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      Visit
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div
              className="p-4 rounded-xl text-sm text-slate-400 leading-relaxed"
              style={{ backgroundColor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <span className="text-amber-400 font-medium">Note: </span>
              Platform demographic data reflects publicly available research from these sources. For live, real-time audience sizing and CPM data, use each platform&apos;s native ad manager (Meta Ads Manager, LinkedIn Campaign Manager, etc.) before launching campaigns.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
