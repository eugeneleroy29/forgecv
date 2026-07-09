"use client";

export default function BrandIcon({ slug, size = 16 }) {
  return (
    <img
      src={`/tool-icons/${slug}.svg`}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}