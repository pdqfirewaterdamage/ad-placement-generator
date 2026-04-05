"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import type { AnalysisResult } from "@/types";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5">
          <div className="shimmer h-4 w-1/3 rounded mb-3" />
          <div className="shimmer h-3 w-full rounded mb-2" />
          <div className="shimmer h-3 w-4/5 rounded mb-2" />
          <div className="shimmer h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (description: string, images: File[]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("description", description);
      for (const img of images) {
        formData.append("images", img);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        return;
      }

      setResult(data as AnalysisResult);

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a1035 50%, #0f172a 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(15,23,42,0.8)", borderBottom: "1px solid #1e293b" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
            >
              A
            </div>
            <span className="font-semibold text-slate-100">AdGen</span>
            <span className="hidden sm:block text-xs px-2 py-0.5 rounded-full text-indigo-300" style={{ backgroundColor: "rgba(99,102,241,0.15)" }}>
              AI-Powered
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500">
            Demographic & Ad Placement Generator
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        {!result && !isLoading && (
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Powered by Claude AI + Consumer Research Data
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Find Your Ideal{" "}
              <span style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Audience
              </span>{" "}
              &{" "}
              <span style={{ background: "linear-gradient(135deg, #34d399, #059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Ad Strategy
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Upload your product description (and optional images). Get AI-powered demographic targeting,
              platform recommendations backed by Pew Research, Statista & eMarketer data, and ready-to-use ad copy.
            </p>

            {/* Data sources badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["Pew Research", "Statista", "eMarketer", "Nielsen", "Sprout Social", "DataReportal"].map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full text-slate-400"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid #334155" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={`grid gap-8 ${result ? "lg:grid-cols-5" : "max-w-2xl mx-auto"}`}>
          {/* Form panel */}
          <div className={result ? "lg:col-span-2" : ""}>
            <div
              className={`card p-6 ${result ? "lg:sticky lg:top-20" : ""}`}
              style={{ maxHeight: result ? "calc(100vh - 6rem)" : undefined, overflowY: result ? "auto" : undefined }}
            >
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="font-semibold text-slate-200">
                  {result ? "Analyze Another Product" : "Product Details"}
                </h2>
              </div>
              <UploadForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Results panel */}
          {(isLoading || result || error) && (
            <div id="results" className={result ? "lg:col-span-3" : ""}>
              {isLoading && (
                <div className="space-y-4">
                  <div
                    className="card p-4 flex items-center gap-3"
                    style={{ borderColor: "rgba(99,102,241,0.4)", backgroundColor: "rgba(99,102,241,0.05)" }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(99,102,241,0.15)" }}>
                      <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-300">Analyzing your product...</p>
                      <p className="text-xs text-slate-500">
                        Claude AI is researching demographics, platform data, and crafting your ad strategy. This usually takes 20–40 seconds.
                      </p>
                    </div>
                  </div>
                  <LoadingSkeleton />
                </div>
              )}

              {error && (
                <div
                  className="card p-5"
                  style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.05)" }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-400">Analysis Failed</p>
                      <p className="text-xs text-slate-400 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && <ResultsDisplay result={result} />}
            </div>
          )}
        </div>

        {/* Features grid — shown only on homepage */}
        {!result && !isLoading && (
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: "👥",
                title: "Precise Demographics",
                desc: "Age, gender, location, income, interests, and purchase behaviors — all grounded in real consumer research data.",
              },
              {
                icon: "📱",
                title: "Platform Intelligence",
                desc: "Scored recommendations for Meta, Instagram, TikTok, LinkedIn, Pinterest, Yelp, YouTube, Google, Reddit & more.",
              },
              {
                icon: "✍️",
                title: "Ready-to-Use Ad Copy",
                desc: "Platform-native headlines, body copy, CTAs, and hashtags tailored to your exact demographic. Copy with one click.",
              },
            ].map((f) => (
              <div key={f.title} className="card p-5 text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 text-center text-xs text-slate-600" style={{ borderTop: "1px solid #1e293b" }}>
        <p>Ad Placement Generator &bull; Powered by Claude AI &bull; Demographics sourced from Pew Research, Statista & eMarketer</p>
      </footer>
    </div>
  );
}
