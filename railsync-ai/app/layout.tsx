import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "RailSync-AI | Gati-Shakti Unified Block Engine",
  description:
    "AI-Powered Automatic Block Planning System for Indian Railways Divisional Control Rooms. Manages block disconnections, joint block windows, and disruption simulation for the Ghaziabad–Kanpur Central corridor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          minHeight: "100vh",
          background: "var(--color-bg-primary)",
          color: "var(--color-text-primary)",
        }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
