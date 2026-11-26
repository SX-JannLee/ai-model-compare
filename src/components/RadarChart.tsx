import { DIMENSIONS, type Model } from "@/data/models";

interface RadarSeries {
  model: Model;
  color: string;
}

const RINGS = [20, 40, 60, 80, 100];

export function RadarChart({
  series,
  size = 440,
  showLabels = true,
}: {
  series: RadarSeries[];
  size?: number;
  showLabels?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.3;
  const count = DIMENSIONS.length;

  const angleFor = (index: number) =>
    -Math.PI / 2 + (index * 2 * Math.PI) / count;

  const point = (value: number, index: number, scale = 1) => {
    const angle = angleFor(index);
    const distance = (Math.max(0, Math.min(100, value)) / 100) * radius * scale;
    return [cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance];
  };

  const ringPoints = (value: number) =>
    DIMENSIONS.map((_, index) => point(value, index).join(",")).join(" ");

  const labelPoint = (
    index: number,
  ): { x: number; y: number; anchor: "middle" | "start" | "end"; dy: number } => {
    const angle = angleFor(index);
    return {
      x: cx + Math.cos(angle) * radius * 1.19,
      y: cy + Math.sin(angle) * radius * 1.19,
      anchor:
        Math.abs(Math.cos(angle)) < 0.18
          ? "middle"
          : Math.cos(angle) > 0
            ? "start"
            : "end",
      dy: Math.sin(angle) < -0.75 ? -2 : Math.sin(angle) > 0.75 ? 9 : 4,
    };
  };

  return (
    <svg
      className="radar-svg"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={
        series.length === 1
          ? `${series[0].model.name} 的七维能力雷达图`
          : `能力雷达图：${series.map((item) => item.model.name).join("、")}`
      }
    >
      <g>
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={ringPoints(ring)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={ring === 100 ? 1.2 : 0.7}
          />
        ))}
        {DIMENSIONS.map((dimension, index) => {
          const [x, y] = point(100, index);
          return (
            <line
              key={dimension.key}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.7"
            />
          );
        })}
      </g>

      {series.map(({ model, color }) => {
        const points = DIMENSIONS.map((dimension, index) =>
          point(model.scores[dimension.key], index).join(","),
        ).join(" ");

        return (
          <g key={model.slug}>
            <polygon
              points={points}
              fill={color}
              fillOpacity={series.length > 1 ? 0.1 : 0.16}
              stroke={color}
              strokeWidth={series.length > 1 ? 1.8 : 2.2}
              strokeLinejoin="round"
            >
              <title>{model.name}</title>
            </polygon>
            {series.length === 1
              ? DIMENSIONS.map((dimension, index) => {
                  const [x, y] = point(model.scores[dimension.key], index);
                  return (
                    <circle
                      key={dimension.key}
                      cx={x}
                      cy={y}
                      r={2.6}
                      fill={color}
                    />
                  );
                })
              : null}
          </g>
        );
      })}

      {showLabels
        ? DIMENSIONS.map((dimension, index) => {
            const label = labelPoint(index);
            return (
              <text
                key={dimension.key}
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                dy={label.dy}
                fill="#a7a39a"
                fontSize="10.5"
                fontFamily="var(--font-mono)"
                letterSpacing="0.04em"
              >
                {dimension.short}
              </text>
            );
          })
        : null}
    </svg>
  );
}