export default function RegionIllustration({
  region,
  difficulty,
}: {
  region: string;
  difficulty: string;
}) {
  const gradientId = `gradient-${region}-${difficulty}`;
  const gradientColors: Record<string, [string, string]> = {
    easy: ["#22c55e", "#16a34a"],
    intermediate: ["#eab308", "#ca8a04"],
    advanced: ["#ef4444", "#dc2626"],
    beginner: ["#22c55e", "#16a34a"],
  };
  const [from, to] = gradientColors[difficulty] ?? ["#6b7280", "#4b5563"];

  if (region === "lower_quarter") {
    return (
      <svg viewBox="0 0 80 120" className="w-16 h-24 opacity-20" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        {/* Spine */}
        <rect x="37" y="0" width="6" height="60" rx="3" fill={`url(#${gradientId})`} />
        {/* L1-L5 vertebral bodies */}
        {[10, 20, 30, 40, 50].map((y, i) => (
          <rect key={i} x="30" y={y} width="20" height="6" rx="2" fill={`url(#${gradientId})`} opacity={0.7} />
        ))}
        {/* Pelvis */}
        <path d="M15 55 Q20 75 40 80 Q60 75 65 55 Q55 65 40 68 Q25 65 15 55Z" fill={`url(#${gradientId})`} opacity={0.5} />
        {/* Sacrum */}
        <path d="M32 60 L40 80 L48 60Z" fill={`url(#${gradientId})`} opacity={0.6} />
        {/* Femoral heads */}
        <circle cx="25" cy="82" r="6" fill={`url(#${gradientId})`} opacity={0.4} />
        <circle cx="55" cy="82" r="6" fill={`url(#${gradientId})`} opacity={0.4} />
        {/* Femurs */}
        <rect x="22" y="88" width="6" height="30" rx="3" fill={`url(#${gradientId})`} opacity={0.3} />
        <rect x="52" y="88" width="6" height="30" rx="3" fill={`url(#${gradientId})`} opacity={0.3} />
      </svg>
    );
  }

  // Upper quarter
  return (
    <svg viewBox="0 0 100 120" className="w-16 h-24 opacity-20" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      {/* Cervical spine */}
      <rect x="47" y="0" width="6" height="35" rx="3" fill={`url(#${gradientId})`} />
      {/* C-spine vertebral bodies */}
      {[5, 12, 19, 26].map((y, i) => (
        <rect key={i} x="42" y={y} width="16" height="4" rx="2" fill={`url(#${gradientId})`} opacity={0.7} />
      ))}
      {/* Skull base */}
      <ellipse cx="50" cy="3" rx="14" ry="6" fill={`url(#${gradientId})`} opacity={0.3} />
      {/* T-spine */}
      <rect x="47" y="35" width="6" height="40" rx="3" fill={`url(#${gradientId})`} opacity={0.5} />
      {/* Shoulders */}
      <path d="M42 38 Q30 36 15 44 L15 50 Q30 42 42 44Z" fill={`url(#${gradientId})`} opacity={0.4} />
      <path d="M58 38 Q70 36 85 44 L85 50 Q70 42 58 44Z" fill={`url(#${gradientId})`} opacity={0.4} />
      {/* Scapulae */}
      <ellipse cx="30" cy="55" rx="10" ry="16" fill={`url(#${gradientId})`} opacity={0.25} />
      <ellipse cx="70" cy="55" rx="10" ry="16" fill={`url(#${gradientId})`} opacity={0.25} />
      {/* Arms */}
      <rect x="12" y="50" width="5" height="35" rx="2.5" fill={`url(#${gradientId})`} opacity={0.2} />
      <rect x="83" y="50" width="5" height="35" rx="2.5" fill={`url(#${gradientId})`} opacity={0.2} />
    </svg>
  );
}
