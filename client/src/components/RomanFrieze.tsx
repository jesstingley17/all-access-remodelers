import { cn } from "@/lib/utils";

interface RomanFriezeProps {
  className?: string;
  pattern?: "scroll" | "acanthus" | "meander";
}

export function RomanFrieze({ className, pattern = "meander" }: RomanFriezeProps) {
  return (
    <div
      className={cn(
        "h-16 md:h-20 bg-gradient-to-b from-[#c89b3c] via-[#b88a2c] to-[#8b6f2a] border-y-2 border-[#6b5721] shadow-lg relative overflow-hidden",
        className
      )}
    >
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        {pattern === "meander" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="100%" height="100%" className="text-[#6b5721]">
              <pattern
                id="meander"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0,30 L15,30 L15,15 L30,15 L30,30 L45,30 L45,45 L30,45 L30,60 L15,60 L15,45 L0,45 Z M60,30 L45,30 L45,45 L30,45 L30,30 L15,30 L15,15 L30,15 L30,30 L45,30 L45,15 L60,15 Z"
                  fill="currentColor"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#meander)" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Top border detail */}
      <div className="absolute inset-x-0 top-0 h-2 bg-[#6b5721]/50" />
      {/* Bottom border detail */}
      <div className="absolute inset-x-0 bottom-0 h-2 bg-[#6b5721]/50" />
    </div>
  );
}

