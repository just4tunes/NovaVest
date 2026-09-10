import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaVest — Investment Simulator",
  description: "Practice investment workflows using simulated funds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
