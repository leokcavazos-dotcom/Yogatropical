import PalmTreeLogo from "@/components/PalmTreeLogo";

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
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-palm via-palm-dark to-clay-dark p-8 text-center text-white shadow-sm">
      <PalmTreeLogo className="h-12 w-12 [&_ellipse]:fill-white/30 [&_path]:fill-white [&_path]:stroke-white" />
      <h3 className="font-serif text-xl">{fallbackHeadline}</h3>
      <p className="max-w-sm text-sm text-white/85">{fallbackBody}</p>
    </div>
  );
}
