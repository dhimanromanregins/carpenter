import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      {children}
    </div>
  );
}
