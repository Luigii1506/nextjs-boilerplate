/**
 * 🌙 THEME PROVIDER
 * ================
 *
 * Simple wrapper for next-themes with optimized configuration.
 * Feature flag checking moved to components that need it.
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface CustomThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  ...props
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      themes={["light", "dark"]}
      enableSystem={true}
      disableTransitionOnChange={false}
      suppressHydrationWarning={true}
    >
      {children}
    </NextThemesProvider>
  );
}
