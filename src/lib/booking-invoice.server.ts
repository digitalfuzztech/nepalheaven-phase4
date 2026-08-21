import { deflateSync, inflateSync } from "node:zlib";
import { buildAppUrl } from "@/lib/app-url.server";
import { getPublicCmsGlobalSettings } from "@/lib/public-cms.server";

export type BookingInvoiceInput = {
  bookingReference: string;
  paymentReference: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  packageName: string;
  tierName: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  travellers: string | number;
  currency: string;
  grandTotal: string;
  paymentType: string;
  amountPaid: string;
  remainingBalance: string;
  paymentStatus: string;
  paymentMethod: string;
};

export type InvoiceBrandingContext = {
  companyLogoUrl: string | null;
  companyTransparentLogoUrl: string | null;
};

type PdfLogo = {
  width: number;
  height: number;
  colorSpace: "/DeviceRGB" | "/DeviceGray";
  bits: number;
  data: Buffer;
  filter: "/DCTDecode" | "/FlateDecode";
  alpha?: Buffer;
};

function absolutePublicUrl(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? buildAppUrl(value) : null;
}

/** Canonical logo variables for current PDF output and future HTML invoices. */
export async function getInvoiceBrandingContext(): Promise<InvoiceBrandingContext> {
  const global = await getPublicCmsGlobalSettings();
  return {
    companyLogoUrl: absolutePublicUrl(global?.branding.mainLogoUrl ?? null),
    companyTransparentLogoUrl: absolutePublicUrl(
      global?.branding.lightLogoUrl ?? null,
    ),
  };
}

function pdfText(value: string | number) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "-")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function invoiceFilename(reference: string) {
  return `Nepal-Heaven-Invoice-${reference.replace(/[^A-Za-z0-9-]/g, "-")}.pdf`;
}

function textCommand(
  text: string,
  x: number,
  y: number,
  size = 10,
  bold = false,
) {
  return `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`;
}

function jpegDimensions(data: Buffer) {
  let offset = 2;
  while (offset + 8 < data.length) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = data[offset + 1]!;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = data.readUInt16BE(offset + 2);
    if (length < 2 || offset + length + 2 > data.length) break;
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7)
    )
      return {
        height: data.readUInt16BE(offset + 5),
        width: data.readUInt16BE(offset + 7),
      };
    offset += length + 2;
  }
  return null;
}

function paeth(left: number, above: number, upperLeft: number) {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  return leftDistance <= aboveDistance && leftDistance <= upperLeftDistance
    ? left
    : aboveDistance <= upperLeftDistance
      ? above
      : upperLeft;
}

function pngLogo(data: Buffer): PdfLogo | null {
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = -1;
  let interlace = 1;
  const idat: Buffer[] = [];
  while (offset + 12 <= data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8]!;
      colorType = chunk[9]!;
      interlace = chunk[12]!;
    } else if (type === "IDAT") idat.push(chunk);
    else if (type === "IEND") break;
    offset += length + 12;
  }
  const channels =
    colorType === 6
      ? 4
      : colorType === 2
        ? 3
        : colorType === 4
          ? 2
          : colorType === 0
            ? 1
            : 0;
  if (
    !width ||
    !height ||
    bitDepth !== 8 ||
    interlace !== 0 ||
    !channels ||
    !idat.length
  )
    return null;
  const inflated = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(stride * height);
  let source = 0;
  for (let row = 0; row < height; row += 1) {
    const filter = inflated[source++]!;
    const rowOffset = row * stride;
    for (let column = 0; column < stride; column += 1) {
      const raw = inflated[source++]!;
      const left =
        column >= channels ? pixels[rowOffset + column - channels]! : 0;
      const above = row ? pixels[rowOffset - stride + column]! : 0;
      const upperLeft =
        row && column >= channels
          ? pixels[rowOffset - stride + column - channels]!
          : 0;
      const reconstructed =
        filter === 0
          ? raw
          : filter === 1
            ? raw + left
            : filter === 2
              ? raw + above
              : filter === 3
                ? raw + Math.floor((left + above) / 2)
                : filter === 4
                  ? raw + paeth(left, above, upperLeft)
                  : NaN;
      if (!Number.isFinite(reconstructed)) return null;
      pixels[rowOffset + column] = reconstructed & 0xff;
    }
  }
  const hasAlpha = colorType === 6 || colorType === 4;
  const colorChannels = colorType === 6 || colorType === 2 ? 3 : 1;
  const colors = Buffer.alloc(width * height * colorChannels);
  const alpha = hasAlpha ? Buffer.alloc(width * height) : undefined;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    for (let channel = 0; channel < colorChannels; channel += 1)
      colors[pixel * colorChannels + channel] =
        pixels[pixel * channels + channel]!;
    if (alpha) alpha[pixel] = pixels[pixel * channels + channels - 1]!;
  }
  return {
    width,
    height,
    colorSpace: colorChannels === 3 ? "/DeviceRGB" : "/DeviceGray",
    bits: 8,
    data: deflateSync(colors),
    filter: "/FlateDecode",
    ...(alpha ? { alpha: deflateSync(alpha) } : {}),
  };
}

async function loadPdfLogo(url: string | null): Promise<PdfLogo | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return null;
    const data = Buffer.from(await response.arrayBuffer());
    if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
      const size = jpegDimensions(data);
      return size
        ? {
            ...size,
            colorSpace: "/DeviceRGB",
            bits: 8,
            data,
            filter: "/DCTDecode",
          }
        : null;
    }
    if (
      data
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    )
      return pngLogo(data);
  } catch {
    // Invoice delivery must continue with the textual branding fallback.
  }
  return null;
}

function streamObject(dictionary: string, data: Buffer) {
  return Buffer.concat([
    Buffer.from(
      `<< ${dictionary} /Length ${data.length} >>\nstream\n`,
      "ascii",
    ),
    data,
    Buffer.from("\nendstream", "ascii"),
  ]);
}

/** Creates a compact PDF entirely in memory and leaves no temporary files. */
export async function createBookingInvoicePdf(input: BookingInvoiceInput) {
  const branding = await getInvoiceBrandingContext();
  const logo = await loadPdfLogo(
    branding.companyTransparentLogoUrl ?? branding.companyLogoUrl,
  );
  const commands = ["q 0.071 0.231 0.400 rg 0 700 612 92 re f Q"];
  if (logo) {
    const scale = Math.min(190 / logo.width, 48 / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    commands.push(
      `q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} 42 ${(720 + (48 - height) / 2).toFixed(2)} cm /Logo Do Q`,
    );
  } else commands.push(textCommand("NEPAL HEAVEN", 42, 750, 22, true));
  commands.push(
    textCommand("Heaven on Earth Awaits.", 42, 708, 9),
    textCommand("BOOKING INVOICE", 398, 750, 16, true),
    textCommand(`Invoice date: ${input.invoiceDate}`, 398, 728, 9),
    textCommand("Booking", 42, 670, 13, true),
    textCommand(`Booking reference: ${input.bookingReference}`, 42, 649),
    textCommand(`Payment reference: ${input.paymentReference}`, 42, 633),
    textCommand("Customer", 42, 600, 13, true),
    textCommand(`Name: ${input.customerName}`, 42, 579),
    textCommand(`Email: ${input.customerEmail}`, 42, 563),
    textCommand(`Phone: ${input.customerPhone}`, 42, 547),
    textCommand(`Country / nationality: ${input.customerCountry}`, 42, 531),
    textCommand("Journey", 42, 498, 13, true),
    textCommand(`Package: ${input.packageName}`, 42, 477),
    textCommand(`Pricing tier: ${input.tierName}`, 42, 461),
    textCommand(`Destination: ${input.destinationName}`, 42, 445),
    textCommand(`Travel dates: ${input.startDate} - ${input.endDate}`, 42, 429),
    textCommand(`Travellers: ${input.travellers}`, 42, 413),
    "q 0.957 0.941 0.906 rg 32 188 548 190 re f Q",
    textCommand("Financial summary", 42, 350, 13, true),
    textCommand(`Currency: ${input.currency}`, 42, 329),
    textCommand(`Grand total: ${input.currency} ${input.grandTotal}`, 42, 313),
    textCommand(`Payment type: ${input.paymentType}`, 42, 297),
    textCommand(`Amount paid: ${input.currency} ${input.amountPaid}`, 42, 281),
    textCommand(
      `Remaining balance: ${input.currency} ${input.remainingBalance}`,
      42,
      265,
    ),
    textCommand(`Payment status: ${input.paymentStatus}`, 42, 249),
    textCommand(`Payment method: ${input.paymentMethod}`, 42, 233),
    textCommand("Thank you for choosing Nepal Heaven.", 42, 142, 11, true),
    textCommand(
      "This invoice reflects the booking and payment snapshots recorded at confirmation.",
      42,
      124,
      9,
    ),
  );
  const content = Buffer.from(`${commands.join("\n")}\n`, "ascii");
  const objects: Buffer[] = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "ascii"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "ascii"),
    Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >>${logo ? " /XObject << /Logo 7 0 R >>" : ""} >> /Contents 4 0 R >>`,
      "ascii",
    ),
    streamObject("", content),
    Buffer.from(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "ascii",
    ),
    Buffer.from(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
      "ascii",
    ),
  ];
  if (logo) {
    objects.push(
      streamObject(
        `/Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace ${logo.colorSpace} /BitsPerComponent ${logo.bits} /Filter ${logo.filter}${logo.alpha ? " /SMask 8 0 R" : ""}`,
        logo.data,
      ),
    );
    if (logo.alpha)
      objects.push(
        streamObject(
          `/Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`,
          logo.alpha,
        ),
      );
  }
  const parts = [Buffer.from("%PDF-1.4\n", "ascii")];
  const offsets = [0];
  let outputLength = parts[0]!.length;
  objects.forEach((object, index) => {
    offsets.push(outputLength);
    const framed = Buffer.concat([
      Buffer.from(`${index + 1} 0 obj\n`, "ascii"),
      object,
      Buffer.from("\nendobj\n", "ascii"),
    ]);
    parts.push(framed);
    outputLength += framed.length;
  });
  const xrefOffset = outputLength;
  parts.push(
    Buffer.from(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
        .slice(1)
        .map((value) => `${String(value).padStart(10, "0")} 00000 n \n`)
        .join(
          "",
        )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
      "ascii",
    ),
  );
  return {
    filename: invoiceFilename(input.bookingReference),
    content: Buffer.concat(parts),
    contentType: "application/pdf",
    branding,
  };
}
