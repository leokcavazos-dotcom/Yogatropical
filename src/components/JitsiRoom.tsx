"use client";

interface JitsiRoomProps {
  embedUrl: string;
  title: string;
}

export default function JitsiRoom({ embedUrl, title }: JitsiRoomProps) {
  return (
    <iframe
      src={embedUrl}
      title={title}
      allow="camera; microphone; fullscreen; display-capture; autoplay"
      className="h-[70vh] w-full rounded-2xl border border-stone-200 shadow-sm"
    />
  );
}
