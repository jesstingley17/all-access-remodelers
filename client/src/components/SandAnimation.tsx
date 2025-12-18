import { cn } from "@/lib/utils";

interface SandAnimationProps {
  className?: string;
}

export function SandAnimation({ className }: SandAnimationProps) {
  return (
    <div className={cn("relative w-full h-32 overflow-hidden bg-gradient-to-b from-[#ebd4c8] to-[#d4b8a0]", className)}>
      {/* Sand texture background */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_50%,rgba(139,105,20,0.3)_2px,transparent_2px),radial-gradient(circle_at_80%_50%,rgba(160,120,40,0.3)_2px,transparent_2px)] bg-[length:40px_40px,60px_60px]" />
      
      {/* Animated sand particles */}
      <div className="absolute inset-0">
        {/* Layer 1 - Slow moving sand */}
        <div className="absolute inset-0 animate-sand-drift-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#c9a980]/60 rounded-full blur-[1px]"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${20 + (i * 3) % 60}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Layer 2 - Medium speed sand */}
        <div className="absolute inset-0 animate-sand-drift-2">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#b8956f]/50 rounded-full blur-[0.5px]"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${30 + (i * 4) % 50}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Layer 3 - Fast moving sand */}
        <div className="absolute inset-0 animate-sand-drift-3">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#a6825e]/40 rounded-full"
              style={{
                left: `${(i * 4) % 100}%`,
                top: `${40 + (i * 2) % 40}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Wind effect lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-[#8b6914]/30 to-transparent animate-wind-line"
              style={{
                left: `${(i * 12.5) % 100}%`,
                top: `${10 + (i * 10) % 80}%`,
                width: '200px',
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom sand dune effect */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#c9a980] via-[#b8956f] to-transparent" />
    </div>
  );
}

