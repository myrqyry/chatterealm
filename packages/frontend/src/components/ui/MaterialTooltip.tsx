import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/ui/tooltip";
import { cn } from "@/lib/utils";

interface MaterialTooltipProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const MaterialTooltip: React.FC<MaterialTooltipProps> = ({
  title,
  children,
  className,
  side = "top",
  align = "center",
  ...props
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "bg-[rgba(25,23,36,0.95)] text-foreground",
            "border border-muted",
            "font-['JetBrains_Mono'] text-xs",
            "px-3 py-1.5",
            "shadow-lg",
            "backdrop-blur-sm",
            className
          )}
        >
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MaterialTooltip;