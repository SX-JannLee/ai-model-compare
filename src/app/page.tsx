import {
  CATALOG_DATE,
  DIMENSIONS,
  formatContext,
  formatPrice,
  models,
} from "@/data/models";

export default function Home() {
  return (
    <main>
      <h1>AI 模型能力对比</h1>
      <p>
        前沿大模型的综合智能、能力维度与 API 价格静态数据表。数据快照{" "}
        {CATALOG_DATE}，来源 Artificial Analysis。
      </p>
      <div className="wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>模型</th>
              <th>厂商</th>
              <th>综合智能</th>
              {DIMENSIONS.map((dimension) => (
                <th key={dimension.key}>{dimension.short}</th>
              ))}
              <th>价格 / 1M</th>
              <th>上下文</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model, index) => (
              <tr key={model.slug}>
                <td>{String(index + 1).padStart(2, "0")}</td>
                <td>{model.name}</td>
                <td>{model.vendor}</td>
                <td>{model.intelligence.toFixed(1)}</td>
                {DIMENSIONS.map((dimension) => (
                  <td key={dimension.key}>
                    {model.scores[dimension.key].toFixed(1)}
                  </td>
                ))}
                <td>{formatPrice(model)}</td>
                <td>{formatContext(model.contextK)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        分数为百分比通过率；价格为美元 / 百万 tokens（输入 / 输出）。
      </p>
    </main>
  );
}
