import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  active = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        // Base styles
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",

        // Size variants
        {
          "px-3 py-2 text-sm": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },

        // Color variants
        {
          "bg-blue-600 text-white hover:bg-blue-700":
            variant === "primary" && !active,
          "bg-blue-700 text-white": variant === "primary" && active,
          "bg-gray-100 text-gray-900 hover:bg-gray-200":
            variant === "secondary" && !active,
          "bg-gray-200 text-gray-900": variant === "secondary" && active,
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50":
            variant === "outline" && !active,
          "border border-blue-500 bg-blue-50 text-blue-700":
            variant === "outline" && active,
          "text-gray-700 hover:bg-gray-100": variant === "ghost" && !active,
          "text-blue-700 bg-blue-50": variant === "ghost" && active,
        },

        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
