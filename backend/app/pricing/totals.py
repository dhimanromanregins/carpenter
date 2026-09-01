from sqlalchemy.orm import Session

from app.pricing.lookups import get_setting
from app.schemas.quotation_v1 import QuoteLineItem


def compute_totals(db: Session, line_items: list[QuoteLineItem]) -> tuple[float, float, float, float]:
    installation_pct = float(get_setting(db, "installation_pct", 0.10))
    tax_pct = float(get_setting(db, "tax_pct", 0.18))

    subtotal = round(sum(item.subtotal for item in line_items), 2)
    installation = round(subtotal * installation_pct, 2)
    tax = round((subtotal + installation) * tax_pct, 2)
    total = round(subtotal + installation + tax, 2)

    return subtotal, installation, tax, total
