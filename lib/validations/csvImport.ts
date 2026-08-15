import { z } from "zod";

// One row = one historical sale, carrying the product's current catalog
// info, current stock on hand, and reorder lead time. This mirrors how a
// typical POS/e-commerce sales export looks, and lets a single upload
// populate products, sales history, and a current inventory snapshot in
// one pass. Re-uploading later (e.g. weekly) adds new sales rows and a
// fresh snapshot dated at upload time, which is what makes trend and
// velocity calculations possible over time.
export const csvImportRowSchema = z.object({
  sku: z.string().trim().min(1, "sku is required"),
  style_name: z.string().trim().min(1, "style_name is required"),
  category: z.string().trim().optional().default(""),
  color: z.string().trim().optional().default(""),
  size: z.string().trim().optional().default(""),
  cost: z.coerce.number().nonnegative().optional(),
  price: z.coerce.number().nonnegative().optional(),
  quantity_sold: z.coerce.number().int().positive("quantity_sold must be a positive whole number"),
  revenue: z.coerce.number().nonnegative("revenue cannot be negative"),
  sold_at: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "sold_at must be in YYYY-MM-DD format"),
  quantity_on_hand: z.coerce.number().int().nonnegative("quantity_on_hand cannot be negative"),
  lead_time_days: z.coerce.number().int().positive().optional().default(14),
});

export type CsvImportRow = z.infer<typeof csvImportRowSchema>;

export const CSV_TEMPLATE_COLUMNS = [
  "sku",
  "style_name",
  "category",
  "color",
  "size",
  "cost",
  "price",
  "quantity_sold",
  "revenue",
  "sold_at",
  "quantity_on_hand",
  "lead_time_days",
] as const;

export interface CsvRowValidationResult {
  rowNumber: number;
  data: CsvImportRow | null;
  errors: string[];
}

export function validateCsvRow(
  raw: Record<string, unknown>,
  rowNumber: number
): CsvRowValidationResult {
  const result = csvImportRowSchema.safeParse(raw);
  if (result.success) {
    return { rowNumber, data: result.data, errors: [] };
  }
  return {
    rowNumber,
    data: null,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}
