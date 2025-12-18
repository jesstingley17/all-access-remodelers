import { Link } from "wouter";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="bg-gradient-to-b from-[#f4d03f]/20 via-[#d4af37]/10 to-[#c9a227]/20 py-10 pb-12 shadow-lg relative z-40 border-y-2 border-[#b8951f]/40" data-testid="header">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center animate-fade-in-down">
          <Link href="/">
            <div className="inline-block cursor-pointer transition-transform duration-400 hover:-translate-y-0.5" data-testid="link-logo">
              <Logo 
                className="mx-auto mb-7 drop-shadow-lg" 
                width={240} 
                height={180} 
              />
            </div>
          </Link>
          <div className="relative inline-block">
            <h1 className="text-[2.5rem] font-bold text-[#8b6914] mb-3.5 tracking-[4px] uppercase leading-tight animate-fade-in-up relative z-10 drop-shadow-[2px_2px_4px_rgba(212,175,55,0.3)]">
              ALL ACCESS REMODELERS
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-[#f4d03f]/20 via-transparent to-[#f4d03f]/20 blur-xl" />
          </div>
          <p className="text-[0.95rem] text-[#6b5010] tracking-[3px] font-medium uppercase opacity-90 animate-fade-in-up-delay">
            CONSTRUCTION | PROPERTY MANAGEMENT | CLEANING
          </p>
        </div>
      </div>
    </header>
  );
}
