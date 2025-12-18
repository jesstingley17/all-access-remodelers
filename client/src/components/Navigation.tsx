import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/quote-estimator", label: "Get Estimate" },
  { href: "/maintenance-request", label: "Maintenance Request" },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-gradient-to-b from-[#f4d03f]/15 via-[#d4af37]/10 to-[#c9a227]/15 sticky top-0 z-50 border-b-2 border-[#b8951f]/40 shadow-lg" data-testid="nav-main">
      <div className="max-w-[1200px] mx-auto px-5 py-5">
        <div className="flex justify-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[#6b5010] font-medium text-[0.95rem] uppercase tracking-[1px] py-2 relative transition-colors duration-300",
                location === link.href
                  ? "text-[#d4af37] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d4af37] drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]"
                  : "hover:text-[#d4af37]"
              )}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
