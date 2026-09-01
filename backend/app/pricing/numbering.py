from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import QuotationSequence


def generate_quotation_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    row = db.get(QuotationSequence, year, with_for_update=True)
    if row is None:
        row = QuotationSequence(year=year, last_seq=0)
        db.add(row)
        db.flush()
    row.last_seq += 1
    db.flush()
    return f"QT-{year}-{row.last_seq:06d}"
