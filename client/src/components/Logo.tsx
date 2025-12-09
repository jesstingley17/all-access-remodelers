import logoImage from "@assets/logo.jpg";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 200, height = 150 }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt="All Access Remodelers - Construction | Property Management | Cleaning"
      className={className}
      width={width}
      height={height}
      style={{ objectFit: "contain" }}
    />
  );
}
