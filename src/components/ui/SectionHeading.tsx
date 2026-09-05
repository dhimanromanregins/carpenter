import { AnimatedText } from "./AnimatedText";
import { RevealOnScroll } from "./RevealOnScroll";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Heading level for `title` — defaults to h2. Use h1 only on pages that have no other h1. */
  headingLevel?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  headingLevel = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <RevealOnScroll>
          <span className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-8 bg-gold" />
            {eyebrow}
          </span>
        </RevealOnScroll>
      )}
      <AnimatedText
        as={headingLevel}
        text={title}
        by="word"
        className="text-4xl leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl"
      />
      {description && (
        <RevealOnScroll delay={0.2}>
          <p className="max-w-xl text-base leading-relaxed text-grey md:text-lg">
            {description}
          </p>
        </RevealOnScroll>
      )}
    </div>
  );
}
