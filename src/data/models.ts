export type DimensionKey =
  | "reasoning"
  | "knowledge"
  | "coding"
  | "agentic"
  | "longContext"
  | "science"
  | "office";

export type Scores = Record<DimensionKey, number>;

export interface Model {
  slug: string;
  name: string;
  vendor: string;
  vendorSlug: string;
  releaseDate: string;
  openWeights: boolean;
  /** Artificial Analysis Intelligence Index v5.0.2, 0–100 */
  intelligence: number;
  /** USD per 1M input tokens */
  priceInput: number;
  /** USD per 1M output tokens */
  priceOutput: number;
  /** context window in thousands of tokens */
  contextK: number;
  /** output tokens per second */
  speed: number;
  /** USD per Intelligence Index task */
  costPerTask: number;
  scores: Scores;
  /** the exact AA variant measured (highest reasoning tier) */
  variant: string;
  tagline: string;
  summary: string;
  officialUrl: string | null;
  aaUrl: string;
}

export interface Dimension {
  key: DimensionKey;
  label: string;
  short: string;
  benchmark: string;
  description: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    key: "reasoning",
    label: "深度推理",
    short: "推理",
    benchmark: "HLE-Diamond",
    description: "跨学科专家级难题，衡量模型在高难度推理上的上限。",
  },
  {
    key: "knowledge",
    label: "知识准确",
    short: "知识",
    benchmark: "AA-Omniscience v1.1",
    description: "事实性知识问答的准确率，分数越高，知识型任务的幻觉越少。",
  },
  {
    key: "coding",
    label: "编程",
    short: "编程",
    benchmark: "FrontierCode-AA 2.0",
    description: "真实代码库中的缺陷修复与功能实现任务通过率。",
  },
  {
    key: "agentic",
    label: "智能体",
    short: "智能体",
    benchmark: "Terminal-Bench 4.1",
    description: "在终端环境中自主完成多步真实任务的通过率。",
  },
  {
    key: "longContext",
    label: "长文推理",
    short: "长文",
    benchmark: "MLCR-AA（医学长上下文）",
    description: "医学文献长上下文中的多跳检索与推理，检验长窗口的真实利用率。",
  },
  {
    key: "science",
    label: "科学推理",
    short: "科学",
    benchmark: "FrontierPhysics",
    description: "前沿物理问题的专家级推理，强调科学建模与计算能力。",
  },
  {
    key: "office",
    label: "文档任务",
    short: "文档",
    benchmark: "GDP.pdf",
    description: "PDF 文档理解与专业交付物生成，贴近真实办公场景。",
  },
];

export const VENDOR_COLORS: Record<string, string> = {
  Anthropic: "#E8926F",
  OpenAI: "#4ADE80",
  Google: "#6EA8FE",
  Meta: "#4C7DFF",
  Kimi: "#C084FC",
  Alibaba: "#A78BFA",
  SpaceXAI: "#D4D4D8",
  DeepSeek: "#8B9DFF",
  "Z AI": "#2DD4BF",
  Mistral: "#FB923C",
};

export const VENDOR_LABELS: Record<string, string> = {
  Anthropic: "Anthropic",
  OpenAI: "OpenAI",
  Google: "Google",
  Meta: "Meta",
  Kimi: "Kimi · 月之暗面",
  Alibaba: "阿里云 · 通义",
  SpaceXAI: "SpaceXAI",
  DeepSeek: "DeepSeek · 深度求索",
  "Z AI": "Z AI · 智谱",
  Mistral: "Mistral AI",
};

export const CATALOG_DATE = "2026-11-26";
export const INTELLIGENCE_VERSION = "Intelligence Index v5.0.2";

const aa = (slug: string) => `https://artificialanalysis.ai/models/${slug}`;

export const models: Model[] = [
  {
    slug: "claude-fable-5-2",
    name: "Claude Fable 5.2",
    vendor: "Anthropic",
    vendorSlug: "anthropic",
    releaseDate: "2026-11-09",
    openWeights: false,
    intelligence: 64.8,
    priceInput: 8,
    priceOutput: 40,
    contextK: 1000,
    speed: 112,
    costPerTask: 26.54,
    scores: {
      reasoning: 80.2,
      knowledge: 79.1,
      coding: 48.8,
      agentic: 61.6,
      longContext: 43.9,
      science: 32.9,
      office: 24.2,
    },
    variant: "Claude Fable 5.2 (max)",
    tagline: "综合能力天花板",
    summary:
      "Anthropic 的旗舰推理模型，面向高难度技术任务。它在推理、知识、编程、长文与科学五个维度同时领先，是当前能力上限；代价是每百万 tokens $8 / $40 的定价与全榜最高的单任务成本。",
    officialUrl: "https://www.anthropic.com/claude-fable-and-mythos-5-2",
    aaUrl: aa("claude-fable-5-2"),
  },
  {
    slug: "gpt-6-2-astra",
    name: "GPT-6.2 Astra",
    vendor: "OpenAI",
    vendorSlug: "openai",
    releaseDate: "2026-11-17",
    openWeights: false,
    intelligence: 62.2,
    priceInput: 8,
    priceOutput: 40,
    contextK: 1000,
    speed: 45,
    costPerTask: 4.0,
    scores: {
      reasoning: 72.2,
      knowledge: 68.6,
      coding: 45.4,
      agentic: 64.6,
      longContext: 39.4,
      science: 26.3,
      office: 29.8,
    },
    variant: "GPT-6.2 Astra (max)",
    tagline: "旗舰双雄 · 专业输出",
    summary:
      "OpenAI 的旗舰型号，强调专业交付物、计算机操作与编码能力。综合智能 62.2 紧随 Fable 5.2，智能体与文档任务表现突出，而单任务成本约 $4，不到榜首的六分之一。",
    officialUrl: "https://openai.com/index/introducing-gpt-6-2-astra-sol",
    aaUrl: aa("gpt-6-2-astra"),
  },
  {
    slug: "gemini-4-neon",
    name: "Gemini 4 Neon",
    vendor: "Google",
    vendorSlug: "google",
    releaseDate: "2026-11-18",
    openWeights: false,
    intelligence: 61.5,
    priceInput: 3,
    priceOutput: 15,
    contextK: 1000,
    speed: 84,
    costPerTask: 6.44,
    scores: {
      reasoning: 71.3,
      knowledge: 60.5,
      coding: 44.4,
      agentic: 65.2,
      longContext: 31.7,
      science: 24.6,
      office: 28.0,
    },
    variant: "Gemini 4 Neon (xhigh)",
    tagline: "前沿新旗舰",
    summary:
      "Google 最新的前沿模型，主打复杂软件工程、知识工作与科学流程的端到端完成速度。综合 61.5，智能体维度 65.2 处于第一梯队，$3 / $15 的定价让它成为头部模型中较均衡的选择。",
    officialUrl: "https://deepmind.google/blog/introducing-gemini-4-neon/",
    aaUrl: aa("gemini-4-neon"),
  },
  {
    slug: "gemini-4-carbon",
    name: "Gemini 4 Carbon",
    vendor: "Google",
    vendorSlug: "google",
    releaseDate: "2026-10-28",
    openWeights: false,
    intelligence: 60.1,
    priceInput: 4,
    priceOutput: 20,
    contextK: 1000,
    speed: 49,
    costPerTask: 7.76,
    scores: {
      reasoning: 69.1,
      knowledge: 58.3,
      coding: 40.6,
      agentic: 66.2,
      longContext: 19.4,
      science: 12.7,
      office: 28.4,
    },
    variant: "Gemini 4 Carbon (high)",
    tagline: "长周期智能体",
    summary:
      "Google 上一代前沿型号，官方强调网络安全能力与长周期智能体工作流。综合 60.1，智能体 66.2 依然出色，但长文推理与科学维度已明显落后于 Neon。",
    officialUrl: "https://deepmind.google/blog/gemini-4-carbon-is-now-available/",
    aaUrl: aa("gemini-4-carbon"),
  },
  {
    slug: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    vendor: "Anthropic",
    vendorSlug: "anthropic",
    releaseDate: "2026-09-22",
    openWeights: false,
    intelligence: 59.1,
    priceInput: 4,
    priceOutput: 20,
    contextK: 1000,
    speed: 116,
    costPerTask: 10.04,
    scores: {
      reasoning: 67.9,
      knowledge: 65.5,
      coding: 46.9,
      agentic: 59.1,
      longContext: 27.8,
      science: 23.9,
      office: 26.2,
    },
    variant: "Claude Opus 5.5 (max)",
    tagline: "高性价比旗舰",
    summary:
      "Claude 5.5 家族的首款模型。官方称它在多数任务上达到 Fable 5.1 的水平，运行成本比 Opus 5 低 40%。综合 59.1，编程 46.9 依旧强势，适合作为高频使用的旗舰。",
    officialUrl: "https://www.anthropic.com/claude-opus-5-5",
    aaUrl: aa("claude-opus-5-5"),
  },
  {
    slug: "gpt-6-2-sol",
    name: "GPT-6.2 Sol",
    vendor: "OpenAI",
    vendorSlug: "openai",
    releaseDate: "2026-11-17",
    openWeights: false,
    intelligence: 57.3,
    priceInput: 2,
    priceOutput: 10,
    contextK: 1000,
    speed: 64,
    costPerTask: 1.01,
    scores: {
      reasoning: 64.0,
      knowledge: 61.6,
      coding: 44.4,
      agentic: 60.1,
      longContext: 37.2,
      science: 21.8,
      office: 30.0,
    },
    variant: "GPT-6.2 Sol (max)",
    tagline: "性价比之王",
    summary:
      "OpenAI 的日常主力模型，面向日常工作、代码风格与成本效率。$2 / $10 的定价下综合 57.3，单任务成本约 $1，是头部模型中性价比最突出的选择。",
    officialUrl: "https://openai.com/index/introducing-gpt-6-2-astra-sol",
    aaUrl: aa("gpt-6-2-sol"),
  },
  {
    slug: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    vendor: "Anthropic",
    vendorSlug: "anthropic",
    releaseDate: "2026-09-28",
    openWeights: false,
    intelligence: 54.7,
    priceInput: 2,
    priceOutput: 10,
    contextK: 1000,
    speed: 152,
    costPerTask: 10.02,
    scores: {
      reasoning: 53.3,
      knowledge: 51.5,
      coding: 41.9,
      agentic: 65.2,
      longContext: 41.7,
      science: 23.4,
      office: 25.8,
    },
    variant: "Claude Sonnet 5.5 (max)",
    tagline: "智能体中坚",
    summary:
      "Anthropic 的中端主力，速度 152 tok/s，智能体维度 65.2 与 Gemini 4 Neon 并列前排。适合大规模智能体与长文任务部署，但知识与科学维度明显弱于同门 Opus。",
    officialUrl: "https://www.anthropic.com/claude-sonnet-5-5",
    aaUrl: aa("claude-sonnet-5-5"),
  },
  {
    slug: "gemini-4-hydrogen",
    name: "Gemini 4 Hydrogen",
    vendor: "Google",
    vendorSlug: "google",
    releaseDate: "2026-11-12",
    openWeights: false,
    intelligence: 54.1,
    priceInput: 1.5,
    priceOutput: 7.5,
    contextK: 1000,
    speed: 165,
    costPerTask: 3.16,
    scores: {
      reasoning: 58.8,
      knowledge: 50.5,
      coding: 39.0,
      agentic: 55.1,
      longContext: 21.1,
      science: 14.8,
      office: 27.6,
    },
    variant: "Gemini 4 Hydrogen (xhigh)",
    tagline: "高效日常",
    summary:
      "面向日常编码与智能体工作流的高效型号，$1.5 / $7.5 的定价与 165 tok/s 的速度适合高频调用。综合 54.1，是 Gemini 4 家族中速度与成本最平衡的一档。",
    officialUrl: "https://deepmind.google/blog/introducing-gemini-4-hydrogen/",
    aaUrl: aa("gemini-4-hydrogen"),
  },
  {
    slug: "gpt-6-1-terra",
    name: "GPT-6.1 Terra",
    vendor: "OpenAI",
    vendorSlug: "openai",
    releaseDate: "2026-10-26",
    openWeights: false,
    intelligence: 51.4,
    priceInput: 1,
    priceOutput: 5,
    contextK: 1000,
    speed: 67,
    costPerTask: 0.96,
    scores: {
      reasoning: 47.3,
      knowledge: 47.6,
      coding: 42.1,
      agentic: 56.6,
      longContext: 30.6,
      science: 15.1,
      office: 28.6,
    },
    variant: "GPT-6.1 Terra (max)",
    tagline: "低价全能",
    summary:
      "OpenAI 面向视觉理解与计算机操作的快速型号，$1 / $5 的定价极具攻击性。综合 51.4、单任务成本约 $0.96，是低价位段少见的闭源全能型选手。",
    officialUrl: "https://openai.com/index/introducing-gpt-6-1-terra",
    aaUrl: aa("gpt-6-1-terra"),
  },
  {
    slug: "kimi-k3-1-pro",
    name: "Kimi K3.1 Pro",
    vendor: "Kimi",
    vendorSlug: "kimi",
    releaseDate: "2026-10-23",
    openWeights: true,
    intelligence: 46.6,
    priceInput: 2,
    priceOutput: 10,
    contextK: 1000,
    speed: 36,
    costPerTask: 3.68,
    scores: {
      reasoning: 37.3,
      knowledge: 48.9,
      coding: 25.5,
      agentic: 68.2,
      longContext: 38.3,
      science: 5.0,
      office: 31.4,
    },
    variant: "Kimi K3.1 Pro",
    tagline: "开源第一",
    summary:
      "月之暗面的 3T 级开源权重模型，原生 1M 上下文。综合 46.6 位列开源第一，智能体 68.2 更是全榜最高，文档任务同样领先；科学推理与输出速度是它的短板。",
    officialUrl: "https://www.kimi.com/blog/kimi-k3-1-pro",
    aaUrl: aa("kimi-k3-1-pro"),
  },
  {
    slug: "muse-wonder",
    name: "Muse Wonder",
    vendor: "Meta",
    vendorSlug: "meta",
    releaseDate: "2026-10-12",
    openWeights: false,
    intelligence: 43.7,
    priceInput: 4,
    priceOutput: 20,
    contextK: 1049,
    speed: 91,
    costPerTask: 6.95,
    scores: {
      reasoning: 39.0,
      knowledge: 38.0,
      coding: 27.9,
      agentic: 53.5,
      longContext: 22.2,
      science: 10.3,
      office: 30.6,
    },
    variant: "Muse Wonder (max)",
    tagline: "Meta 旗舰",
    summary:
      "Meta Muse 系列中已评测的旗舰型号，拥有 1,049K 的更宽上下文。综合 43.7，文档与智能体表现尚可，但在同价位上面临 Gemini 与 GPT 的强力竞争。",
    officialUrl: null,
    aaUrl: aa("muse-wonder"),
  },
  {
    slug: "qwen4-max",
    name: "Qwen4 Max",
    vendor: "Alibaba",
    vendorSlug: "alibaba",
    releaseDate: "2026-11-16",
    openWeights: false,
    intelligence: 42.8,
    priceInput: 1.5,
    priceOutput: 4.5,
    contextK: 984,
    speed: 108,
    costPerTask: 3.27,
    scores: {
      reasoning: 44.9,
      knowledge: 43.7,
      coding: 26.5,
      agentic: 47.5,
      longContext: 19.4,
      science: 2.5,
      office: 26.2,
    },
    variant: "Qwen4 Max",
    tagline: "中文性价比",
    summary:
      "阿里通义的旗舰闭源型号，$1.5 / $4.5 的定价与 108 tok/s 的速度适合中文与低成本场景。综合 42.8，推理与知识维度在第二梯队中表现扎实。",
    officialUrl: null,
    aaUrl: aa("qwen4-max"),
  },
  {
    slug: "grok-4-7",
    name: "Grok 4.7",
    vendor: "SpaceXAI",
    vendorSlug: "spacexai",
    releaseDate: "2026-09-21",
    openWeights: false,
    intelligence: 35.4,
    priceInput: 2,
    priceOutput: 6,
    contextK: 500,
    speed: 77,
    costPerTask: 7.77,
    scores: {
      reasoning: 23.2,
      knowledge: 42.7,
      coding: 28.9,
      agentic: 24.2,
      longContext: 20.0,
      science: 5.7,
      office: 20.0,
    },
    variant: "Grok 4.7 (xhigh)",
    tagline: "编码与知识工作",
    summary:
      "xAI 称其为最强编码与知识工作模型，速度翻倍、价格减半。AA 实测综合 35.4，知识维度相对突出，但深度推理与智能体得分明显落后于主流旗舰。",
    officialUrl: "https://x.ai/news/grok-4-7",
    aaUrl: aa("grok-4-7"),
  },
  {
    slug: "deepseek-v4-1-flash-1017",
    name: "DeepSeek V4.1 Flash 1017",
    vendor: "DeepSeek",
    vendorSlug: "deepseek",
    releaseDate: "2026-10-17",
    openWeights: true,
    intelligence: 32.4,
    priceInput: 0.3,
    priceOutput: 1.2,
    contextK: 1000,
    speed: 178,
    costPerTask: 0.6,
    scores: {
      reasoning: 25.3,
      knowledge: 39.6,
      coding: 28.2,
      agentic: 32.3,
      longContext: 26.7,
      science: 1.1,
      office: 17.2,
    },
    variant: "DeepSeek V4.1 Flash 1017 (max)",
    tagline: "极致成本",
    summary:
      "DeepSeek 的轻量高效模型，$0.3 / $1.2 的价格与 178 tok/s 的速度均处于全场最低/最快一档。综合 32.4，适合成本敏感的高吞吐任务，不适合作为高难度推理主力。",
    officialUrl: "https://www.deepseek.com/news/deepseek-v4-1-flash/",
    aaUrl: aa("deepseek-v4-1-flash-1017"),
  },
  {
    slug: "glm-5-3",
    name: "GLM-5.3",
    vendor: "Z AI",
    vendorSlug: "z-ai",
    releaseDate: "2026-08-18",
    openWeights: true,
    intelligence: 31.6,
    priceInput: 1.4,
    priceOutput: 4.4,
    contextK: 1000,
    speed: 73,
    costPerTask: 5.01,
    scores: {
      reasoning: 17.9,
      knowledge: 32.3,
      coding: 21.6,
      agentic: 40.9,
      longContext: 17.2,
      science: 2.0,
      office: 11.2,
    },
    variant: "GLM-5.3 (max)",
    tagline: "开源中坚",
    summary:
      "智谱的开源权重型号，智能体 40.9 在开源阵营中尚可。综合 31.6，知识与深度推理偏低，但 1M 上下文和较低门槛让它适合作为自部署的通用底座。",
    officialUrl: null,
    aaUrl: aa("glm-5-3"),
  },
  {
    slug: "mistral-large-4",
    name: "Mistral Large 4",
    vendor: "Mistral",
    vendorSlug: "mistral",
    releaseDate: "2026-10-29",
    openWeights: true,
    intelligence: 26.1,
    priceInput: 0.7,
    priceOutput: 2.1,
    contextK: 1000,
    speed: 78,
    costPerTask: 2.06,
    scores: {
      reasoning: 17.3,
      knowledge: 26.0,
      coding: 15.0,
      agentic: 24.7,
      longContext: 17.8,
      science: 2.0,
      office: 17.6,
    },
    variant: "Mistral Large 4 (high)",
    tagline: "欧洲开源",
    summary:
      "Mistral 的开源权重旗舰，$0.7 / $2.1 的低定价与欧洲部署是主要卖点。综合 26.1，各项能力处于追赶位置，适合成本敏感或有数据驻留要求的场景。",
    officialUrl: "https://mistral.ai/news/mistral-large-4",
    aaUrl: aa("mistral-large-4"),
  },
];

export const vendorColor = (vendor: string): string => VENDOR_COLORS[vendor] ?? "#9CA3AF";

export const getModel = (slug: string): Model | undefined =>
  models.find((model) => model.slug === slug);

export const modelRank = (slug: string): number =>
  models.findIndex((model) => model.slug === slug) + 1;

export const dimensionLeader = (key: DimensionKey): Model =>
  [...models].sort((a, b) => b.scores[key] - a.scores[key])[0];

export const modelAverage = (model: Model): number =>
  DIMENSIONS.reduce((sum, dimension) => sum + model.scores[dimension.key], 0) /
  DIMENSIONS.length;

export const topModels = (count: number): Model[] => models.slice(0, count);

export const formatPrice = (model: Model): string =>
  `$${model.priceInput} / $${model.priceOutput}`;

export const formatContext = (contextK: number): string =>
  `${(contextK / 1000).toFixed(1).replace(/\.0$/, "")}M`;

export const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-");
  return `${year}.${month}.${day}`;
};