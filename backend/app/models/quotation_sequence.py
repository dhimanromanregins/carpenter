from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class QuotationSequence(Base):
    """Backs quotation-number generation (QT-{year}-{seq:06d}). One row per
    year, incremented transactionally under a row lock — never derived by
    counting existing Quotation rows, which is race-prone under concurrent
    saves and would regress if a row were ever deleted."""

    __tablename__ = "quotation_sequences"

    year: Mapped[int] = mapped_column(primary_key=True)
    last_seq: Mapped[int] = mapped_column(default=0)
