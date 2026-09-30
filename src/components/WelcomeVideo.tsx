import Image from "next/image";

interface WelcomeVideoProps {
  src?: string;
  fallbackHeadline: string;
  fallbackBody: string;
}

// Slots in a real welcome video the moment one exists (AI-generated for now,
// real footage later — see README "Onboarding videos") without any code
// changes: just set the matching NEXT_PUBLIC_WELCOME_VIDEO_* env var. Until
// then it shows a warm, intentional-looking panel instead of a broken player.
export default function WelcomeVideo({ src, fallbackHeadline, fallbackBody }: WelcomeVideoProps) {
  if (src) {
    return (
      <video
        src={src}
        controls
        playsInline
        className="aspect-video w-full rounded-2xl bg-black object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
      <Image src="/brand/logo-mark.png" alt="" width={72} height={72} className="h-16 w-16" />
      <h3 className="font-display text-xl text-mint">{fallbackHeadline}</h3>
      <p className="max-w-sm text-sm text-foreground/80">{fallbackBody}</p>
    </div>
  );
}
