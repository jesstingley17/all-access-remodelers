import { Link } from "wouter";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="bg-white py-10 pb-12 shadow-sm relative z-40" data-testid="header">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center animate-fade-in-down">
          <Link href="/">
            <div className="inline-block cursor-pointer transition-transform duration-400 hover:-translate-y-0.5" data-testid="link-logo">
              <Logo 
                className="mx-auto mb-7 drop-shadow-md" 
                width={240} 
                height={180} 
              />
            </div>
          </Link>
          <h1 className="text-[2.5rem] font-bold text-[#111418] mb-3.5 tracking-[4px] uppercase leading-tight animate-fade-in-up">
            ALL ACCESS REMODELERS
          </h1>
          <p className="text-[0.95rem] text-[#4a4a4a] tracking-[3px] font-medium uppercase opacity-90 animate-fade-in-up-delay">
            CONSTRUCTION | PROPERTY MANAGEMENT | CLEANING
          </p>
        </div>
      </div>
    </header>
  );
}
