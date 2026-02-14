import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AmanTN — Cybersecurity Awareness",
  description: "AI-powered cybersecurity awareness & threat reporting platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} AmanTN — Stay safe online.
        </footer>
      </body>
    </html>
  );
}
