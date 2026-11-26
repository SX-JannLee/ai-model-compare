import Link from "next/link";
import { vendorColor } from "@/data/models";

export function VendorDot({
  vendor,
  size = 8,
}: {
  vendor: string;
  size?: number;
}) {
  return (
    <span
      className="dot"
      style={{
        width: size,
        height: size,
        background: vendorColor(vendor),
      }}
      aria-hidden="true"
    />
  );
}

export function SectionHead({
  no,
  title,
  desc,
  linkHref,
  linkLabel,
}: {
  no: string;
  title: string;
  desc?: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-head">
      <span className="section-no">{no}</span>
      <div>
        <h2 className="section-title">{title}</h2>
        {desc ? <p className="section-desc">{desc}</p> : null}
      </div>
      {linkHref && linkLabel ? (
        <Link className="section-link" href={linkHref}>
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}