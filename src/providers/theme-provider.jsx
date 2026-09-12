"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/query-provider";

// React 19 / Next.js Turbopack development warning suppression:
// next-themes injects an inline <script> to prevent theme flash (FOUC) before hydration.
// React 19 warns against <script> in client component trees ("Encountered a script tag while rendering React component"),
// which Turbopack surfaces as an unhandled development modal error.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    origConsoleError.apply(console, args);
  };
}

export default function ThemeProvider({ children }) {
  return (
    <QueryProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" richColors closeButton duration={1500} />
      </NextThemesProvider>
    </QueryProvider>
  );
}