"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  label?: string;
  className?: string;
}

export function VideoPlayer({ src, label, className = "w-full h-full object-cover" }: VideoPlayerProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Play className="h-4 w-4 text-muted-foreground ml-0.5" />
        </div>
        {label && (
          <p className="text-xs text-muted-foreground text-center px-4">{label} sample coming soon</p>
        )}
      </div>
    );
  }

  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
