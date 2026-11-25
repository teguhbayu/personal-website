import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import CloudDeckApp from "./components/CloudDeckApp";
import { OWNER } from "@/data/portfolio";
import { buildJsonLd, SITE_URL } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: OWNER.fullName,
    template: `%s | ${OWNER.fullName}`,
  },
  description: `${OWNER.fullName}, ${OWNER.role} at ${OWNER.school} in ${OWNER.location}. 1st Place National LKS Cloud Computing and TOEIC 935/990.`,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: OWNER.fullName,
    title: OWNER.fullName,
    description: `${OWNER.fullName}, ${OWNER.role} at ${OWNER.school}.`,
    images: [
      {
        url: `${SITE_URL}${OWNER.portrait}`,
        alt: `${OWNER.fullName} portrait`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OWNER.fullName,
    description: `${OWNER.fullName}, ${OWNER.role} at ${OWNER.school}.`,
    images: [`${SITE_URL}${OWNER.portrait}`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildJsonLd();

  return (
    <html
      lang="en"
      data-sky="day"
      suppressHydrationWarning
      className={`${syne.variable} ${jakarta.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased text-sky-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-stage"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1200] focus:px-4 focus:py-3 focus:bg-accent-strong focus:text-white focus:font-medium focus:rounded-sm"
        >
          Skip to main content
        </a>
        <CloudDeckApp />
        {children}
      </body>
    </html>
  );
}
