import { Link } from "wouter";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="bg-gradient-to-b from-white via-[#faf9f7] to-white py-10 pb-12 shadow-lg relative z-40 border-y-2 border-[#c89b3c]/20" data-testid="header">
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
            <h1 className="text-[2.5rem] font-bold text-[#2d1f0f] mb-3.5 tracking-[4px] uppercase leading-tight animate-fade-in-up relative z-10">
              ALL ACCESS REMODELERS
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-[#c89b3c]/10 via-transparent to-[#c89b3c]/10 blur-xl" />
          </div>
          <p className="text-[0.95rem] text-[#5a4a3a] tracking-[3px] font-medium uppercase opacity-90 animate-fade-in-up-delay">
            CONSTRUCTION | PROPERTY MANAGEMENT | CLEANING
          </p>
        </div>
      </div>
    </header>
  );
}
