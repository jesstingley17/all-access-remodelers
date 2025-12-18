import { cn } from "@/lib/utils";

interface EgyptianFriezeProps {
  className?: string;
}

export function EgyptianFrieze({ className }: EgyptianFriezeProps) {
  return (
    <div
      className={cn(
        "h-16 md:h-20 bg-gradient-to-b from-[#d4af37] via-[#c9a227] to-[#b8951f] border-y-2 border-[#8b6914] shadow-lg relative overflow-hidden",
        className
      )}
    >
      {/* Gold texture overlay */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_50%,rgba(244,208,63,0.4)_1px,transparent_1px),radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.3)_1px,transparent_1px)] bg-[length:12px_12px,16px_16px]" />
      
      {/* Hieroglyphic pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-4 md:gap-6 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              {/* Hieroglyphic-like symbols */}
              <div className="w-3 h-6 md:w-4 md:h-8 bg-[#6b5010]/60 rounded-sm" />
              <div className="w-4 h-2 md:w-5 md:h-2.5 bg-[#6b5010]/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Top border detail with sun ray effect */}
      <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-[#f4d03f]/60 via-[#d4af37]/40 to-transparent">
        <div className="absolute inset-x-0 top-0 flex justify-between px-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-0.5 h-full bg-[#8b6914]/60" />
          ))}
        </div>
      </div>
      
      {/* Bottom border detail */}
      <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-[#8b6914]/50 via-[#6b5010]/40 to-transparent">
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#f4d03f]/30" />
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f4d03f]/20 to-transparent animate-shimmer" />
    </div>
  );
}

