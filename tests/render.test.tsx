import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { IntelligenceBars } from "@/components/IntelligenceBars";
import { RadarChart } from "@/components/RadarChart";
import { PriceScatter } from "@/components/PriceScatter";
import { DimensionMatrix } from "@/components/DimensionMatrix";
import { CompareExplorer } from "@/components/CompareExplorer";
import { getModel, vendorColor } from "@/data/models";

describe("chart components render on the server", () => {
  it("renders the intelligence bar ranking", () => {
    const html = renderToStaticMarkup(<IntelligenceBars />);
    expect(html).toContain("Claude Fable 5.2");
    expect(html).toContain("64.8");
    expect(html.split("bar-row").length).toBeGreaterThan(15);
  });

  it("renders a radar with one series and seven axes", () => {
    const model = getModel("gpt-6-2-sol")!;
    const html = renderToStaticMarkup(
      <RadarChart series={[{ model, color: vendorColor(model.vendor) }]} />,
    );
    expect(html).toContain("能力雷达");
    expect(html).toContain("智能体");
    expect(html).toContain("<polygon");
  });

  it("renders the price scatter with an accessible label", () => {
    const html = renderToStaticMarkup(<PriceScatter />);
    expect(html).toContain("价格与智能指数散点图");
    expect(html).toContain("Fable 5.2");
    expect(html).toContain("polyline");
  });

  it("renders the dimension matrix with all dimensions", () => {
    const html = renderToStaticMarkup(<DimensionMatrix />);
    expect(html).toContain("推理");
    expect(html).toContain("Claude Fable 5.2");
    expect(html).toContain("/models/");
  });

  it("renders the compare explorer with default selection", () => {
    const html = renderToStaticMarkup(<CompareExplorer />);
    expect(html).toContain("Claude Fable 5.2");
    expect(html).toContain("GPT-6.2 Sol");
    expect(html).toContain("Kimi K3.1 Pro");
    expect(html).toContain("指标对比");
  });
});