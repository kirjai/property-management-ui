import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const locales = ["en", "ru"];

export const metadata: Metadata = {
  title: "Propety management",
  description: "Manage your rental property",
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();

  return (
    <html lang={locale}>
      <body
        className={`${inter.className} bg-primary supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]`}
      >
        {children}
      </body>
    </html>
  );
}
