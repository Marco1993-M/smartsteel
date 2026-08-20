from __future__ import annotations

import json
import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "atlas-afgri-commercial-offering-v7.pdf"
ATLAS_DARK = ROOT / "public" / "atlas" / "atlas-logo-horizontal-dark.png"
AFGRI_DARK = ROOT / "public" / "afgri-logo-colour-cropped.png"

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 38

NAVY = colors.HexColor("#001D2E")
BLUE = NAVY
PALE_BLUE = colors.HexColor("#F1EEE5")
ICE = colors.HexColor("#F8F6EF")
INK = colors.HexColor("#050505")
SLATE = colors.HexColor("#454545")
LINE = colors.HexColor("#DED8CC")
WHITE = colors.white
CREAM = colors.HexColor("#F3F0E8")
AMBER = colors.HexColor("#E7D8AE")
GREEN = colors.HexColor("#14724F")
BROWN = colors.HexColor("#8B6508")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Atlas", "/System/Library/Fonts/Supplemental/Arial.ttf"))
    pdfmetrics.registerFont(TTFont("Atlas-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Atlas-Display", "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"))


MATRIX_PATH = ROOT / "tmp" / "atlas-commercial-matrix.json"


def load_commercial_matrix() -> dict[tuple[int, int], dict[str, float]]:
    if not MATRIX_PATH.exists():
        raise FileNotFoundError(
            "Run `node scripts/export-atlas-commercial-matrix.mjs` before creating the PDF."
        )
    records = json.loads(MATRIX_PATH.read_text())["matrix"]
    return {(int(item["width"]), int(item["length"])): item for item in records}


COMMERCIAL_MATRIX = load_commercial_matrix()


def indicative_structure_price(width: int, length: int, finish: str = "ZAM") -> dict[str, float]:
    item = COMMERCIAL_MATRIX[(width, length)]
    price = item["prices"][finish]
    return {
        "eave": item["wallHeight"],
        "kg": item["steelMassKg"],
        "connections": item["connectionCost"],
        "sell": price["indicativePrice"],
        "return": price["partnerReturn"],
    }


def money(value: float, nearest: int = 100) -> str:
    rounded = int(round(value / nearest) * nearest)
    return "R " + f"{rounded:,}".replace(",", " ")


def para(text: str, size=8, color=INK, bold=False, leading=None, align=TA_LEFT) -> Paragraph:
    return Paragraph(
        text,
        ParagraphStyle(
            name=f"p-{size}-{bold}", fontName="Atlas-Bold" if bold else "Atlas",
            fontSize=size, leading=leading or size * 1.3, textColor=color, alignment=align,
            splitLongWords=False,
        ),
    )


def draw_image_contain(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x, y + (h - dh) / 2, dw, dh, mask="auto")


def footer(c: canvas.Canvas, page: int, label: str = "ATLAS × AFGRI · COMMERCIAL OFFERING V7.0") -> None:
    c.setStrokeColor(LINE)
    c.line(MARGIN, 26, PAGE_W - MARGIN, 26)
    c.setFont("Atlas-Bold", 6.5)
    c.setFillColor(SLATE)
    c.drawString(MARGIN, 13, label)
    c.drawRightString(PAGE_W - MARGIN, 13, f"DRAFT FOR DISCUSSION · AUGUST 2026 · {page:02d}")


def section_header(c: canvas.Canvas, eyebrow: str, title: str, subtitle: str, page: int) -> float:
    draw_image_contain(c, ATLAS_DARK, MARGIN, PAGE_H - 49, 126, 23)
    draw_image_contain(c, AFGRI_DARK, PAGE_W - MARGIN - 68, PAGE_H - 49, 68, 23)
    if "·" in eyebrow:
        section_no, section_label = [part.strip() for part in eyebrow.split("·", 1)]
    else:
        section_no, section_label = f"{page:02d}", eyebrow
    c.setFillColor(CREAM)
    c.rect(MARGIN, PAGE_H - 119, 30, 30, stroke=0, fill=1)
    c.setFont("Atlas-Bold", 10)
    c.setFillColor(INK)
    c.drawCentredString(MARGIN + 15, PAGE_H - 108, section_no)
    c.setFont("Atlas-Bold", 7)
    c.setFillColor(SLATE)
    c.drawString(MARGIN + 40, PAGE_H - 107, section_label.upper())
    c.setFont("Atlas-Display", 29)
    c.setFillColor(INK)
    c.drawString(MARGIN, PAGE_H - 142, title)
    c.setFont("Atlas", 9)
    c.setFillColor(SLATE)
    c.drawString(MARGIN, PAGE_H - 160, subtitle)
    footer(c, page)
    return PAGE_H - 188


def draw_table(c: canvas.Canvas, data, x, y_top, col_widths, row_heights=None, style=None) -> float:
    table = Table(data, colWidths=col_widths, rowHeights=row_heights)
    base = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
    ]
    table.setStyle(TableStyle(base + (style or [])))
    tw, th = table.wrapOn(c, sum(col_widths), PAGE_H)
    table.drawOn(c, x, y_top - th)
    return y_top - th


def draw_arrow(c: canvas.Canvas, x1: float, y: float, x2: float, color=BLUE) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(1.2)
    c.line(x1, y, x2, y)
    c.setFillColor(color)
    c.line(x2, y, x2 - 5, y + 4)
    c.line(x2, y, x2 - 5, y - 4)


def draw_label_box(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    eyebrow: str,
    title: str,
    body: str,
    fill,
    accent=BLUE,
) -> None:
    c.setFillColor(fill)
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setFillColor(accent)
    c.setFont("Atlas-Bold", 7)
    c.drawString(x + 12, y + h - 20, eyebrow.upper())
    c.setFillColor(INK)
    c.setFont("Atlas-Bold", 11)
    c.drawString(x + 12, y + h - 42, title)
    p = para(body, 7.3, SLATE, leading=9.5)
    p.wrapOn(c, w - 24, h - 54)
    p.drawOn(c, x + 12, y + 14)


def page_overview(c: canvas.Canvas) -> None:
    y = section_header(c, "01 · Commercial offering snapshot", "What Afgri can sell.", "A focused pilot range with a simple customer-to-quote workflow.", 1)
    data = [
        [para("PRODUCT", 7, WHITE, True), para("WHAT AFGRI CAN SELL", 7, WHITE, True), para("COMMERCIAL POSITION", 7, WHITE, True), para("STATUS", 7, WHITE, True)],
        [para("Atlas Warehouses", 9, INK, True), para("W06, W08, W10 and W12 structures in modular 4m bays, with supply-only and installed paths."), para("Primary launch category. Standard commercial matrix available."), para("PILOT READY", 7, GREEN, True)],
        [para("Solar Ground Mounts", 9, INK, True), para("ZAM modular structures configured by panel count for farms, commercial sites and open-field arrays."), para("Standard configurations supported; final project review applies."), para("PILOT READY", 7, GREEN, True)],
        [para("Solar Carports", 9, INK, True), para("Atlas parking structures for single to multi-bay solar parking applications."), para("Estimator-led enquiry with technical review before dealer quotation."), para("CONTROLLED", 7, BLUE, True)],
        [para("Agricultural Structures", 9, INK, True), para("Storage, workshops, poultry buildings, livestock covers, pump houses and related structures."), para("Request-only until standard product rules are released."), para("REQUEST ONLY", 7, BROWN, True)],
    ]
    y = draw_table(c, data, MARGIN, y, [110, 255, 305, 92], row_heights=[26, 48, 48, 48, 48], style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
        ("BACKGROUND", (0, 4), (-1, 4), ICE),
    ])
    steps_y = y - 78
    step_w = (PAGE_W - MARGIN * 2 - 54) / 4
    steps = [
        ("01", "Interest", "Afgri identifies need", "Lead captured"),
        ("02", "Enquiry", "Size, location, product, install path", "Brief complete"),
        ("03", "Quote", "Smart Steel reviews and quotes", "Dealer offer issued"),
        ("04", "Fulfil", "Manufacture, deliver, install or supply-only", "Project delivered"),
    ]
    for idx, (num, title, action, output) in enumerate(steps):
        x = MARGIN + idx * (step_w + 18)
        c.setFillColor(PALE_BLUE if idx == 2 else ICE)
        c.rect(x, steps_y, step_w, 58, stroke=0, fill=1)
        c.setFillColor(BLUE)
        c.rect(x, steps_y + 32, 34, 26, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Atlas-Bold", 10)
        c.drawCentredString(x + 17, steps_y + 42, num)
        c.setFillColor(INK)
        c.setFont("Atlas-Bold", 10)
        c.drawString(x + 44, steps_y + 39, title)
        c.setFillColor(SLATE)
        c.setFont("Atlas", 6.7)
        c.drawString(x + 12, steps_y + 23, action)
        c.setFillColor(GREEN if idx == 3 else BLUE)
        c.setFont("Atlas-Bold", 7)
        c.drawString(x + 12, steps_y + 9, output)
        if idx < len(steps) - 1:
            draw_arrow(c, x + step_w + 5, steps_y + 29, x + step_w + 13, BLUE)

    c.setFillColor(NAVY)
    c.rect(MARGIN, 43, PAGE_W - MARGIN * 2, 26, stroke=0, fill=1)
    c.setFillColor(PALE_BLUE)
    c.setFont("Atlas-Bold", 7.2)
    c.drawString(MARGIN + 12, 53, "MINIMUM LEAD DATA")
    c.setFillColor(WHITE)
    c.setFont("Atlas", 7)
    c.drawString(MARGIN + 128, 53, "Product type · approximate size · project location · supply-only or installed · customer contact · timing expectation")
    c.showPage()


def page_matrix(c: canvas.Canvas) -> None:
    y = section_header(c, "02 · Atlas warehouse matrix", "Protected price and partner return.", "Controlled commercial schedule · supply only · excl. VAT · prices and proposed 5% return rounded to nearest R100", 2)
    lengths = [8, 12, 16, 20]
    widths = [6, 8, 10, 12]
    rows = [[
        para("SYSTEM", 7, WHITE, True), para("SIZE", 7, WHITE, True), para("SCHEDULE", 7, WHITE, True),
        para("MILD STEEL", 7, WHITE, True), para("ZAM", 7, WHITE, True), para("GALVANISED", 7, WHITE, True),
    ]]
    for width in widths:
        for length in lengths:
            basis = indicative_structure_price(width, length)
            price_cells = []
            for finish in ["Mild", "ZAM", "Galv"]:
                item = indicative_structure_price(width, length, finish)
                price_cells.append(para(
                    f"<b>{money(item['sell'])}</b><br/><font color='#001D2E'>Return {money(item['return'])}</font>",
                    6.8,
                    leading=8,
                ))
            rows.append([
                para(f"W{width:02d}", 8, INK, True),
                para(f"{width}m x {length}m x {basis['eave']:g}m", 7, INK, True),
                para(f"{basis['kg']:,.0f}kg", 7, SLATE),
                *price_cells,
            ])
    row_heights = [26] + [18] * 16
    y = draw_table(c, rows, MARGIN, y, [65, 125, 85, 162, 162, 163], row_heights=row_heights, style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        *[("BACKGROUND", (0, row), (-1, row), ICE) for row in range(2, 17, 2)],
        ("SPAN", (0, 1), (0, 4)), ("SPAN", (0, 5), (0, 8)),
        ("SPAN", (0, 9), (0, 12)), ("SPAN", (0, 13), (0, 16)),
        ("VALIGN", (0, 1), (0, 16), "MIDDLE"),
    ])
    c.setFillColor(NAVY)
    c.rect(MARGIN, 66, PAGE_W - MARGIN * 2, 24, stroke=0, fill=1)
    c.setFont("Atlas-Bold", 8)
    c.setFillColor(PALE_BLUE)
    c.drawString(MARGIN + 14, 75, "PROTECTED DEALER MODEL")
    c.setFont("Atlas", 7.5)
    c.setFillColor(WHITE)
    c.drawString(MARGIN + 170, 75, "Smart Steel controls the quotation; the shown 5% is the proposed qualifying AFGRI return, not a customer discount.")
    c.setFillColor(AMBER)
    c.rect(MARGIN, 34, PAGE_W - MARGIN * 2, 30, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Atlas-Bold", 7.5)
    c.drawString(MARGIN + 12, 45, "PRICING HOLD")
    c.setFont("Atlas", 7.5)
    c.drawString(MARGIN + 112, 45, "Final Smart Steel quotation confirmation is required before this matrix is issued to customers.")
    c.showPage()


def page_partner_economics(c: canvas.Canvas) -> None:
    y = section_header(
        c,
        "03 · Partner economics and fulfilment",
        "How Afgri earns without carrying the technical load.",
        "Afgri opens the market. Smart Steel confirms, quotes, manufactures and supports the agreed fulfilment path.",
        3,
    )
    c.setFillColor(PALE_BLUE)
    c.rect(MARGIN, y - 128, 270, 110, stroke=0, fill=1)
    c.setFont("Atlas-Bold", 8)
    c.setFillColor(BLUE)
    c.drawString(MARGIN + 18, y - 45, "PROPOSED PILOT RETURN")
    c.setFont("Atlas-Display", 58)
    c.setFillColor(INK)
    c.drawString(MARGIN + 18, y - 100, "5%")
    c.setFont("Atlas-Bold", 11)
    c.drawString(MARGIN + 135, y - 79, "qualifying")
    c.drawString(MARGIN + 135, y - 96, "Afgri return")

    dark_x = MARGIN + 292
    dark_y = y - 128
    dark_w = PAGE_W - MARGIN * 2 - 292
    c.setFillColor(NAVY)
    c.rect(dark_x, dark_y, dark_w, 110, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("Atlas-Bold", 10)
    c.drawString(dark_x + 20, dark_y + 78, "Not a customer discount.")
    node_y = dark_y + 24
    node_w = 105
    gap = 25
    nodes = [
        ("AFGRI", "opens market"),
        ("SMART STEEL", "quotes + fulfils"),
        ("AFGRI", "earns return"),
    ]
    for idx, (title, body) in enumerate(nodes):
        x = dark_x + 20 + idx * (node_w + gap)
        c.setStrokeColor(PALE_BLUE)
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.08))
        c.rect(x, node_y, node_w, 38, stroke=1, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Atlas-Bold", 7.5)
        c.drawString(x + 9, node_y + 22, title)
        c.setFont("Atlas", 7)
        c.setFillColor(PALE_BLUE)
        c.drawString(x + 9, node_y + 10, body)
        if idx < len(nodes) - 1:
            draw_arrow(c, x + node_w + 6, node_y + 19, x + node_w + gap - 6, PALE_BLUE)
    c.setFont("Atlas", 6.8)
    c.setFillColor(PALE_BLUE)
    c.drawString(dark_x + 20, dark_y + 9, "Final base, trigger and payment timing to be confirmed in writing.")

    y2 = y - 150
    data = [
        [para("COMMERCIAL ITEM", 7, WHITE, True), para("WORKING POSITION", 7, WHITE, True)],
        [para("Return trigger", 8, INK, True), para("Afgri-channel opportunity converted through the agreed pilot process.")],
        [para("Calculation base", 8, INK, True), para("Recommended: confirmed Smart Steel supply scope, excluding VAT and pass-through costs unless agreed otherwise.")],
        [para("Installation", 8, INK, True), para("Supply-only for customer-managed installation, or Smart Steel-installed after site access and responsibilities are reviewed.")],
        [para("Quote targets", 8, INK, True), para("Standard dealer quotation: 1 business day after complete information. Custom quotation: 3-5 business days after complete technical information.")],
        [para("Volume incentive", 8, INK, True), para("Tiered incentive proposed after pilot evidence, based on confirmed turnover, units or product mix.")],
    ]
    y3 = draw_table(c, data, MARGIN, y2, [145, 617], row_heights=[26] + [30] * 5, style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
        ("BACKGROUND", (0, 4), (-1, 4), ICE),
    ])
    c.setFillColor(AMBER)
    c.rect(MARGIN, y3 - 40, PAGE_W - MARGIN * 2, 28, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Atlas-Bold", 7.5)
    c.drawString(MARGIN + 14, y3 - 29, "COMMERCIAL POSTURE")
    c.setFont("Atlas", 7.5)
    c.drawString(MARGIN + 126, y3 - 29, "Use 5% as the pilot discussion basis. Confirm final base, trigger and payment timing in writing.")
    c.showPage()


def page_configurations(c: canvas.Canvas) -> None:
    y = section_header(c, "04 · Product configuration guide", "What we need to quote.", "A practical branch checklist for standard, controlled and custom enquiries.", 4)
    data = [
        [para("INPUT", 7, WHITE, True), para("WHAT AFGRI SHOULD CAPTURE", 7, WHITE, True), para("WHY IT MATTERS", 7, WHITE, True)],
        [para("Product type", 8, INK, True), para("Warehouse · Ground mount · Carport · Agricultural/custom"), para("Confirms whether the enquiry is standard, controlled or custom.")],
        [para("Size", 8, INK, True), para("Width, length, height, panel count or approximate covered area"), para("Drives the product code, member schedule and quotation route.")],
        [para("Finish", 8, INK, True), para("Mild steel · ZAM · Galvanised · Chromadek where required"), para("Sets the material basis and corrosion-performance expectation.")],
        [para("Sheeting", 8, INK, True), para("Structure only · Roof sheeted · Roof and walls sheeted · profile preference"), para("Sheeting is calculated from actual roof and wall coverage.")],
        [para("Openings", 8, INK, True), para("Open gable standard, or note any doors, openings and access requirements"), para("Project openings are reviewed before external commitment.")],
        [para("Location", 8, INK, True), para("Project site, nearest branch, access notes and timing expectation"), para("Confirms delivery planning, installation feasibility and lead time.")],
        [para("Fulfilment", 8, INK, True), para("Supply-only or Smart Steel-installed"), para("Keeps Afgri's role simple while giving the client a clear path.")],
    ]
    y2 = draw_table(c, data, MARGIN, y, [130, 272, 360], row_heights=[26] + [32] * 7, style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
        ("BACKGROUND", (0, 4), (-1, 4), ICE),
        ("BACKGROUND", (0, 6), (-1, 6), ICE),
    ])
    route_data = [
        [para("ENQUIRY TYPE", 7, WHITE, True), para("ROUTE", 7, WHITE, True), para("TARGET RESPONSE", 7, WHITE, True)],
        [para("Standard", 8, GREEN, True), para("Atlas Warehouses and standard Ground Mount inputs."), para("1 business day after complete information.", 7, BLUE, True)],
        [para("Controlled", 8, BLUE, True), para("Solar Carports or reviewed configurations before dealer quotation."), para("3-5 business days after complete technical information.", 7, BLUE, True)],
        [para("Custom", 8, BROWN, True), para("Agricultural structures and project-specific requests."), para("Scoped after Smart Steel technical review.", 7, BROWN, True)],
    ]
    draw_table(c, route_data, MARGIN, y2 - 18, [130, 402, 230], row_heights=[24, 28, 28, 28], style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
    ])
    c.showPage()


def page_non_warehouse_pricing(c: canvas.Canvas) -> None:
    y = section_header(
        c,
        "05 · Beyond warehouses",
        "What to say when it is not a warehouse.",
        "Keep the answer short: standard, controlled or custom.",
        5,
    )
    data = [
        [para("OFFER", 7, WHITE, True), para("WHAT AFGRI CAN SAY", 7, WHITE, True), para("PRICING ROUTE", 7, WHITE, True), para("TARGET RESPONSE", 7, WHITE, True)],
        [
            para("Solar Ground Mounts", 9, INK, True),
            para("Standard ZAM modular ground-mount systems for farms, commercial sites and open-field arrays."),
            para("Panel count and site inputs drive the reviewed quotation."),
            para("1 business day when complete standard inputs are supplied.", 7, BLUE, True),
        ],
        [
            para("Solar Carports", 9, INK, True),
            para("Solar parking structures from single to multi-bay commercial applications."),
            para("Estimator-led enquiry with technical review before the dealer quotation is issued."),
            para("3-5 business days after complete technical information.", 7, BLUE, True),
        ],
        [
            para("Agricultural Structures", 9, INK, True),
            para("Storage, workshops, poultry buildings, livestock covers, pump houses and related structures."),
            para("Request-only until standard product rules and commercial boundaries are released."),
            para("Scoped after Smart Steel technical review.", 7, colors.HexColor("#9A6500"), True),
        ],
    ]
    y2 = draw_table(c, data, MARGIN, y, [130, 245, 260, 127], row_heights=[30, 76, 76, 76], style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
    ])
    c.setFillColor(PALE_BLUE)
    c.rect(MARGIN, y2 - 72, PAGE_W - MARGIN * 2, 52, stroke=0, fill=1)
    c.setFillColor(NAVY)
    c.setFont("Atlas-Bold", 8)
    c.drawString(MARGIN + 14, y2 - 42, "CUSTOM ENQUIRY RULE")
    p = para(
        "Afgri can bring the opportunity in. Smart Steel confirms whether it is standard, controlled or custom before Afgri commits externally.",
        8,
        INK,
        leading=10.5,
    )
    p.wrapOn(c, PAGE_W - MARGIN * 2 - 180, 35)
    p.drawOn(c, MARGIN + 150, y2 - 55)
    c.showPage()


def page_capability(c: canvas.Canvas) -> None:
    y = section_header(c, "06 · Fulfilment", "From branch opportunity to site.", "Keep commitments clear: what is standard, what is reviewed and what still needs agreement.", 6)
    cards = [
        ("GEOGRAPHIC CAPABILITY", "South African projects", "Structures can be supplied nationally. Delivery cost and route planning follow the confirmed project or AFGRI branch location."),
        ("INSTALLATION", "Two fulfilment paths", "Supply-only for customer-managed installation, or Smart Steel-installed after site access, ground conditions and responsibilities are reviewed."),
        ("LEAD TIME", "Publish with care", "Standard quotation targets can be shared now; manufacturing lead times should be published after product scope and capacity windows are agreed."),
    ]
    card_w = (PAGE_W - MARGIN * 2 - 24) / 3
    for idx, (label, title, body) in enumerate(cards):
        x = MARGIN + idx * (card_w + 12)
        c.setFillColor(ICE if idx != 1 else PALE_BLUE)
        c.rect(x, y - 145, card_w, 128, stroke=0, fill=1)
        c.setFont("Atlas-Bold", 7)
        c.setFillColor(BLUE)
        c.drawString(x + 15, y - 42, label)
        c.setFont("Atlas-Bold", 15)
        c.setFillColor(INK)
        c.drawString(x + 15, y - 68, title)
        p = para(body, 8, SLATE, leading=11)
        p.wrapOn(c, card_w - 30, 60)
        p.drawOn(c, x + 15, y - 132)
    y2 = y - 160
    data = [
        [para("ACTIVITY", 7, WHITE, True), para("PROPOSED PILOT TARGET", 7, WHITE, True), para("OWNER", 7, WHITE, True), para("V1 STATUS", 7, WHITE, True)],
        [para("Lead acknowledgement", 8, INK, True), para("1 business day"), para("AFGRI"), para("PROPOSED", 7, BLUE, True)],
        [para("Completeness review", 8, INK, True), para("1 business day after submission"), para("Smart Steel"), para("PROPOSED", 7, BLUE, True)],
        [para("Standard dealer quotation", 8, INK, True), para("1 business day after complete information"), para("Smart Steel"), para("PROPOSED", 7, BLUE, True)],
        [para("Custom dealer quotation", 8, INK, True), para("3-5 business days after complete technical information"), para("Smart Steel"), para("PROPOSED", 7, BLUE, True)],
        [para("Manufacturing lead time", 8, INK, True), para("To agree by product and capacity window"), para("Joint"), para("OPEN", 7, colors.HexColor("#9A6500"), True)],
    ]
    draw_table(c, data, MARGIN, y2, [205, 300, 125, 132], row_heights=[28] + [34] * 5, style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
        ("BACKGROUND", (0, 4), (-1, 4), ICE),
    ])
    c.showPage()


def page_workflow(c: canvas.Canvas) -> None:
    y = section_header(
        c,
        "07 · Selling workflow",
        "Four steps only.",
        "Afgri owns the customer. Smart Steel owns technical review and quotation control.",
        7,
    )
    steps = [
        ("01", "Interest", "Afgri identifies need", "Lead captured"),
        ("02", "Enquiry", "Size, location, product, install path", "Brief complete"),
        ("03", "Quote", "Smart Steel reviews and quotes", "Dealer offer issued"),
        ("04", "Fulfil", "Manufacture, deliver, install or supply-only", "Project delivered"),
    ]
    card_y = y - 132
    card_h = 112
    card_w = (PAGE_W - MARGIN * 2 - 54) / 4
    for idx, (num, title, action, output) in enumerate(steps):
        x = MARGIN + idx * (card_w + 18)
        c.setFillColor(PALE_BLUE if idx == 2 else ICE)
        c.rect(x, card_y, card_w, card_h, stroke=0, fill=1)
        c.setFillColor(BLUE)
        c.rect(x, card_y + card_h - 30, 42, 30, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Atlas-Bold", 11)
        c.drawCentredString(x + 21, card_y + card_h - 20, num)
        c.setFillColor(INK)
        c.setFont("Atlas-Bold", 14)
        c.drawString(x + 14, card_y + 61, title)
        p = para(action, 7.8, SLATE, leading=10)
        p.wrapOn(c, card_w - 28, 28)
        p.drawOn(c, x + 14, card_y + 34)
        c.setFont("Atlas-Bold", 7.5)
        c.setFillColor(BLUE if idx != 3 else GREEN)
        c.drawString(x + 14, card_y + 16, output)
        if idx < len(steps) - 1:
            draw_arrow(c, x + card_w + 5, card_y + 56, x + card_w + 13, BLUE)

    role_y = card_y - 90
    role_w = (PAGE_W - MARGIN * 2 - 14) / 2
    role_boxes = [
        ("AFGRI OWNS", "Customer channel", "Branch activation, customer conversation, finance interest and campaign reach."),
        ("SMART STEEL OWNS", "Technical control", "Completeness review, dealer quotation, manufacturing and agreed fulfilment path."),
    ]
    for idx, (label, title, body) in enumerate(role_boxes):
        x = MARGIN + idx * (role_w + 14)
        c.setFillColor(WHITE)
        c.rect(x, role_y, role_w, 62, stroke=0, fill=1)
        c.setFillColor(BLUE)
        c.setFont("Atlas-Bold", 7)
        c.drawString(x + 12, role_y + 42, label)
        c.setFillColor(INK)
        c.setFont("Atlas-Bold", 12)
        c.drawString(x + 12, role_y + 24, title)
        c.setFillColor(SLATE)
        c.setFont("Atlas", 6.8)
        c.drawString(x + 12, role_y + 10, body)

    y2 = role_y
    c.setFillColor(NAVY)
    c.rect(MARGIN, y2 - 58, PAGE_W - MARGIN * 2, 40, stroke=0, fill=1)
    c.setFillColor(PALE_BLUE)
    c.setFont("Atlas-Bold", 8)
    c.drawString(MARGIN + 14, y2 - 34, "MINIMUM LEAD DATA")
    c.setFillColor(WHITE)
    c.setFont("Atlas", 7.5)
    c.drawString(
        MARGIN + 130,
        y2 - 34,
        "Product type · approximate size · project location · supply-only or installed · customer contact · timing expectation · notes/photos where available",
    )
    c.showPage()


def page_meeting_alignment(c: canvas.Canvas) -> None:
    y = section_header(
        c,
        "08 · Wednesday alignment",
        "Decisions to land.",
        "Keep the conversation pointed at pilot launch.",
        8,
    )
    data = [
        [para("DECISION AREA", 7, WHITE, True), para("RECOMMENDED POSITION", 7, WHITE, True), para("WHY IT MATTERS", 7, WHITE, True)],
        [para("Pilot lane", 8, INK, True), para("Warehouses first. Ground mounts selected. Carports controlled. Agricultural custom request-only."), para("Keeps the pilot sellable and manageable.")],
        [para("Afgri return", 8, INK, True), para("Use 5% qualifying pilot return as discussion basis."), para("Makes the upside visible.")],
        [para("Marketing", 8, INK, True), para("Afgri leads campaigns. Smart Steel supplies product data and creatives on request."), para("Uses Afgri's reach while keeping execution simple.")],
        [para("Workflow", 8, INK, True), para("Agree lead fields, handoffs and quote targets."), para("Prevents branch confusion.")],
        [para("Pilot evidence", 8, INK, True), para("Track leads, quotes, conversion, return, product mix and turnaround."), para("Supports rollout and tiered incentives.")],
    ]
    y2 = draw_table(c, data, MARGIN, y, [145, 365, 252], row_heights=[30] + [52] * 5, style=[
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), ICE),
        ("BACKGROUND", (0, 4), (-1, 4), ICE),
    ])
    c.setFillColor(AMBER)
    c.rect(MARGIN, y2 - 58, PAGE_W - MARGIN * 2, 40, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Atlas-Bold", 8)
    c.drawString(MARGIN + 14, y2 - 34, "SMART STEEL ASK")
    c.setFont("Atlas", 7.8)
    c.drawString(
        MARGIN + 128,
        y2 - 34,
        "Agree pilot lane, 5% discussion basis, lead workflow and first branch/customer segment.",
    )
    c.showPage()


def build() -> Path:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=landscape(A4), pageCompression=1)
    c.setTitle("Atlas x AFGRI Commercial Offering V7.0")
    c.setAuthor("Smart Steel")
    c.setSubject("Draft Atlas commercial offering and AFGRI partner economics")
    c.setKeywords("Atlas, AFGRI, commercial offering, warehouses, partner pricing")
    page_overview(c)
    page_matrix(c)
    page_partner_economics(c)
    page_configurations(c)
    c.save()
    return OUTPUT


if __name__ == "__main__":
    print(build())
