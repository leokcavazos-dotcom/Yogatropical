import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { joinTestRoom, type VideoJoin } from "@/lib/video";
import VideoRoom from "@/components/VideoRoom";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: `${t.room.testTitle} — Yoga Tropical`, robots: { index: false } };
}

// A fresh private room every visit, so it must never be cached.
export const dynamic = "force-dynamic";

export default async function TestRoomPage() {
  const [session, { t }] = await Promise.all([auth(), getI18n()]);
  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-foreground/70">{t.room.signIn}</p>
        <Link href="/login" className="mt-4 inline-block underline hover:text-flamingo">
          {t.nav.signIn}
        </Link>
      </main>
    );
  }
  const join: VideoJoin | null = await joinTestRoom(session.user.name).catch((error) => {
    console.error("Couldn't open test room", error);
    return null;
  });
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl text-mint">{t.room.testTitle}</h1>
      <p className="mb-4 mt-2 text-foreground/80">{t.room.testBody}</p>
      {join ? (
        <VideoRoom join={join} title={t.room.testTitle} t={t.room} />
      ) : (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-red-200">{t.room.unavailable}</p>
      )}
    </main>
  );
}
