import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  by?: "word" | "letter";
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  once?: boolean;
}

export function AnimatedText({
  text,
  className,
  by = "word",
  delay = 0,
  stagger = 0.05,
  as = "span",
  once = true,
}: AnimatedTextProps) {
  const components = {
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    p: motion.p,
    span: motion.span,
  } as const;
  const Component = components[as];
  const units = by === "word" ? text.split(" ") : text.split("");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: {
      y: "110%",
      opacity: 0,
      rotateZ: 4,
    },
    visible: {
      y: "0%",
      opacity: 1,
      rotateZ: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <Component
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      variants={container}
      aria-label={text}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ verticalAlign: "top" }}
        >
          <motion.span variants={child} className="inline-block">
            {unit === " " ? " " : unit}
            {by === "word" && i !== units.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
