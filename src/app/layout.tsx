import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./(frontend)/globals.css";
import "./(frontend)/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Web Builder'

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Build and edit pages with drag-and-drop. Sections, columns, and widgets—save, load, and export your designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Always wrap in one document so the admin ServerFunctionsProvider stays in the same React tree.
  // (Pass-through fragment for /admin was breaking context when RootLayout streamed.)
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
