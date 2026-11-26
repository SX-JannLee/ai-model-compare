import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="code">404</p>
      <h1>这个模型不在快照里</h1>
      <p>链接可能已失效，或者模型尚未被收录。</p>
      <div className="hero-actions" style={{ justifyContent: "center" }}>
        <Link className="btn btn-primary" href="/models/">
          浏览模型库
        </Link>
        <Link className="btn btn-ghost" href="/">
          回到总览
        </Link>
      </div>
    </div>
  );
}