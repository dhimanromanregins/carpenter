import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIsCoarsePointer } from "@/hooks/useMediaQuery";

export function CustomCursor() {
  const isCoarse = useIsCoarsePointer();
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 });

  useEffect(() => {
    if (isCoarse) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor]"
      );
      if (target) {
        setIsHovering(true);
        setCursorText(target.dataset.cursor ?? "");
      } else {
        setIsHovering(false);
        setCursorText("");
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [isCoarse, isVisible, x, y]);

  if (isCoarse) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden
    >
      <motion.div
        className="fixed left-0 top-0 rounded-full bg-cream"
        style={{
          x,
          y,
          width: 8,
          height: 8,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-cream text-center text-[10px] uppercase tracking-widest text-cream"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 90 : 36,
          height: isHovering ? 90 : 36,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {cursorText}
      </motion.div>
    </div>
  );
}
