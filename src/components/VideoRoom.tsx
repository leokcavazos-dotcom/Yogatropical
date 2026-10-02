import type { VideoJoin } from "@/lib/video";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** The embedded video call (Daily's built-in screen, with its own camera and microphone check). */
export default function VideoRoom({ join, title, t }: { join: VideoJoin; title: string; t: Dictionary["room"] }) {
  return (
    <div className="space-y-3">
      {join.recorded && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-200">{t.recorded}</p>}
      {join.provider === "jitsi-test" && (
        <p className="rounded-lg bg-sunset/15 px-4 py-2 text-sm text-sunset">{t.testMode}</p>
      )}
      <iframe
        src={join.url}
        title={title}
        allow="camera; microphone; fullscreen; display-capture; autoplay; speaker-selection"
        className="h-[75vh] min-h-[420px] w-full rounded-2xl border border-line bg-black shadow-sm"
      />
      <p className="text-xs text-foreground/50">{t.cameraTip}</p>
    </div>
  );
}
