import { useEffect, useState } from "react";

interface NumericFieldProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  // For a field whose value gets recomputed from *other* state on every
  // change (e.g. total area re-deriving length/width) — committing on every
  // keystroke makes it fight the user's typing, since each digit can trigger
  // a round-trip that jumps to an unrelated number. Deferring the commit to
  // blur/Enter lets them finish typing the number they meant first.
  commitOnBlur?: boolean;
}

// Whole numbers only — no decimal point, no minus sign. Rejecting anything
// else at the keystroke keeps stray characters (including ".") from ever
// landing in the field.
const WHOLE_NUMBER = /^\d*$/;

/**
 * A plain-text whole-number input (no native spinner arrows, no
 * `type="number"` quirks, no decimal point) that still round-trips a real
 * `number | undefined` to the caller.
 *
 * The raw text is kept in local state, separate from the parsed number sent
 * upward, and only gets overwritten when the external `value` changes for a
 * reason other than this input's own typing (e.g. a sibling field reset).
 */
export function NumericField({ value, onChange, placeholder, className, commitOnBlur }: NumericFieldProps) {
  const [text, setText] = useState(value === undefined ? "" : String(value));

  useEffect(() => {
    setText(value === undefined ? "" : String(value));
  }, [value]);

  const commit = (next: string) => onChange(next === "" ? undefined : Number(next));

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value;
        if (!WHOLE_NUMBER.test(next)) return;
        setText(next);
        if (!commitOnBlur) commit(next);
      }}
      onBlur={() => {
        if (commitOnBlur) commit(text);
      }}
      onKeyDown={(e) => {
        if (commitOnBlur && e.key === "Enter") e.currentTarget.blur();
      }}
      onFocus={(e) => e.target.select()}
      className={className}
    />
  );
}
