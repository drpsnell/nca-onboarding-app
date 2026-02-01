export type VoicePanelProps = {
  supported: boolean;
  listening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  compact?: boolean;
};

export default function VoicePanel({
  supported,
  listening,
  transcript,
  start,
  stop,
  reset,
  compact,
}: VoicePanelProps) {
  return (
    <div className={`rounded-xl border border-black/10 dark:border-white/15 p-3 ${compact ? "" : "bg-white dark:bg-[#0f0f0f]"}`}>
      <div className="flex items-center gap-2">
        <button onClick={start} disabled={!supported || listening} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 disabled:opacity-50">Start</button>
        <button onClick={stop} disabled={!supported || !listening} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15 disabled:opacity-50">Stop</button>
        <button onClick={reset} className="h-9 px-3 rounded-lg border border-black/10 dark:border-white/15">Reset</button>
        <div className="text-sm text-black/60 dark:text-white/60 ml-auto">{supported ? (listening ? "Listening\u2026" : "Idle") : "Voice not supported"}</div>
      </div>
      {!compact && (
        <div className="mt-2 text-sm text-black/70 dark:text-white/70 whitespace-pre-wrap min-h-6">
          {transcript}
        </div>
      )}
    </div>
  );
}
