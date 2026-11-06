export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Ganga Aarti & Boat Ride!" -> "ganga-aarti-boat-ride" */
export const slugify = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

/** First free slug for `base`: base, base-2, base-3, ... */
export const uniqueSlug = async (
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const root = slugify(base) || "item";
  let candidate = root;
  for (let attempt = 2; await isTaken(candidate); attempt++) {
    candidate = `${root}-${attempt}`;
  }
  return candidate;
};
