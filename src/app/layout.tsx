import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import NavBar from "@/components/NavBar";
import { getI18n } from "@/i18n/server";
import { I18nProvider } from "@/i18n/client";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.title, description: t.meta.description };
}

export const viewport: Viewport = {
  themeColor: "#1c1e23",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getI18n();
  return (
    <html lang={locale} className={`${nunito.variable} ${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider locale={locale} t={t}>
          <NavBar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-line px-4 py-8 text-center text-sm text-foreground/60">
            <p>
              {t.footer.tagline}{" "}
              <a href="/recovery" className="underline hover:text-flamingo">
                {t.footer.findMeeting}
              </a>
              .
            </p>
            <p className="mt-1">
              {t.footer.llc}{" "}
              <a href="/about#governance" className="underline hover:text-flamingo">
                {t.footer.readMore}
              </a>
              .
            </p>
            <nav className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <a href="/terms" className="underline hover:text-flamingo">
                {t.footer.terms}
              </a>
              <a href="/privacy" className="underline hover:text-flamingo">
                {t.footer.privacy}
              </a>
              <a href="/instructor-agreement" className="underline hover:text-flamingo">
                {t.footer.instructorAgreement}
              </a>
              <a href="/guidelines" className="underline hover:text-flamingo">
                {t.footer.codeOfConduct}
              </a>
            </nav>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
