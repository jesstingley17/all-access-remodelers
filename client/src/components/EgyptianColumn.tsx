import { cn } from "@/lib/utils";

interface EgyptianColumnProps {
  className?: string;
  variant?: "left" | "right" | "center";
  height?: "full" | "auto";
}

export function EgyptianColumn({ className, variant = "center", height = "full" }: EgyptianColumnProps) {
  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-16 md:w-20",
        height === "full" ? "h-full" : "h-auto",
        className
      )}
    >
      {/* Column shaft with hieroglyphic texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37] via-[#c9a227] to-[#b8951f] border-x-2 border-[#8b6914] shadow-inner">
        {/* Textured pattern overlay */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(139,105,20,0.3)_1px,transparent_1px)] bg-[length:8px_8px]" />
        
        {/* Hieroglyphic-like vertical lines */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-gradient-to-b from-[#8b6914]/60 via-[#6b5010]/40 to-[#8b6914]/60"
            />
          ))}
        </div>

        {/* Gold texture highlights */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f4d03f]/20 to-transparent" />
      </div>

      {/* Capital (Egyptian style - lotus or papyrus) */}
      <div className="absolute top-0 left-0 right-0 h-10 md:h-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4d03f] via-[#d4af37] to-[#c9a227] border-x-2 border-[#8b6914] shadow-lg">
          {/* Capital decorative pattern */}
          <div className="absolute inset-x-0 top-0 h-3 bg-[#8b6914]/40" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#8b6914]/50 to-transparent">
            {/* Lotus-like pattern */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-3 bg-[#6b5010]/60 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[#8b6914] via-[#b8951f] to-[#c9a227] border-x-2 border-[#6b5010] shadow-lg">
          <div className="absolute inset-x-0 top-0 h-2 bg-[#6b5010]/50" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#f4d03f]/30" />
        </div>
      </div>
    </div>
  );
}

interface EgyptianLayoutProps {
  children: React.ReactNode;
  className?: string;
  showColumns?: boolean;
}

export function EgyptianLayout({ children, className, showColumns = true }: EgyptianLayoutProps) {
  if (!showColumns) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative min-h-screen bg-gradient-to-b from-[#f5e6d3] via-[#f0ddd0] to-[#ebd4c8]", className)}>
      {/* Left column */}
      <EgyptianColumn className="fixed left-0 top-0 bottom-0 z-10 hidden lg:block" variant="left" />
      
      {/* Right column */}
      <EgyptianColumn className="fixed right-0 top-0 bottom-0 z-10 hidden lg:block" variant="right" />
      
      {/* Content area with padding for columns */}
      <div className="relative z-0 lg:ml-16 lg:mr-16 xl:ml-20 xl:mr-20">
        {children}
      </div>
    </div>
  );
}

