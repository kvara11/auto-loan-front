import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { ThemeSync } from "@/components/theme-sync";

// Variable font with Georgian (Mkhedruli) and Latin glyphs; feeds --font-sans in globals.css.
const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  subsets: ["georgian", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto Loan",
  description: "ავტოსესხების გაცემა და მართვა",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`${notoSansGeorgian.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
