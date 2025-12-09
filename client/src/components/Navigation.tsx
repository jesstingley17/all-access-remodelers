import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-[#1a3a5c]/8 shadow-sm" data-testid="nav-main">
      <div className="max-w-[1200px] mx-auto px-5 py-5">
        <div className="flex justify-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[#1a3a5c] font-medium text-[0.95rem] uppercase tracking-[1px] py-2 relative transition-colors duration-300",
                location === link.href
                  ? "text-[#ff6b35] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#ff6b35]"
                  : "hover:text-[#ff6b35]"
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
