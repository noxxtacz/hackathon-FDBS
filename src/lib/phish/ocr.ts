/* ------------------------------------------------------------------
   Server-side OCR via tesseract.js
   ------------------------------------------------------------------
   Security:
   - Never log extracted text (may contain credentials / PII)
   - Reject oversized images (DoS prevention)
   ------------------------------------------------------------------ */

import { createWorker } from "tesseract.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Run OCR on a raw image buffer and return the extracted text.
 * Throws if the buffer exceeds 5 MB.
 */
export async function ocrImage(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image too large: ${(buffer.length / 1024 / 1024).toFixed(1)} MB (max ${MAX_IMAGE_BYTES / 1024 / 1024} MB)`
    );
  }

  const worker = await createWorker("eng", undefined, {
    logger: () => {},
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
