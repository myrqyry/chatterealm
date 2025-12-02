import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/ui/card";
import { cn } from "@/lib/utils";

interface MaterialCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  title,
  subtitle,
  children,
  className
}) => {
  return (
    <Card className={cn(
      "rounded-xl border bg-background text-foreground shadow-sm",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      {(title || subtitle) && (
        <CardHeader className="flex flex-col space-y-1.5 p-4 pb-2">
          {title && (
            <CardTitle className="font-['JetBrains_Mono'] font-semibold text-lg">
              {title}
            </CardTitle>
          )}
          {subtitle && (
            <CardDescription className="font-['JetBrains_Mono'] text-sm text-muted-foreground">
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        "p-4",
        (title || subtitle) ? "pt-0" : "pt-4"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MaterialCard;