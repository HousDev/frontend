// 🔹 Detect if a property is featured
export const isFeatured = (p: any) => {
  const tags = Array.isArray(p?.tags)
    ? p.tags.map((t) => String(t).trim().toLowerCase())
    : [];

  return (
    p?.featured === true ||
    p?.featured === 1 ||
    p?.featured === "1" ||
    p?.is_featured === true ||
    p?.is_featured === 1 ||
    p?.is_featured === "1" ||
    p?.isFeatured === true ||
    p?.isFeatured === 1 ||
    p?.badge === "Premium" ||
    tags.some((t) => t.includes("feature"))
  );
};
