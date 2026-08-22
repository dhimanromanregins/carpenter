import { AnimatedText } from "./AnimatedText";
import { RevealOnScroll } from "./RevealOnScroll";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
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
        as="h2"
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
