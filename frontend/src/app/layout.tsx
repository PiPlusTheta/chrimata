/* App Router root layout loads these font stylesheets for every route. */
/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chrimata — Veracity Architecture for Capital Allocators",
  description: "Veracity Architecture for Capital Allocators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" className="dark scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-aegean-dark font-sans text-text-primary antialiased selection:bg-bronze selection:text-aegean-dark overflow-x-hidden min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
