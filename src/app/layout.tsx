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
    <html lang="uk" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark"){var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=s;document.documentElement.dataset.theme=s;}}catch(e){}`,
          }}
        />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F5F1E8" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121722" />
        <link rel="alternate" type="text/plain" href="https://uaroute.com/llms.txt" title="LLMs.txt" />
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
