export interface NewsItem {
  date: string;
  source: string;
  tag: "模型" | "研究" | "安全" | "生态";
  title: string;
  summary: string;
  url: string;
}

export const news: NewsItem[] = [
  {
    date: "2026-11-24",
    source: "OpenAI",
    tag: "研究",
    title: "GPT-6 模型展现出内在的蛋白质设计能力",
    summary:
      "OpenAI 公布 GPT-6 系列在蛋白质设计任务上的实验结果，探索通用模型能否直接参与生物科学发现，而不只是做文献助手。",
    url: "https://openai.com/index/gpt-6-models-demonstrate-intrinsic-protein-design-capabilities",
  },
  {
    date: "2026-11-20",
    source: "OpenAI",
    tag: "安全",
    title: "如何防御对抗性蒸馏",
    summary:
      "OpenAI 介绍针对对抗性蒸馏的检测与防御措施，回应模型能力被未授权迁移的风险，并呼吁行业共享防护经验。",
    url: "https://openai.com/index/combatting-adversarial-distillation",
  },
  {
    date: "2026-11-18",
    source: "Google DeepMind",
    tag: "模型",
    title: "Gemini 4 Neon 发布",
    summary:
      "Google 新旗舰，强调复杂软件工程、知识工作与科学流程的端到端完成速度。AA 智能指数 61.5，定价 $3 / $15，智能体维度进入第一梯队。",
    url: "https://deepmind.google/blog/introducing-gemini-4-neon/",
  },
  {
    date: "2026-11-17",
    source: "OpenAI",
    tag: "模型",
    title: "GPT-6.2 Astra 与 GPT-6.2 Sol 发布",
    summary:
      "双模型策略：Astra 面向高难度专业工作与计算机操作，Sol 主攻日常工作与成本效率。AA 智能指数分别为 62.2 与 57.3，Sol 的单任务成本仅约 $1。",
    url: "https://openai.com/index/introducing-gpt-6-2-astra-sol",
  },
  {
    date: "2026-11-12",
    source: "Google DeepMind",
    tag: "模型",
    title: "Gemini 4 Hydrogen 发布",
    summary:
      "面向日常编码与智能体工作流的高效型号，已向全部 AI Studio 与 API 层级开放。输出速度 165 tok/s，定价 $1.5 / $7.5。",
    url: "https://deepmind.google/blog/introducing-gemini-4-hydrogen/",
  },
  {
    date: "2026-11-10",
    source: "Google DeepMind",
    tag: "模型",
    title: "Gemini 4 Carbon 全面开放",
    summary:
      "Google 称 Carbon 在网络安全与长周期智能体任务上达到前沿水平，现已向开发者、企业与消费者开放。AA 智能指数 60.1。",
    url: "https://deepmind.google/blog/gemini-4-carbon-is-now-available/",
  },
  {
    date: "2026-11-10",
    source: "Google DeepMind",
    tag: "研究",
    title: "AlphaProof Code 用 300 万行 Lean 证明验证 Signal 加密",
    summary:
      "AlphaProof Code 智能体生成约 300 万行 Lean 形式化证明，用于验证 Signal 核心加密实现，展示了形式化验证与代码智能体结合的可能性。",
    url: "https://deepmind.google/blog/introducing-alphaproof-code/",
  },
  {
    date: "2026-11-09",
    source: "Anthropic",
    tag: "模型",
    title: "Claude Fable 5.2 与 Claude Mythos 5.2 发布",
    summary:
      "Anthropic 升级旗舰，面向最困难的技术工作，称在编程、金融与科学上树立新标杆。AA 智能指数 64.8，目前排名第一。",
    url: "https://www.anthropic.com/claude-fable-and-mythos-5-2",
  },
  {
    date: "2026-10-29",
    source: "Mistral AI",
    tag: "模型",
    title: "Mistral Large 4 发布",
    summary:
      "Mistral 的新一代开源权重旗舰，低定价与欧洲部署是主要卖点。AA 智能指数 26.1，适合成本敏感或有数据驻留要求的场景。",
    url: "https://mistral.ai/news/mistral-large-4",
  },
  {
    date: "2026-10-23",
    source: "Kimi · 月之暗面",
    tag: "模型",
    title: "Kimi K3.1 Pro 发布",
    summary:
      "3T 级开源权重模型，原生 1M 上下文，主打编码、3D 建模与金融研究。AA 智能指数 46.6，为开源模型第一，智能体维度全榜最高。",
    url: "https://www.kimi.com/blog/kimi-k3-1-pro",
  },
  {
    date: "2026-10-17",
    source: "DeepSeek",
    tag: "模型",
    title: "DeepSeek V4.1 Flash 更新至 1017",
    summary:
      "DeepSeek 称新版显著提升项目开发能力，成本更低、速度更快，并新增网页搜索与抓取 API。输出速度 178 tok/s，定价 $0.3 / $1.2。",
    url: "https://www.deepseek.com/news/deepseek-v4-1-flash/",
  },
  {
    date: "2026-09-21",
    source: "xAI",
    tag: "模型",
    title: "Grok 4.7 发布",
    summary:
      "xAI 称其为最强编码与知识工作模型，速度翻倍、价格减半。AA 实测综合 35.4，知识维度相对突出，但深度推理与智能体明显落后。",
    url: "https://x.ai/news/grok-4-7",
  },
];