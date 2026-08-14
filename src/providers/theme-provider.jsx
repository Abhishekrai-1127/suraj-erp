"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/query-provider";

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