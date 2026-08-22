import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps {
  label: string;
  name: string;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
}

export function FloatingInput({
  label,
  name,
  type = "text",
  as = "input",
  required = false,
}: FloatingInputProps) {
  const id = useId();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const sharedProps = {
    id,
    name,
    required,
    value,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setValue(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className:
      "peer w-full border-b border-grey/30 bg-transparent pb-3 pt-6 text-cream outline-none transition-colors focus:border-gold",
  };

  return (
    <div className="relative">
      {as === "textarea" ? (
        <textarea rows={4} {...sharedProps} />
      ) : (
        <input type={type} {...sharedProps} />
      )}
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 top-6 text-grey transition-all duration-300",
          active
            ? "-translate-y-4 text-xs text-gold"
            : "translate-y-0 text-base"
        )}
      >
        {label}
      </label>
    </div>
  );
}
