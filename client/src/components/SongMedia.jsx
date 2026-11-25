import { useState } from "react";
import { Music2 } from "lucide-react";
import { formatDuration } from "../lib/format";

export function SongMedia({ song, subtitle, meta, className = "" }) {
  const [failed, setFailed] = useState(false);
  const image = song?.imageLarge || song?.image;
  const fallbackSubtitle = [song?.artist, song?.album].filter(Boolean).join(" · ") || "—";

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet-500/20 to-cyan-400/10">
        {image && !failed ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <Music2 className="h-4 w-4 text-violet-300" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">
          {song?.title || meta || "Unknown track"}
        </p>
        <p className="truncate text-[11px] text-default-500">
          {subtitle || fallbackSubtitle}
        </p>
      </div>
      {song?.duration ? (
        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-default-600">
          {formatDuration(song.duration)}
        </span>
      ) : null}
    </div>
  );
}
