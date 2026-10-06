import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { AnalyticsAttribution } from "@/components/AnalyticsAttribution";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  openGraph: {
    siteName: siteConfig.name,
    locale: "uk_UA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta name="theme-color" content="#F5F1E8" />
      </head>
      <body>
        <AnalyticsAttribution />
        <AnalyticsScripts />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
