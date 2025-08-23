import type { Metadata } from "next";
import QueryProvider from "@/lib/providers/QueryProvider";
import { NotificationProvider } from "@/shared/providers/NotificationProvider";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { AuthInvalidationProvider } from "@/shared/providers/AuthInvalidationProvider";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Enterprise Next.js 15 boilerplate with TanStack Query",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body>
        <QueryProvider>
          <ThemeProvider>
            <NotificationProvider>
              <AuthInvalidationProvider>{children}</AuthInvalidationProvider>
            </NotificationProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
