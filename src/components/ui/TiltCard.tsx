import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useIsCoarsePointer } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
}

export function TiltCard({ children, className, tiltStrength = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isCoarse = useIsCoarsePointer();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.4 };
  const rotateX = useSpring(
    useTransform(y, [0, 1], [tiltStrength, -tiltStrength]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(x, [0, 1], [-tiltStrength, tiltStrength]),
    springConfig
  );
  const scale = useSpring(1, springConfig);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCoarse) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleEnter = () => {
    if (isCoarse) return;
    scale.set(1.03);
  };

  const handleLeave = () => {
    if (isCoarse) return;
    x.set(0.5);
    y.set(0.5);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 800 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
