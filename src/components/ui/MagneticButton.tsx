import { useRef, type ReactNode, type MouseEventHandler } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  strength?: number;
  className?: string;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
  "data-cursor"?: string;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className,
  variant = "outline",
  strength = 0.4,
  type = "button",
  onClick,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.2 });

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm tracking-wide uppercase font-medium overflow-hidden transition-colors duration-300";

  const variants = {
    solid: "bg-gold text-ink hover:bg-gold-light",
    outline: "border border-gold/50 text-cream hover:border-gold",
    ghost: "text-cream hover:text-gold",
  };

  return (
    <motion.button
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.95 }}
      className={cn(base, variants[variant], className)}
      type={type}
      onClick={onClick}
      {...props}
    >
      <span className="pointer-events-none">{children}</span>
    </motion.button>
  );
}
