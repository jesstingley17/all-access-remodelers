import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#111418] text-white py-12 border-t border-white/10" data-testid="footer">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col items-center gap-5">
          <p className="opacity-85 text-sm font-normal tracking-[0.5px]">
            &copy; 2024 All Access Remodelers. All rights reserved.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/privacy-policy"
              className="text-white/85 text-sm transition-colors duration-300 hover:text-[#C89B3C]"
              data-testid="link-privacy-policy"
            >
              Privacy Policy
            </Link>
            <span className="text-white/50">|</span>
            <Link
              href="/terms-conditions"
              className="text-white/85 text-sm transition-colors duration-300 hover:text-[#C89B3C]"
              data-testid="link-terms-conditions"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
