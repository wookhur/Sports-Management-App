"use client";

/**
 * Printing is how the report becomes a PDF. Every browser's print dialog can
 * "Save as PDF", so there's no server-side renderer to run, no font packaging,
 * and the file the coach hands over is the page they just proofread.
 */
export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary no-print">
      🖨 {label}
    </button>
  );
}
