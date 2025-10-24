// 🔹 Detect if a property is featured
export const isFeatured = (p: any) => {
  const tags = Array.isArray(p?.tags)
    ? p.tags.map((t) => String(t).trim().toLowerCase())
    : [];

  return (
    p?.featured === true ||
    p?.is_featured === true ||
    p?.isFeatured === true ||
    p?.badge === "Premium" ||
    tags.includes("featured")
  );
};
