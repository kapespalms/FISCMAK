import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse, pdfjs-dist, and mammoth external so webpack doesn't
  // bundle them — they're large and pdfjs-dist has dynamic requires that
  // confuse the bundler. @napi-rs/canvas is intentionally NOT here: we
  // removed the pdf-parse/worker import that pulled it in, and native
  // .node binaries don't survive Vercel's serverless packaging.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
  outputFileTracingIncludes: {
    // Vercel file-tracing misses externals; explicitly include pdf-parse
    // and pdfjs-dist so the lambda can find them at runtime.
    "/api/v1/documents": [
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
};

export default nextConfig;
