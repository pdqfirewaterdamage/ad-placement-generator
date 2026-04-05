export interface GenderBreakdown {
  male_percent: number;
  female_percent: number;
  nonbinary_percent: number;
}

export interface Demographics {
  age_range: string;
  primary_age: string;
  gender: GenderBreakdown;
  locations: string[];
  interests: string[];
  behaviors: string[];
  income_level: string;
  education_level: string;
  reasoning: string;
}

export interface Platform {
  name: string;
  score: number;
  category: string;
  why: string;
  best_format: string;
  audience_size: string;
  cpm_estimate: string;
  priority: "primary" | "secondary" | "optional";
}

export interface AdCopy {
  platform: string;
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
  reasoning: string;
}

export interface DataSource {
  name: string;
  description: string;
  url: string;
  data_type: string;
}

export interface AnalysisResult {
  product_summary: string;
  demographics: Demographics;
  platforms: Platform[];
  ad_copies: AdCopy[];
  data_sources: DataSource[];
}

export interface AnalysisError {
  error: string;
}
