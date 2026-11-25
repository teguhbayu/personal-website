import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Teguh Bayu Pratama",
  description:
    "Interactive 3D portfolio of Teguh Bayu Pratama, Web Developer and Cloud Engineer from SMK Telkom Malang, 1st Place National LKS Cloud Computing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-sky="day"
      suppressHydrationWarning
      className={`${syne.variable} ${jakarta.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased text-sky-ink">
        <a
          href="#main-stage"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1200] focus:px-4 focus:py-3 focus:bg-accent-strong focus:text-white focus:font-medium focus:rounded-sm"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
