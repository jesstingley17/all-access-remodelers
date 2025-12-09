interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 240, height = 180 }: LogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="200,50 120,100 200,100" fill="#111418" />
      <polygon points="200,50 200,100 280,100" fill="#2C2C2C" />
      <rect x="120" y="100" width="160" height="120" fill="#2C2C2C" />
      <rect x="120" y="100" width="60" height="120" fill="#111418" />
      <rect x="120" y="180" width="20" height="40" fill="#C89B3C" />
      <polygon points="180,120 200,110 220,120 220,140 200,150 180,140" fill="#2C2C2C" />
      <rect x="190" y="125" width="20" height="20" fill="#C89B3C" />
      <line x1="200" y1="125" x2="200" y2="145" stroke="#111418" strokeWidth="1.5" />
      <line x1="190" y1="135" x2="210" y2="135" stroke="#111418" strokeWidth="1.5" />
      <rect x="220" y="140" width="60" height="20" fill="#2C2C2C" />
      <rect x="270" y="145" width="20" height="10" fill="#2C2C2C" />
      <rect x="280" y="80" width="8" height="140" fill="#111418" />
      <path d="M 288 220 L 320 240 L 320 260 L 288 240 Z" fill="#C89B3C" />
      <path d="M 288 230 L 315 245 L 315 265 L 288 245 Z" fill="#C89B3C" />
      <path d="M 288 240 L 310 250 L 310 270 L 288 250 Z" fill="#C89B3C" />
    </svg>
  );
}
