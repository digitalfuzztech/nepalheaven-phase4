import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function root() {
  return path.resolve(process.env["PRIVATE_FINANCIAL_DOCUMENT_ROOT"]?.trim() || path.join(process.cwd(), ".private", "financial-documents"));
}
function safe(key: string) {
  if (!/^[0-9a-f-]{36}\.pdf$/i.test(key)) throw new Error("Invalid financial-document key.");
  return path.join(root(), key);
}
export async function storeFinancialPdf(key: string, content: Buffer) {
  await mkdir(root(), { recursive: true });
  await writeFile(safe(key), content, { flag: "wx" });
}
export async function readFinancialPdf(key: string) { return readFile(safe(key)); }
