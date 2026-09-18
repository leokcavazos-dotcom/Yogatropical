import type { Metadata } from "next";
import { Nunito, Fraunces } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yoga Tropical — Recovery-friendly movement & mindfulness",
  description:
    "Book live, online yoga-inspired, tai chi-inspired, breathwork, and meditation classes in a warm, secular, recovery-friendly space.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <NavBar />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-sand px-4 py-8 text-center text-sm text-foreground/60">
          <p>Yoga Tropical is a movement, breath, and meditation community rooted in recovery — open to any higher power, or none at all.</p>
          <p className="mt-1">
            Currently an LLC, with a working goal of transitioning into an instructor cooperative.{" "}
            <a href="/about#governance" className="underline hover:text-clay">
              Read more
            </a>
            .
          </p>
        </footer>
      </body>
    </html>
  );
}
