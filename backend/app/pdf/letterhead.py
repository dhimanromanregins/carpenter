import os
from functools import partial

from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import Image

INK = colors.HexColor("#141414")
GOLD = colors.HexColor("#C9A24B")
GREY = colors.HexColor("#6B6B6B")

LOGO_PATH = os.path.join(os.path.dirname(__file__), "assets", "logo.png")
LOGO_ASPECT = 500 / 1000  # height / width of the source logo file

COMPANY_ADDRESS = "Highland Marg, Highway, Patiala, Zirakpur, Punjab 140603"
COMPANY_PHONE = "+91 70185 95304"
COMPANY_EMAIL = "contact@dhimaninteriors.in"


def build_header_image() -> Image:
    """Full logo lockup (mark + wordmark + tagline), used at the top of every
    quotation PDF. The logo file already carries the brand name and tagline,
    so no separate text header is needed alongside it."""
    width = 62 * mm
    return Image(LOGO_PATH, width=width, height=width * LOGO_ASPECT, hAlign="LEFT")


def _draw_footer(canvas, doc, quotation_number: str) -> None:
    canvas.saveState()
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.8)
    canvas.line(20 * mm, 16 * mm, 190 * mm, 16 * mm)

    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 11.5 * mm, f"Dhiman Interiors  ·  {COMPANY_ADDRESS}")
    canvas.drawString(20 * mm, 7.5 * mm, f"{COMPANY_PHONE}  ·  {COMPANY_EMAIL}")
    canvas.drawRightString(190 * mm, 11.5 * mm, quotation_number)
    canvas.drawRightString(190 * mm, 7.5 * mm, f"Page {canvas.getPageNumber()}")
    canvas.restoreState()


def page_decorator(quotation_number: str):
    """Canvas callback for SimpleDocTemplate's onFirstPage/onLaterPages —
    draws the same letterhead footer (address, contact, quotation no., page
    number) on every page of the document."""
    return partial(_draw_footer, quotation_number=quotation_number)
