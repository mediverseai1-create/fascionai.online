"use client";

import { useState } from "react";
import Papa from "papaparse";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormAlert } from "@/components/ui/FormAlert";
import {
  validateCsvRow,
  type CsvImportRow,
  type CsvRowValidationResult,
} from "@/lib/validations/csvImport";

type Step = "upload" | "preview" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [validRows, setValidRows] = useState<CsvImportRow[]>([]);
  const [rowResults, setRowResults] = useState<CsvRowValidationResult[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    productsImported: number;
    salesImported: number;
  } | null>(null);

  function handleFile(file: File) {
    setParseError(null);
    setFileName(file.name);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(results.errors[0].message);
          return;
        }
        const rows = results.data;
        if (rows.length === 0) {
          setParseError("The file has no data rows.");
          return;
        }
        if (rows.length > 5000) {
          setParseError("Files are limited to 5,000 rows for now.");
          return;
        }

        const validated = rows.map((row, i) => validateCsvRow(row, i + 2));
        setRowResults(validated);
        setValidRows(
          validated
            .filter((r): r is CsvRowValidationResult & { data: CsvImportRow } => r.data !== null)
            .map((r) => r.data)
        );
        setStep("preview");
      },
      error: (err) => setParseError(err.message),
    });
  }

  async function confirmImport() {
    setImporting(true);
    setImportError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fileName, rows: validRows }),
      });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error ?? "Import failed.");
        return;
      }
      setResult(json);
      setStep("done");
    } catch {
      setImportError("Could not reach the server. Check your connection and try again.");
    } finally {
      setImporting(false);
    }
  }

  const errorRows = rowResults.filter((r) => r.errors.length > 0);

  return (
    <div>
      <PageHeader
        title="Import data"
        subtitle="Upload a CSV of sales and current stock to power your dashboard."
      />

      {step === "upload" && (
        <Card className="p-6 max-w-2xl">
          <Eyebrow>1. Download the template</Eyebrow>
          <p className="text-sm text-muted mb-4">
            Use this format so we can match your columns correctly. One row
            per sale, with the product&apos;s current stock on hand.
          </p>
          <a
            href="/templates/facsion-ai-import-template.csv"
            download
            className="text-sm text-wine font-semibold"
          >
            Download sample CSV template →
          </a>

          <div className="h-px bg-line my-6" />

          <Eyebrow>2. Upload your file</Eyebrow>
          {parseError && <FormAlert variant="error">{parseError}</FormAlert>}
          <label className="flex flex-col items-center justify-center border border-dashed border-line rounded-[var(--radius)] py-10 cursor-pointer hover:border-ink transition-colors">
            <span className="text-sm font-medium mb-1">
              Click to choose a CSV file
            </span>
            <span className="text-xs text-muted">or drag and drop</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </Card>
      )}

      {step === "preview" && (
        <Card className="p-6 max-w-4xl">
          <Eyebrow>3. Review before importing</Eyebrow>
          <p className="text-sm mb-1">
            <strong>{validRows.length}</strong> valid row
            {validRows.length === 1 ? "" : "s"} ready to import
            {errorRows.length > 0 && (
              <>
                {" "}
                · <strong className="text-risk">{errorRows.length}</strong>{" "}
                row{errorRows.length === 1 ? "" : "s"} with errors will be
                skipped
              </>
            )}
          </p>

          {errorRows.length > 0 && (
            <div className="mt-4 mb-6 max-h-48 overflow-y-auto border border-line rounded-[var(--radius)]">
              <table className="w-full text-xs">
                <thead className="bg-risk-soft/40 sticky top-0">
                  <tr className="text-left">
                    <th className="py-2 px-3 font-medium">Row</th>
                    <th className="py-2 px-3 font-medium">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {errorRows.map((r) => (
                    <tr key={r.rowNumber} className="border-t border-line">
                      <td className="py-2 px-3">{r.rowNumber}</td>
                      <td className="py-2 px-3 text-risk">
                        {r.errors.join("; ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {validRows.length > 0 && (
            <div className="mb-6 max-h-64 overflow-auto border border-line rounded-[var(--radius)]">
              <table className="w-full text-xs">
                <thead className="bg-[#FBFAF7] sticky top-0">
                  <tr className="text-left">
                    <th className="py-2 px-3 font-medium">SKU</th>
                    <th className="py-2 px-3 font-medium">Style</th>
                    <th className="py-2 px-3 font-medium">Sold</th>
                    <th className="py-2 px-3 font-medium">Revenue</th>
                    <th className="py-2 px-3 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="py-2 px-3 font-mono">{row.sku}</td>
                      <td className="py-2 px-3">{row.style_name}</td>
                      <td className="py-2 px-3">{row.quantity_sold}</td>
                      <td className="py-2 px-3">{row.revenue}</td>
                      <td className="py-2 px-3">{row.quantity_on_hand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 20 && (
                <p className="text-xs text-muted px-3 py-2">
                  + {validRows.length - 20} more rows
                </p>
              )}
            </div>
          )}

          {importError && <FormAlert variant="error">{importError}</FormAlert>}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setStep("upload");
                setRowResults([]);
                setValidRows([]);
              }}
            >
              Choose a different file
            </Button>
            <Button
              onClick={confirmImport}
              disabled={validRows.length === 0 || importing}
            >
              {importing
                ? "Importing…"
                : `Import ${validRows.length} row${validRows.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </Card>
      )}

      {step === "done" && result && (
        <Card className="p-6 max-w-2xl">
          <FormAlert variant="success">
            Imported {result.productsImported} product
            {result.productsImported === 1 ? "" : "s"} and{" "}
            {result.salesImported} sale
            {result.salesImported === 1 ? "" : "s"}. Your dashboard is now
            up to date.
          </FormAlert>
          <div className="flex gap-3 mt-2">
            <ButtonLink href="/dashboard">Go to overview</ButtonLink>
            <Button
              variant="ghost"
              onClick={() => {
                setStep("upload");
                setResult(null);
                setRowResults([]);
                setValidRows([]);
              }}
            >
              Import another file
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
