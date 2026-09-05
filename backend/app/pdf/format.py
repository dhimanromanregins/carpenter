_ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
]
_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]


def format_inr(amount: float) -> str:
    """Rs. with Indian digit grouping (lakh/crore), e.g. 8753000 -> 'Rs. 87,53,000'."""
    value = int(round(amount))
    sign = "-" if value < 0 else ""
    digits = str(abs(value))

    if len(digits) <= 3:
        grouped = digits
    else:
        last3, rest = digits[-3:], digits[:-3]
        parts = []
        while len(rest) > 2:
            parts.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            parts.insert(0, rest)
        grouped = ",".join(parts) + "," + last3

    return f"{sign}Rs. {grouped}"


def _two_digit_words(n: int) -> str:
    if n < 20:
        return _ONES[n]
    tens, ones = divmod(n, 10)
    return _TENS[tens] + (f"-{_ONES[ones]}" if ones else "")


def _three_digit_words(n: int) -> str:
    hundreds, rest = divmod(n, 100)
    parts = []
    if hundreds:
        parts.append(f"{_ONES[hundreds]} Hundred")
    if rest:
        parts.append(_two_digit_words(rest))
    return " ".join(parts) if parts else "Zero"


def amount_in_words_approx(amount: float) -> str:
    """Largest-unit approximation in words (e.g. 'Eighty-Seven Lakh'),
    matching the business's own quotation convention of rounding the
    grand total down to its dominant Indian magnitude for the summary line."""
    value = int(round(amount))
    if value >= 1_00_00_000:
        unit_value, unit_label = 1_00_00_000, "Crore"
    elif value >= 1_00_000:
        unit_value, unit_label = 1_00_000, "Lakh"
    elif value >= 1_000:
        unit_value, unit_label = 1_000, "Thousand"
    else:
        unit_value, unit_label = 1, ""

    count = value // unit_value
    return f"{_three_digit_words(count)} {unit_label}".strip()
