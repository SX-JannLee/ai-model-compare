import { models, vendorColor, type Model } from "@/data/models";

const WIDTH = 780;
const HEIGHT = 440;
const M = { top: 30, right: 38, bottom: 56, left: 56 };
const PLOT_W = WIDTH - M.left - M.right;
const PLOT_H = HEIGHT - M.top - M.bottom;
const X_MIN = 1;
const X_MAX = 40;
const Y_MIN = 20;
const Y_MAX = 70;

const xScale = (value: number) =>
  M.left +
  ((Math.log10(value) - Math.log10(X_MIN)) /
    (Math.log10(X_MAX) - Math.log10(X_MIN))) *
    PLOT_W;

const yScale = (value: number) =>
  M.top + PLOT_H - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

const xTicks = [1, 2, 5, 10, 20, 40];
const yTicks = [20, 30, 40, 50, 60, 70];
const LABELED = new Set([
  "claude-fable-5-2",
  "gemini-4-neon",
  "gpt-6-2-sol",
  "gpt-6-1-terra",
  "deepseek-v4-1-flash-1017",
  "kimi-k3-1-pro",
]);

const shortName = (model: Model): string =>
  model.name
    .replace("Claude ", "")
    .replace("GPT-", "GPT ")
    .replace("Gemini ", "Gemini ")
    .replace("DeepSeek V4.1 Flash 1017", "DeepSeek V4.1")
    .replace("Kimi K3.1 Pro", "Kimi K3.1");

function efficiencyFrontier(input: Model[]): Model[] {
  const sorted = [...input].sort(
    (a, b) => a.priceOutput - b.priceOutput || b.intelligence - a.intelligence,
  );
  const result: Model[] = [];
  let best = -Infinity;
  for (const model of sorted) {
    if (model.intelligence > best) {
      result.push(model);
      best = model.intelligence;
    }
  }
  return result;
}

export function PriceScatter() {
  const frontier = efficiencyFrontier(models);
  const points = [...models].sort((a, b) => a.intelligence - b.intelligence);

  return (
    <div className="scatter-wrap">
      <svg
        className="scatter-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="价格与智能指数散点图：横轴为每百万输出 tokens 的价格（对数），纵轴为综合智能指数，虚线为效率前沿。"
      >
        <g>
          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={M.left}
                x2={WIDTH - M.right}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="2 6"
              />
              <text
                x={M.left - 12}
                y={yScale(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#74716a"
                fontSize="9.5"
                fontFamily="var(--font-mono)"
              >
                {tick}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={M.top}
                y2={M.top + PLOT_H}
                stroke="rgba(255,255,255,0.055)"
                strokeDasharray="2 6"
              />
              <text
                x={xScale(tick)}
                y={M.top + PLOT_H + 20}
                textAnchor="middle"
                fill="#74716a"
                fontSize="9.5"
                fontFamily="var(--font-mono)"
              >
                ${tick}
              </text>
            </g>
          ))}

          <line
            x1={M.left}
            x2={M.left}
            y1={M.top}
            y2={M.top + PLOT_H}
            stroke="rgba(255,255,255,0.12)"
          />
          <line
            x1={M.left}
            x2={WIDTH - M.right}
            y1={M.top + PLOT_H}
            y2={M.top + PLOT_H}
            stroke="rgba(255,255,255,0.12)"
          />

          <text
            x={M.left}
            y={16}
            fill="#74716a"
            fontSize="9.5"
            fontFamily="var(--font-mono)"
            letterSpacing="0.06em"
          >
            INTELLIGENCE INDEX
          </text>
          <text
            x={WIDTH - M.right}
            y={HEIGHT - 12}
            textAnchor="end"
            fill="#74716a"
            fontSize="9.5"
            fontFamily="var(--font-mono)"
            letterSpacing="0.04em"
          >
            输出价格 USD / 1M TOKENS（对数）
          </text>
        </g>

        <polyline
          points={frontier
            .map((model) => `${xScale(model.priceOutput)},${yScale(model.intelligence)}`)
            .join(" ")}
          fill="none"
          stroke="rgba(216,255,62,0.55)"
          strokeWidth="1.2"
          strokeDasharray="4 5"
        />

        {points.map((model) => {
          const x = xScale(model.priceOutput);
          const y = yScale(model.intelligence);
          const color = vendorColor(model.vendor);
          return (
            <g key={model.slug}>
              <circle
                cx={x}
                cy={y}
                r={model.slug === "claude-fable-5-2" ? 8 : 6.5}
                fill={color}
                fillOpacity="0.92"
                stroke="#08090c"
                strokeWidth="1.5"
              >
                <title>
                  {`${model.name}：智能 ${model.intelligence}，输出 $${model.priceOutput}/1M`}
                </title>
              </circle>
              {LABELED.has(model.slug) ? (
                <text
                  x={model.slug === "claude-fable-5-2" ? x - 12 : x + 11}
                  y={y - 10}
                  textAnchor={
                    model.slug === "claude-fable-5-2" ? "end" : "start"
                  }
                  fill="#d8d5ce"
                  fontSize="10.5"
                  fontFamily="var(--font-mono)"
                >
                  {shortName(model)}
                </text>
              ) : null}
            </g>
          );
        })}

        <g>
          <text
            x={M.left + 8}
            y={M.top + 18}
            fill="#74716a"
            fontSize="9.5"
            fontFamily="var(--font-mono)"
          >
            左上 = 更便宜、更聪明
          </text>
        </g>
      </svg>
    </div>
  );
}