import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  onClick,
  className = "",
}: ButtonProps) => {
  const base =
    "font-medium rounded-lg transition-colors flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary:
      "bg-bg-card text-text-primary hover:bg-bg-secondary border border-custom",
    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </button>
  );
};
