import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ShieldsUp",
  description: "Cybersecurity awareness & threat reporting platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ShieldsUp — Stay safe online.
        </footer>
      </body>
    </html>
  );
}
