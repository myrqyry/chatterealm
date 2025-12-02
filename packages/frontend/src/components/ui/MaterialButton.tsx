import React from 'react';
import { Button } from "@/components/ui/ui/button";
import { cn } from "@/lib/utils";

interface MaterialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  loading?: boolean;
  children: React.ReactNode;
  size?: "default" | "sm" | "lg" | "icon";
}

const MaterialButton = React.forwardRef<HTMLButtonElement, MaterialButtonProps>(({
  variant = "default",
  loading = false,
  disabled,
  children,
  className,
  size = "default",
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      disabled={disabled || loading}
      className={cn(
        "font-['JetBrains_Mono'] font-medium text-sm",
        loading && "relative",
        className
      )}
      size={size}
      {...props}
    >
      {loading && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <span className={cn(loading && "invisible")}>
        {children}
      </span>
    </Button>
  );
});

MaterialButton.displayName = 'MaterialButton';

export default MaterialButton;