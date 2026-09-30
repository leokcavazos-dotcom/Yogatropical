import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yoga Tropical — Recovery-friendly movement & mindfulness",
  description:
    "Book live, online yoga-inspired, tai chi-inspired, breathwork, and meditation classes in a warm, secular, recovery-friendly space.",
};

export const viewport: Viewport = {
  themeColor: "#1c1e23",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <NavBar />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line px-4 py-8 text-center text-sm text-foreground/60">
          <p>Yoga Tropical is a movement, breath, and meditation community rooted in recovery — open to any higher power, or none at all.</p>
          <p className="mt-1">
            Currently an LLC, with a working goal of transitioning into an instructor cooperative.{" "}
            <a href="/about#governance" className="underline hover:text-flamingo">
              Read more
            </a>
            .
          </p>
          <nav className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href="/terms" className="underline hover:text-flamingo">
              Terms of Service
            </a>
            <a href="/privacy" className="underline hover:text-flamingo">
              Privacy Policy
            </a>
            <a href="/instructor-agreement" className="underline hover:text-flamingo">
              Instructor Agreement
            </a>
            <a href="/guidelines" className="underline hover:text-flamingo">
              Code of Conduct
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
