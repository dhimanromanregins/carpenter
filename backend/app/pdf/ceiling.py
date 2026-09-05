from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models import Quotation
from app.pdf.format import amount_in_words_approx, format_inr

INK = colors.HexColor("#141414")
GOLD = colors.HexColor("#C9A24B")
GREY = colors.HexColor("#6B6B6B")
CREAM = colors.HexColor("#F5F1E8")
BORDER = colors.HexColor("#D9D2C2")

PREPARED_BY = "Sahil Dhiman, Dhiman Interiors"


def _format_qty(value) -> str:
    """Trims trailing zeros so a whole-number area reads as '80' not '80.00'."""
    return f"{float(value):g}"


def build_ceiling_pdf(quotation: Quotation) -> bytes:
    payload = quotation.response_payload
    included_items: list[str] = payload["included_items"]
    total = float(quotation.total)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        title=f"Quotation {quotation.quotation_number}",
    )

    styles = getSampleStyleSheet()
    company_style = ParagraphStyle("Company", parent=styles["Title"], textColor=INK, fontSize=18, leading=22)
    tagline_style = ParagraphStyle("Tagline", parent=styles["Normal"], textColor=GREY, fontSize=9, leading=12)
    doc_title_style = ParagraphStyle("DocTitle", parent=styles["Title"], textColor=INK, fontSize=15, leading=19, alignment=TA_CENTER, spaceBefore=10, spaceAfter=2)
    doc_subtitle_style = ParagraphStyle("DocSubtitle", parent=styles["Normal"], textColor=GREY, fontSize=9, leading=13, alignment=TA_CENTER)
    label_style = ParagraphStyle("Label", parent=styles["Normal"], textColor=GREY, fontSize=9, leading=13)
    value_style = ParagraphStyle("Value", parent=styles["Normal"], textColor=INK, fontSize=9, leading=13)
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], textColor=INK, fontSize=11, spaceBefore=14, spaceAfter=4)
    body_style = ParagraphStyle("Body", parent=styles["Normal"], textColor=INK, fontSize=9.5, leading=14)
    note_style = ParagraphStyle("Note", parent=styles["Normal"], textColor=GREY, fontSize=8.5, leading=12, spaceBefore=2)
    table_header_style = ParagraphStyle("TableHeader", parent=styles["Normal"], textColor=CREAM, fontSize=9, leading=12, fontName="Helvetica-Bold")
    table_cell_style = ParagraphStyle("TableCell", parent=styles["Normal"], textColor=INK, fontSize=9, leading=13)
    term_style = ParagraphStyle("Term", parent=styles["Normal"], textColor=INK, fontSize=8.5, leading=13, spaceAfter=3, bulletIndent=0, leftIndent=10)

    elements = []

    # ---- Header ----
    elements.append(Paragraph("DHIMAN INTERIORS", company_style))
    elements.append(Paragraph("Interior Design &amp; Carpentry — Zirakpur, Punjab", tagline_style))
    rule = Table([[""]], colWidths=[170 * mm], rowHeights=[1.2])
    rule.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 1.2, GOLD)]))
    elements.append(Spacer(1, 3 * mm))
    elements.append(rule)

    elements.append(Paragraph("QUOTATION", doc_title_style))
    elements.append(Paragraph("False Ceiling Supply &amp; Installation", doc_subtitle_style))
    elements.append(Spacer(1, 6 * mm))

    # ---- Client / project info block ----
    info_rows = [
        ["Client Name:", quotation.customer_name, "Quotation No.:", quotation.quotation_number],
        ["Phone:", quotation.customer_phone, "Date:", quotation.created_at.strftime("%d %B %Y")],
        ["Site Address:", payload.get("customer_address", ""), "Ceiling Area:", f"{_format_qty(quotation.area_sqft)} sq.ft"],
        ["Prepared By:", PREPARED_BY, "", ""],
    ]
    info_table = Table(
        [[Paragraph(c, label_style if i % 2 == 0 else value_style) for i, c in enumerate(row)] for row in info_rows],
        colWidths=[26 * mm, 59 * mm, 30 * mm, 55 * mm],
    )
    info_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    elements.append(info_table)
    elements.append(Spacer(1, 4 * mm))

    # ---- Scope of work ----
    elements.append(Paragraph("Scope of Work", section_style))
    elements.append(
        Paragraph(
            "This quotation covers supply and on-site installation of a gypsum board false ceiling as per the "
            "area specified below. Rates are inclusive of material and labour for the item described; final "
            "quantities to be verified on site.",
            body_style,
        )
    )

    # ---- Detailed bill of quantities ----
    elements.append(Paragraph("Detailed Bill of Quantities", section_style))
    elements.append(Paragraph("<b>1.&nbsp;&nbsp;False Ceiling</b>", body_style))
    elements.append(Paragraph(", ".join(included_items) + ".", note_style))
    elements.append(Spacer(1, 2 * mm))

    line_desc = f"False ceiling ({_format_qty(quotation.area_sqft)} sq.ft @ {format_inr(payload['rate_per_sqft'])}/sq.ft)"
    bom_data = [
        [Paragraph("Description &amp; Specification", table_header_style), Paragraph("Amount", table_header_style)],
        [Paragraph(line_desc, table_cell_style), Paragraph(format_inr(total), table_cell_style)],
        [
            Paragraph("<b>Section Total — False Ceiling</b>", table_cell_style),
            Paragraph(f"<b>{format_inr(total)}</b>", table_cell_style),
        ],
    ]
    bom_table = Table(bom_data, colWidths=[125 * mm, 45 * mm])
    bom_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F0EAD8")),
                ("GRID", (0, 0), (-1, -1), 0.6, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(bom_table)
    elements.append(Spacer(1, 6 * mm))

    # ---- Price summary ----
    elements.append(Paragraph("Price Summary", section_style))
    summary_data = [
        [Paragraph("#", table_header_style), Paragraph("Section", table_header_style), Paragraph("Amount", table_header_style)],
        [
            Paragraph("1", table_cell_style),
            Paragraph("False Ceiling", table_cell_style),
            Paragraph(format_inr(total), table_cell_style),
        ],
        [
            Paragraph("<b>GRAND TOTAL</b>", table_cell_style),
            "",
            Paragraph(f"<b>{format_inr(total)}</b>", table_cell_style),
        ],
    ]
    summary_table = Table(summary_data, colWidths=[15 * mm, 110 * mm, 45 * mm])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("SPAN", (0, -1), (1, -1)),
                ("BACKGROUND", (0, -1), (-1, -1), GOLD),
                ("GRID", (0, 0), (-1, -1), 0.6, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (2, 0), (2, -1), "RIGHT"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(summary_table)
    elements.append(Spacer(1, 3 * mm))
    elements.append(
        Paragraph(f"Grand Total (approx. {amount_in_words_approx(total)} Rupees only): {format_inr(total)}", body_style)
    )
    elements.append(
        Paragraph(
            "Note: This is an estimate based on the details provided. GST (18%, or as applicable) will be charged "
            "extra. Final billing will be as per actual site measurement.",
            note_style,
        )
    )

    # ---- Terms & conditions ----
    elements.append(Paragraph("Terms &amp; Conditions", section_style))
    terms = [
        "Prices are based on the specification listed above. Any upgrade in material, design or cove detailing will be quoted and adjusted separately.",
        "GST (18%, or as applicable) is extra and will be charged as per prevailing government norms.",
        "Final billing will be as per actual site measurement.",
        "This quotation is valid for 30 days from the date of issue.",
        "Estimated execution timeline: 1–2 weeks from the date of advance payment, subject to site readiness and material availability.",
        "Warranty: 90 days workmanship warranty from date of handover.",
        "Scope excludes: electrical wiring/fixture supply, painting, and civil/structural work, unless explicitly listed above.",
        "Any additional work beyond this scope of work will be executed only after written approval and will be charged extra as per actuals.",
    ]
    for term in terms:
        elements.append(Paragraph(f"&#8226;&nbsp; {term}", term_style))

    # ---- Acceptance / signatures ----
    elements.append(Spacer(1, 6 * mm))
    elements.append(Paragraph("Acceptance", section_style))
    elements.append(
        Paragraph(
            "We confirm having read and understood the above scope of work, specifications, pricing and terms, "
            "and hereby approve this quotation to proceed.",
            body_style,
        )
    )
    elements.append(Spacer(1, 12 * mm))

    signature_table = Table(
        [
            ["Signature: ______________________", "Signature: ______________________"],
            ["For Dhiman Interiors", f"{quotation.customer_name} (Client)"],
            ["Date: ______________", "Date: ______________"],
        ],
        colWidths=[85 * mm, 85 * mm],
    )
    signature_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (-1, -1), INK),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    elements.append(signature_table)

    doc.build(elements)
    return buffer.getvalue()
