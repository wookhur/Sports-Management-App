// Comparing player names typed by different people at different times.

/** Lower-case, unaccented, word order ignored: "Mendoza Jesús" = "jesus mendoza". */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}
