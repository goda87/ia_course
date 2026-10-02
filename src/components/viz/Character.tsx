/** Personaje de ejemplo (un zorro de dibujos animados) usado en las ilustraciones de difusión y animación. */
export interface CharacterProps {
  color?: string;
  ears?: "pointy" | "round";
  /** Ángulo del brazo derecho en grados: 0 = abajo, 150 = levantado */
  arm?: number;
  /** Ángulo del brazo izquierdo */
  armLeft?: number;
  hat?: string | null;
  line?: "clean" | "bold" | "sketch";
  /** Paleta plana sin sombreado (estilo del estudio) */
  flat?: boolean;
  eyes?: "open" | "happy";
  className?: string;
}

export default function Character({
  color = "#f97316",
  ears = "pointy",
  arm = 20,
  armLeft = -20,
  hat = null,
  line = "clean",
  flat = false,
  eyes = "open",
  className = "h-full w-auto",
}: CharacterProps) {
  const sw = line === "bold" ? 3.2 : line === "sketch" ? 1.2 : 1.8;
  const stroke = "#1c1b19";
  const dash = line === "sketch" ? "3 2" : undefined;
  const common = {
    stroke,
    strokeWidth: sw,
    strokeDasharray: dash,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  const fill = line === "sketch" ? "none" : color;
  const belly = line === "sketch" ? "none" : "#fff7ed";

  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      {/* brazos */}
      <g transform={`rotate(${-armLeft} 36 70)`}>
        <rect x="31" y="68" width="10" height="26" rx="5" fill={fill} {...common} />
      </g>
      <g transform={`rotate(${-arm} 64 70)`}>
        <rect x="59" y="68" width="10" height="26" rx="5" fill={fill} {...common} />
      </g>
      {/* cuerpo */}
      <ellipse cx="50" cy="88" rx="18" ry="22" fill={fill} {...common} />
      <ellipse cx="50" cy="92" rx="10" ry="14" fill={belly} {...common} strokeWidth={sw * 0.6} />
      {/* orejas */}
      {ears === "pointy" ? (
        <>
          <path d="M28 30 L24 6 L44 22 Z" fill={fill} {...common} />
          <path d="M72 30 L76 6 L56 22 Z" fill={fill} {...common} />
        </>
      ) : (
        <>
          <circle cx="29" cy="18" r="10" fill={fill} {...common} />
          <circle cx="71" cy="18" r="10" fill={fill} {...common} />
        </>
      )}
      {/* cabeza */}
      <circle cx="50" cy="40" r="24" fill={fill} {...common} />
      {!flat && line !== "sketch" && (
        <ellipse cx="42" cy="32" rx="8" ry="5" fill="#ffffff" opacity="0.25" />
      )}
      <ellipse cx="50" cy="50" rx="12" ry="9" fill={belly} {...common} strokeWidth={sw * 0.6} />
      {/* cara */}
      {eyes === "open" ? (
        <>
          <circle cx="41" cy="38" r="3" fill={stroke} />
          <circle cx="59" cy="38" r="3" fill={stroke} />
        </>
      ) : (
        <>
          <path
            d="M37 39 Q41 34 45 39"
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d="M55 39 Q59 34 63 39"
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}
      <circle cx="50" cy="47" r="2.6" fill={stroke} />
      <path
        d="M45 52 Q50 56 55 52"
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {/* sombrero */}
      {hat && (
        <>
          <rect x="30" y="14" width="40" height="5" rx="2" fill={hat} {...common} />
          <rect x="38" y="0" width="24" height="16" rx="3" fill={hat} {...common} />
        </>
      )}
    </svg>
  );
}
