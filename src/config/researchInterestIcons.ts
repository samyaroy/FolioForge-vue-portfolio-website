/**
 * The icon each research interest is drawn with.
 *
 * Values are MDI glyph names, or `anim:<name>` for one of the animated icons in
 * `@/components/ui/AnimatedIcon.vue`. This lived inside the Vue component, which
 * left the admin unable to say which icon an interest would get — or that it
 * would fall back for want of an entry here.
 */
export const RESEARCH_INTEREST_FALLBACK_ICON = 'mdi-help-circle-outline'

export const researchInterestIcons: Record<string, string> = {
  // 🤖 AI & ML
  Artificial_Intelligence: "mdi-robot-industrial",
  Machine_Learning: "anim:brain-circuit",
  Deep_Learning: "mdi-brain",
  Neural_Networks: "mdi-brain",
  Reinforcement_Learning: "mdi-robot",

  // 🧠 Data Science
  Natural_Language_Processing: "mdi-text-box-multiple",
  Computer_Vision: "mdi-image-search",
  Time_Series_Analysis: "mdi-chart-line",
  Statistical_Modeling: "anim:chart-bar",
  Bayesian_Statistics: "anim:chart-bar",
  Hypothesis_Testing: "mdi-check-circle",
  Nonparametric_Inference: "anim:chart-spline",

  Data_Science: "mdi-database",
  Data_Visualization: "mdi-chart-pie",
  Data_Analysis: "mdi-chart-areaspline",
  Predictive_Analytics: "mdi-chart-line",
  Big_Data_Analytics: "mdi-database",
  Data_Mining: "mdi-database-search",
  Data_Cleaning: "mdi-broom",
  Data_Wrangling: "mdi-database-edit",
  Data_Engineering: "anim:database-zap",

  // 🌐 Web & Systems
  Web_Development: "mdi-web",
  API_Development: "mdi-api",
  Cloud_Computing: "mdi-cloud",

  // ⚙️ DevOps & Pipelines
  DevOps: "mdi-cog-sync",
  MLOps: "mdi-robot-outline",
  DataOps: "mdi-database-sync",
  CI_CD_Pipeline: "mdi-source-merge",
  Containerization: "mdi-docker",
  Microservices: "mdi-cube-outline",
  Cloud_Native: "mdi-cloud-tags",

  // 🔐 Security & Emerging Tech
  Cybersecurity: "mdi-shield-lock",
  Blockchain: "mdi-blockchain",
  Internet_of_Things: "mdi-access-point-network",
  Quantum_Computing: "mdi-atom",
  Augmented_Reality_Virtual_Reality: "mdi-eye-off-outline",
  Edge_Computing: "mdi-access-point",

  // 🧬 Science & Interdisciplinary
  Bioinformatics: "mdi-dna",

  // 💰 Finance & Economics
  Financial_Modeling: "mdi-finance",
  Portfolio_Optimization: "mdi-briefcase-chart",
  Risk_Management: "mdi-shield-percent",
  Econometrics: "mdi-chart-bell-curve",
  Quantitative_Finance: "mdi-chart-multiple",
  Algorithmic_Trading: "mdi-swap-horizontal",
  Behavioral_Finance: "mdi-brain",
  Public_Finance: "mdi-bank",
  Corporate_Finance: "mdi-domain",
  Personal_Finance: "mdi-cash-multiple",
  Investment_Analysis: "mdi-chart-line-variant",
  Derivatives: "mdi-swap-vertical",
  Financial_Econometrics: "mdi-function-variant"
} 

/** The glyph an interest resolves to, falling back when the key is unmapped. */
export function researchInterestIcon(key: string): string {
  return researchInterestIcons[key] ?? RESEARCH_INTEREST_FALLBACK_ICON
}

/** Whether the icon is one of the animated ones rather than a plain glyph. */
export function isAnimatedIcon(icon: string): boolean {
  return icon.startsWith('anim:')
}

/** How the site turns a key into a label. */
export function researchInterestName(key: string): string {
  return key.replace(/_/g, ' ')
}
