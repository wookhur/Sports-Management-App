import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

// Writing values into an existing .xlsx without re-saving it through a
// spreadsheet library.
//
// The school's bitácora carries charts, form-control checkboxes, comments,
// a table, data validations and conditional formats. Libraries that load a
// workbook into their own model and write it back drop what they don't
// model (charts first). Here the package is left as it is and only the
// cells we fill are touched, inside each sheet's XML: everything else in
// the file goes back out byte for byte, and Excel recalculates the formulas
// on open.

const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export type CellValue = string | number | boolean | null;
export type SheetPatch = Record<string, CellValue>;

function colNumber(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)![0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function cellRef(col: number | string, row: number): string {
  return `${typeof col === "number" ? colLetter(col) : col}${row}`;
}

function rowNumber(ref: string): number {
  return Number(ref.match(/\d+$/)![0]);
}

function elementChildren(node: Element, localName: string): Element[] {
  const out: Element[] = [];
  for (let c = node.firstChild; c; c = c.nextSibling) {
    if (c.nodeType === 1 && (c as Element).localName === localName) out.push(c as Element);
  }
  return out;
}

function setCell(doc: Document, sheetData: Element, ref: string, value: CellValue) {
  const r = rowNumber(ref);
  // The row, created in order if the template never used it.
  const rows = elementChildren(sheetData, "row");
  let row = rows.find((x) => Number(x.getAttribute("r")) === r);
  if (!row) {
    row = doc.createElementNS(NS, "row");
    row.setAttribute("r", String(r));
    const after = rows.find((x) => Number(x.getAttribute("r")) > r);
    sheetData.insertBefore(row, after ?? null);
  }
  // The cell, keeping its style when it exists.
  const cells = elementChildren(row, "c");
  let cell = cells.find((x) => x.getAttribute("r") === ref);
  if (!cell) {
    cell = doc.createElementNS(NS, "c");
    cell.setAttribute("r", ref);
    const col = colNumber(ref);
    const after = cells.find((x) => colNumber(x.getAttribute("r") ?? "A") > col);
    row.insertBefore(cell, after ?? null);
  }
  while (cell.firstChild) cell.removeChild(cell.firstChild);
  cell.removeAttribute("t");
  if (value === null || value === "") return;
  if (typeof value === "number") {
    const v = doc.createElementNS(NS, "v");
    v.appendChild(doc.createTextNode(String(value)));
    cell.appendChild(v);
  } else if (typeof value === "boolean") {
    cell.setAttribute("t", "b");
    const v = doc.createElementNS(NS, "v");
    v.appendChild(doc.createTextNode(value ? "1" : "0"));
    cell.appendChild(v);
  } else {
    cell.setAttribute("t", "inlineStr");
    const is = doc.createElementNS(NS, "is");
    const t = doc.createElementNS(NS, "t");
    t.setAttribute("xml:space", "preserve");
    t.appendChild(doc.createTextNode(value));
    is.appendChild(t);
    cell.appendChild(is);
  }
}

/**
 * Forget every formula's saved result. They were computed from the blank
 * template; with no cached value, every spreadsheet app has to recompute
 * (LibreOffice, for one, ignores fullCalcOnLoad and would show the stale
 * numbers).
 */
function dropCachedResults(doc: Document) {
  const cells = doc.getElementsByTagName("c");
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    if (elementChildren(c, "f").length === 0) continue;
    for (const v of elementChildren(c, "v")) c.removeChild(v);
    // A cached text or error result was typed; without the value the type goes too.
    if (["str", "e", "b", "s"].includes(c.getAttribute("t") ?? "")) c.removeAttribute("t");
  }
}

/** Sheet name → path of its XML part inside the package. */
async function sheetPaths(zip: JSZip): Promise<Map<string, string>> {
  const parser = new DOMParser();
  const wb = parser.parseFromString(await zip.file("xl/workbook.xml")!.async("string"), "text/xml");
  const rels = parser.parseFromString(await zip.file("xl/_rels/workbook.xml.rels")!.async("string"), "text/xml");
  const target = new Map<string, string>();
  const relEls = rels.getElementsByTagName("Relationship");
  for (let i = 0; i < relEls.length; i++) {
    const r = relEls[i];
    const t = r.getAttribute("Target") ?? "";
    target.set(r.getAttribute("Id") ?? "", t.startsWith("/") ? t.slice(1) : `xl/${t}`);
  }
  const out = new Map<string, string>();
  const sheets = wb.getElementsByTagName("sheet");
  for (let i = 0; i < sheets.length; i++) {
    const s = sheets[i];
    const id = s.getAttributeNS(REL_NS, "id") ?? s.getAttribute("r:id") ?? "";
    out.set(s.getAttribute("name") ?? "", target.get(id) ?? "");
  }
  return out;
}

/**
 * Fill cells in a workbook. `patches` maps sheet name → { "B9": value }.
 * `null` or "" empties a cell (and drops any formula in it). Unknown sheet
 * names throw, so a renamed template fails loudly instead of exporting blanks.
 */
export async function patchWorkbook(template: Buffer | Uint8Array, patches: Record<string, SheetPatch>): Promise<Buffer> {
  const zip = await JSZip.loadAsync(template);
  const paths = await sheetPaths(zip);
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  for (const sheet of Object.keys(patches)) {
    const path = paths.get(sheet);
    if (!path || !zip.file(path)) throw new Error(`Template has no sheet "${sheet}"`);
  }
  for (const [sheet, path] of paths) {
    const file = zip.file(path);
    if (!file) continue;
    const doc = parser.parseFromString(await file.async("string"), "text/xml");
    const sheetData = doc.getElementsByTagName("sheetData")[0];
    for (const [ref, value] of Object.entries(patches[sheet] ?? {})) setCell(doc, sheetData, ref, value);
    dropCachedResults(doc);
    zip.file(path, serializer.serializeToString(doc));
  }

  // And have Excel recompute everything on open, not only cells without a value.
  const wbXml = await zip.file("xl/workbook.xml")!.async("string");
  const wbDoc = parser.parseFromString(wbXml, "text/xml");
  let calcPr = wbDoc.getElementsByTagName("calcPr")[0];
  if (!calcPr) {
    calcPr = wbDoc.createElementNS(NS, "calcPr");
    wbDoc.documentElement.appendChild(calcPr);
  }
  calcPr.setAttribute("fullCalcOnLoad", "1");
  zip.file("xl/workbook.xml", serializer.serializeToString(wbDoc));

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
