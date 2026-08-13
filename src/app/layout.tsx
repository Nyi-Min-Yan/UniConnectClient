import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "UniConnect",
  description: "Connect with your university community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-base-100 text-base-content font-sans">
        <ThemeProvider>
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
