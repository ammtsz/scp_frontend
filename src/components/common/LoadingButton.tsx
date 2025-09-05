import React from "react";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText = "Carregando...",
  variant = "primary",
  children,
  disabled,
  className = "",
  ...props
}) => {
  const baseClasses = "button";
  const variantClasses = {
    primary: "button-primary",
    secondary: "button-secondary",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

export default LoadingButton;
