import { cn } from "@/lib/utils";

interface PillarProps {
  className?: string;
  variant?: "left" | "right" | "center";
  height?: "full" | "auto";
}

export function Pillar({ className, variant = "center", height = "full" }: PillarProps) {
  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-16 md:w-20",
        height === "full" ? "h-full" : "h-auto",
        className
      )}
    >
      {/* Pillar shaft */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8e6e3] via-[#f5f3f0] to-[#e8e6e3] border-x-2 border-[#c9c5be] shadow-inner">
        {/* Vertical grooves/flutes */}
        <div className="absolute inset-0 flex justify-between px-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-px bg-gradient-to-b from-transparent via-[#d4d0c9]/40 to-transparent"
            />
          ))}
        </div>
      </div>

      {/* Capital (top decorative element) */}
      <div className="absolute top-0 left-0 right-0 h-8 md:h-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4a574] via-[#c89b3c] to-[#b88a2c] border-x-2 border-[#8b6f2a] shadow-md">
          {/* Capital decorative details */}
          <div className="absolute inset-x-0 top-0 h-2 bg-[#8b6f2a]/30" />
          <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-[#8b6f2a]/40 to-transparent" />
        </div>
      </div>

      {/* Base (bottom decorative element) */}
      <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[#8b6f2a] via-[#b88a2c] to-[#c89b3c] border-x-2 border-[#8b6f2a] shadow-md">
          <div className="absolute inset-x-0 top-0 h-2 bg-[#8b6f2a]/30" />
        </div>
      </div>
    </div>
  );
}

interface PillarLayoutProps {
  children: React.ReactNode;
  className?: string;
  showPillars?: boolean;
}

export function PillarLayout({ children, className, showPillars = true }: PillarLayoutProps) {
  if (!showPillars) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Left pillar */}
      <Pillar className="fixed left-0 top-0 bottom-0 z-10 hidden lg:block" variant="left" />
      
      {/* Right pillar */}
      <Pillar className="fixed right-0 top-0 bottom-0 z-10 hidden lg:block" variant="right" />
      
      {/* Content area with padding for pillars */}
      <div className="relative z-0 lg:ml-16 lg:mr-16 xl:ml-20 xl:mr-20">
        {children}
      </div>
    </div>
  );
}

