from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "smart-steel-holmstone-pre-meeting-pitch.pdf"

LOGO = ROOT / "public" / "Logo.png"
GROUND_MOUNT = ROOT / "public" / "solar_ground_mount_1.webp"
GROUND_MOUNT_ALT = ROOT / "public" / "solar_ground_mount_2.webp"
CARPORT = ROOT / "public" / "solar_carport_hero.webp"
CARPORT_ALT = ROOT / "public" / "atlas-solar-carports-share.png"

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 42
CONTENT_W = PAGE_W - MARGIN * 2

INK = colors.HexColor("#101314")
CHARCOAL = colors.HexColor("#273034")
MUTED = colors.HexColor("#5D6668")
LINE = colors.HexColor("#D7D1C5")
CREAM = colors.HexColor("#F4F0E6")
SOFT = colors.HexColor("#FAF8F2")
STEEL = colors.HexColor("#E7E9E5")
GREEN = colors.HexColor("#2F6E4F")
GOLD = colors.HexColor("#B9924B")
BLUE = colors.HexColor("#234A5A")
WHITE = colors.white


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("SS-Regular", "/System/Library/Fonts/Supplemental/Arial.ttf"))
    pdfmetrics.registerFont(TTFont("SS-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
    pdfmetrics.registerFont(TTFont("SS-Display", "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"))


def p(text: str, size=9, color=INK, bold=False, leading=None, align=TA_LEFT) -> Paragraph:
    return Paragraph(
        text,
        ParagraphStyle(
            name=f"p-{size}-{bold}-{align}",
            fontName="SS-Bold" if bold else "SS-Regular",
            fontSize=size,
            leading=leading or size * 1.25,
            textColor=color,
            alignment=align,
            splitLongWords=False,
            spaceAfter=0,
        ),
    )


def draw_image_cover(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def draw_image_contain(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def footer(c: canvas.Canvas, page: int) -> None:
    c.setStrokeColor(LINE)
    c.setLineWidth(0.75)
    c.line(MARGIN, 28, PAGE_W - MARGIN, 28)
    c.setFont("SS-Bold", 6.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 14, "SMART STEEL x HOLMSTONE - PRE-MEETING PITCH")
    c.drawRightString(PAGE_W - MARGIN, 14, f"DRAFT FOR DISCUSSION - SEPTEMBER 2026 - {page:02d}")


def header(c: canvas.Canvas, page: int, section: str, title: str, subtitle: str = "") -> float:
    draw_image_contain(c, LOGO, MARGIN, PAGE_H - 54, 108, 35)
    c.setFillColor(CREAM)
    c.rect(MARGIN, PAGE_H - 118, 32, 32, stroke=0, fill=1)
    c.setFont("SS-Bold", 10)
    c.setFillColor(INK)
    c.drawCentredString(MARGIN + 16, PAGE_H - 106, f"{page:02d}")
    c.setFont("SS-Bold", 7)
    c.setFillColor(MUTED)
    c.drawString(MARGIN + 44, PAGE_H - 104, section.upper())
    c.setFont("SS-Display", 31)
    c.setFillColor(INK)
    c.drawString(MARGIN, PAGE_H - 144, title)
    if subtitle:
        c.setFont("SS-Regular", 9)
        c.setFillColor(MUTED)
        c.drawString(MARGIN, PAGE_H - 163, subtitle)
    footer(c, page)
    return PAGE_H - 195


def table(c: canvas.Canvas, data, x, y_top, widths, row_heights=None, style=None) -> float:
    t = Table(data, colWidths=widths, rowHeights=row_heights)
    base = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
    ]
    t.setStyle(TableStyle(base + (style or [])))
    _, th = t.wrapOn(c, sum(widths), PAGE_H)
    t.drawOn(c, x, y_top - th)
    return y_top - th


def card(c: canvas.Canvas, x: float, y: float, w: float, h: float, label: str, title: str, body: str, fill=SOFT, accent=GREEN) -> None:
    c.setFillColor(fill)
    c.rect(x, y - h, w, h, stroke=0, fill=1)
    c.setFillColor(accent)
    c.rect(x, y - h, 5, h, stroke=0, fill=1)
    c.setFont("SS-Bold", 6.8)
    c.drawString(x + 15, y - 18, label.upper())
    c.setFont("SS-Bold", 12)
    c.setFillColor(INK)
    c.drawString(x + 15, y - 40, title)
    para = p(body, 8, MUTED, leading=10.2)
    para.wrapOn(c, w - 30, h - 54)
    para.drawOn(c, x + 15, y - h + 18)


def pill(c: canvas.Canvas, x: float, y: float, text: str, fill=GREEN) -> None:
    c.setFillColor(fill)
    c.roundRect(x, y, 124, 22, 3, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("SS-Bold", 7.2)
    c.drawCentredString(x + 62, y + 7, text.upper())


def page_cover(c: canvas.Canvas) -> None:
    draw_image_cover(c, GROUND_MOUNT, 0, 0, PAGE_W, PAGE_H)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.48))
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_image_contain(c, LOGO, MARGIN, PAGE_H - 83, 132, 48)
    c.setFont("SS-Bold", 8)
    c.setFillColor(CREAM)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 52, "DRAFT FOR DISCUSSION - SEPTEMBER 2026")
    c.setFont("SS-Display", 56)
    c.setFillColor(WHITE)
    c.drawString(MARGIN, 292, "Smart Steel x HolmStone")
    c.setFont("SS-Bold", 16)
    c.drawString(MARGIN, 254, "Solar Structural Delivery")
    intro = p(
        "A pre-meeting pitch for helping HolmStone win and deliver more profitable solar projects by taking structural mounting from early costing through engineering, manufacturing, delivery and installation support.",
        11,
        CREAM,
        leading=15,
    )
    intro.wrapOn(c, 498, 80)
    intro.drawOn(c, MARGIN, 174)
    pill(c, MARGIN, 126, "Pre-meeting pitch", GOLD)
    c.showPage()


def page_position(c: canvas.Canvas) -> None:
    y = header(c, 2, "Opening position", "HolmStone owns the energy project. Smart Steel owns the structural package.", "The pitch in one commercial idea.")
    c.setFillColor(BLUE)
    c.rect(MARGIN, y - 118, CONTENT_W, 96, stroke=0, fill=1)
    quote = p(
        "Give us the array requirements and site parameters. We will turn them into an engineered, manufactured and install-ready structural package.",
        20,
        WHITE,
        bold=True,
        leading=25,
        align=TA_CENTER,
    )
    quote.wrapOn(c, CONTENT_W - 80, 70)
    quote.drawOn(c, MARGIN + 40, y - 90)

    y -= 154
    data = [
        [p("HOLMSTONE RETAINS", 7, WHITE, True), p("SMART STEEL TAKES RESPONSIBILITY FOR", 7, WHITE, True)],
        [
            p("Client relationship<br/>Energy-system design<br/>Electrical engineering<br/>Project ownership<br/>Commercial control<br/>Engineering oversight<br/>Overall EPC responsibility", 9, CHARCOAL, leading=14),
            p("Structural system selection<br/>Preliminary solution and costing<br/>Detailed structural engineering<br/>Connection design and production detailing<br/>Bill of materials<br/>Manufacturing, QC and packaging<br/>Logistics and installation support where required", 9, CHARCOAL, leading=14),
        ],
    ]
    table(
        c,
        data,
        MARGIN,
        y,
        [CONTENT_W / 2, CONTENT_W / 2],
        row_heights=[30, 154],
        style=[
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (-1, 1), SOFT),
            ("BACKGROUND", (1, 1), (1, 1), CREAM),
        ],
    )
    c.showPage()


def page_why(c: canvas.Canvas) -> None:
    y = header(c, 3, "Why It Matters", "The structural workstream can consume more project capacity than expected.", "The useful metric is total structural delivery cost.")
    left_w = 356
    body = p(
        "A supplier can be cheaper on steel and more expensive to the project. The structural workstream can carry hidden cost through coordination load, design revisions, supplier interfaces, quality checks, logistics ambiguity, site changes and schedule pressure.",
        11,
        CHARCOAL,
        leading=15,
    )
    body.wrapOn(c, left_w, 110)
    body.drawOn(c, MARGIN, y - 82)
    c.setFont("SS-Display", 28)
    c.setFillColor(INK)
    c.drawString(MARGIN, y - 142, "Compete on delivered outcome.")
    c.setFont("SS-Bold", 10)
    c.setFillColor(GREEN)
    c.drawString(MARGIN, y - 166, "Cost per successfully delivered structural package.")
    c.setFont("SS-Regular", 9)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, y - 184, "Not only cost per kilogram of steel.")

    x = MARGIN + left_w + 44
    items = [
        "Internal engineering hours",
        "Drafting and detailing",
        "Supplier RFQs and procurement admin",
        "Fabrication and coating coordination",
        "Logistics and installation planning",
        "Technical queries and rework",
        "Schedule delays and management attention",
    ]
    rows = [[p("WHERE THE COST HIDES", 7, WHITE, True)]]
    rows += [[p(item, 9, CHARCOAL)] for item in items]
    table(
        c,
        rows,
        x,
        y,
        [CONTENT_W - left_w - 44],
        row_heights=[28] + [34] * len(items),
        style=[
            ("BACKGROUND", (0, 0), (0, 0), BLUE),
            ("BACKGROUND", (0, 1), (0, -1), WHITE),
            ("BACKGROUND", (0, 2), (0, 2), SOFT),
            ("BACKGROUND", (0, 4), (0, 4), SOFT),
            ("BACKGROUND", (0, 6), (0, 6), SOFT),
        ],
    )
    c.showPage()


def page_platforms(c: canvas.Canvas) -> None:
    y = header(c, 4, "Structural Platforms", "Start with repeatable systems. Engineer the exceptions.", "Four areas where Smart Steel can support selected HolmStone projects.")
    img_h = 112
    gap = 18
    w = (CONTENT_W - gap) / 2
    draw_image_cover(c, GROUND_MOUNT_ALT, MARGIN, y - img_h, w, img_h)
    draw_image_cover(c, CARPORT, MARGIN + w + gap, y - img_h, w, img_h)
    y -= img_h + 22
    card(c, MARGIN, y, w, 88, "Platform A", "Ground Mount Systems", "Modular commercial and utility-scale solar structures engineered around repeatability, material efficiency and rapid site assembly.", WHITE, GREEN)
    card(c, MARGIN + w + gap, y, w, 88, "Platform B", "Elevated Solar Structures", "High-clearance mounting for sites where the land beneath the array keeps operational or economic value.", WHITE, BLUE)
    y -= 110
    card(c, MARGIN, y, w, 88, "Platform C", "Solar Carports", "Parking infrastructure becomes an energy-generating asset, combining shade, generation capacity and functional site improvement.", SOFT, GOLD)
    card(c, MARGIN + w + gap, y, w, 88, "Platform D", "Custom Applications", "For complex terrain, unusual clearances, existing structures, non-standard arrays and project-specific constraints.", SOFT, CHARCOAL)
    c.setFont("SS-Bold", 12)
    c.setFillColor(INK)
    c.drawCentredString(PAGE_W / 2, 56, "Standardise what repeats. Engineer what changes.")
    c.showPage()


def page_engineering(c: canvas.Canvas) -> None:
    y = header(c, 5, "Engineering Capacity", "The offer respects HolmStone's internal capability.", "The goal is to free scarce project capacity, not challenge it.")
    data = [
        [p("NOT THE CLAIM", 7, WHITE, True), p("THE BETTER CLAIM", 7, WHITE, True)],
        [
            p("Your team cannot design this.", 22, MUTED, bold=True, leading=27, align=TA_CENTER),
            p("Your team should not need to spend scarce internal capacity coordinating repetitive structural delivery work.", 17, INK, bold=True, leading=22, align=TA_CENTER),
        ],
    ]
    table(
        c,
        data,
        MARGIN,
        y,
        [CONTENT_W * 0.38, CONTENT_W * 0.62],
        row_heights=[28, 130],
        style=[
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (0, 1), STEEL),
            ("BACKGROUND", (1, 1), (1, 1), CREAM),
        ],
    )
    y -= 196
    cards = [
        ("01", "Faster tender turnaround", "Early structural solutioning and budget input can support bid speed."),
        ("02", "Elastic delivery capacity", "Project volume can grow without equivalent permanent structural overhead."),
        ("03", "Fewer interfaces", "One accountable partner compresses engineer, detailer, fabricator, coating, logistics and site-support interfaces."),
    ]
    w = (CONTENT_W - 32) / 3
    for idx, (num, title, body) in enumerate(cards):
        card(c, MARGIN + idx * (w + 16), y, w, 106, num, title, body, WHITE if idx != 1 else SOFT, [GREEN, BLUE, GOLD][idx])
    c.showPage()


def page_benchmark(c: canvas.Canvas) -> None:
    y = header(c, 6, "Low-Risk First Step", "Do not ask for exclusivity. Ask for one project to benchmark.", "Let the first project prove whether the proposition deserves to grow.")
    c.setFillColor(GREEN)
    c.rect(MARGIN, y - 84, CONTENT_W, 62, stroke=0, fill=1)
    q = p("Send Smart Steel one suitable upcoming project. We will develop and price the structural package so HolmStone can compare our approach against its current solution.", 15, WHITE, bold=True, leading=19, align=TA_CENTER)
    q.wrapOn(c, CONTENT_W - 70, 46)
    q.drawOn(c, MARGIN + 35, y - 69)

    y -= 108
    metrics = [
        ["Structural cost", "Material weight", "Engineering approach"],
        ["Turnaround time", "Manufacturing method", "Installation method"],
        ["Lead time", "Responsiveness", "Scope completeness"],
        ["Project risk", "Delivery simplicity", "Commercial fit"],
    ]
    data = [[p("WHAT HOLMSTONE CAN COMPARE", 7, WHITE, True), p("", 7), p("", 7)]]
    for row in metrics:
        data.append([p(cell, 10, CHARCOAL, True, align=TA_CENTER) for cell in row])
    table(
        c,
        data,
        MARGIN,
        y,
        [CONTENT_W / 3] * 3,
        row_heights=[28, 37, 37, 37, 37],
        style=[
            ("SPAN", (0, 0), (-1, 0)),
            ("BACKGROUND", (0, 0), (-1, 0), BLUE),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("BACKGROUND", (0, 2), (-1, 2), SOFT),
            ("BACKGROUND", (0, 4), (-1, 4), SOFT),
        ],
    )
    c.setFont("SS-Bold", 10)
    c.setFillColor(GOLD)
    c.drawString(MARGIN, 66, "Positioning note")
    c.setFont("SS-Regular", 9)
    c.setFillColor(MUTED)
    c.drawString(MARGIN + 102, 66, "Smart Steel is asking to prove a delivery method, not asking HolmStone to believe a presentation.")
    c.showPage()


def page_meeting(c: canvas.Canvas) -> None:
    y = header(c, 7, "Meeting Objective", "Find the structural friction, then pick the right benchmark project.", "Suggested discovery themes for the first conversation.")
    questions = [
        ["Current process", "How do structural suppliers become involved? Who owns detailing, fabrication and installation coordination?"],
        ["Tender speed", "Is preliminary structural pricing ever a bottleneck? What information is usually missing early?"],
        ["Economics", "Which metric carries the most weight: R/W, R/panel, R/kg, installed cost, lead time or project risk?"],
        ["Capacity", "Where does the structural process become constrained when several projects move at once?"],
        ["Product fit", "Where do standard ground mounts, elevated arrays, carports or custom structures fit HolmStone's pipeline?"],
    ]
    data = [[p("DISCUSSION AREA", 7, WHITE, True), p("WHAT WE WANT TO LEARN", 7, WHITE, True)]]
    data += [[p(a, 10, INK, True), p(b, 9, CHARCOAL, leading=12)] for a, b in questions]
    table(
        c,
        data,
        MARGIN,
        y,
        [170, CONTENT_W - 170],
        row_heights=[30, 52, 52, 52, 52, 52],
        style=[
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("BACKGROUND", (0, 2), (-1, 2), SOFT),
            ("BACKGROUND", (0, 4), (-1, 4), SOFT),
        ],
    )
    c.setFillColor(CREAM)
    c.rect(MARGIN, 68, CONTENT_W, 58, stroke=0, fill=1)
    note = p(
        "<b>Close with:</b> We would like to select one live or upcoming project and prepare a benchmark structural package that tests responsiveness, structural logic, material efficiency, manufacturing practicality and installation simplicity.",
        10,
        INK,
        leading=13,
    )
    note.wrapOn(c, CONTENT_W - 36, 42)
    note.drawOn(c, MARGIN + 18, 84)
    c.showPage()


def build() -> None:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=landscape(A4))
    c.setTitle("Smart Steel x HolmStone - Pre-Meeting Pitch")
    c.setAuthor("Smart Steel")
    page_cover(c)
    page_position(c)
    page_why(c)
    page_platforms(c)
    page_engineering(c)
    page_benchmark(c)
    page_meeting(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
