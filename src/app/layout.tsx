import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Propety management",
  description: "Manage your rental property",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-primary supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]`}
      >
        {children}
      </body>
    </html>
  );
}
