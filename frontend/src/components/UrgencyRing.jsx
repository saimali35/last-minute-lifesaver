import { getUrgencyHex } from "../utils/helpers";

export default function UrgencyRing({ score, size = 48 }) {
  const color = getUrgencyHex(score);
  const r     = (size - 6) / 2;
  const circ  = 2 * Math.PI * r;
  const dash  = ((score / 10)) * circ;

  return (
    <svg
      width={size}
      height={size}
      className="flex-shrink-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#242E42" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "all 0.4s ease" }}
      />
      <text
        x={size/2} y={size/2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill={color}
        fontSize={size * 0.28}
        fontWeight="700"
        fontFamily="Space Grotesk, sans-serif"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}
      >
        {score}
      </text>
    </svg>
  );
}