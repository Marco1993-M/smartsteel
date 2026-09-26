from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "holmstone-structural-solar-solutions.pdf"
COVER = Path("/Users/marcogerritsen/Desktop/HolmStone.png")

PAGE_W, PAGE_H = A4
MARGIN_X = 58
CONTENT_W = PAGE_W - MARGIN_X * 2

INK = colors.HexColor("#050505")
NAVY = colors.HexColor("#001D2E")
GREEN = colors.HexColor("#2BA84A")
MUTED = colors.HexColor("#555D60")
SOFT = colors.HexColor("#F6F5F0")
CREAM = colors.HexColor("#EFECE3")
LINE = colors.HexColor("#C9C5BA")
WHITE = colors.white
PALE_GREEN = colors.HexColor("#EAF6EC")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Pitch", "/System/Library/Fonts/Supplemental/Arial.ttf"))
    pdfmetrics.registerFont(TTFont("Pitch-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Pitch-Display", "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Pitch-Serif", "/System/Library/Fonts/Supplemental/Georgia.ttf"))
    pdfmetrics.registerFont(TTFont("Pitch-Serif-Italic", "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"))
    pdfmetrics.registerFont(TTFont("Pitch-Serif-BoldItalic", "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf"))


def para(text: str, size=10, color=INK, bold=False, leading=None, align=TA_LEFT, font_name=None) -> Paragraph:
    return Paragraph(
        text,
        ParagraphStyle(
            name=f"para-{size}-{bold}-{align}",
            fontName=font_name or ("Pitch-Bold" if bold else "Pitch"),
            fontSize=size,
            leading=leading or size * 1.35,
            textColor=color,
            alignment=align,
            splitLongWords=False,
        ),
    )


def draw_image_cover(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def header(c: canvas.Canvas, page: int, section: str) -> float:
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.2)
    c.line(MARGIN_X, PAGE_H - 52, PAGE_W - MARGIN_X, PAGE_H - 52)
    c.setFont("Pitch", 9.5)
    c.setFillColor(INK)
    c.drawString(MARGIN_X, PAGE_H - 73, "September")
    c.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 73, "2026")
    c.setFont("Pitch-Bold", 7)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X, PAGE_H - 112, f"{page:02d}  {section.upper()}")
    return PAGE_H - 150


def footer(c: canvas.Canvas, page: int) -> None:
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.0)
    c.line(MARGIN_X, 66, PAGE_W - MARGIN_X, 66)
    c.setFont("Pitch", 8.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X, 42, "Atlas by Smart Steel. Draft for discussion.")
    c.drawRightString(PAGE_W - MARGIN_X, 42, f"{page:02d}")


def title(c: canvas.Canvas, text: str, y: float, size=43) -> float:
    c.setFont("Pitch-Display", size)
    c.setFillColor(INK)
    for line in text.split("\n"):
        c.drawString(MARGIN_X, y, line)
        y -= size * 0.86
    return y - 10


def serif_accent(c: canvas.Canvas, text: str, y: float, size=31, color=NAVY) -> float:
    c.setFont("Pitch-Serif-Italic", size)
    c.setFillColor(color)
    c.drawString(MARGIN_X, y, text)
    return y - size * 1.2


def body(c: canvas.Canvas, text: str, x: float, y: float, w: float, size=10.5, leading=14.3, color=MUTED) -> float:
    p = para(text, size, color, leading=leading)
    available_h = 260
    _, h = p.wrapOn(c, w, available_h)
    p.drawOn(c, x, y - h)
    return y - h


def statement_box(c: canvas.Canvas, y: float, text: str, fill=NAVY) -> float:
    c.setStrokeColor(fill)
    c.setLineWidth(2.0)
    c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)
    p = para(text, 13.5, INK, bold=True, leading=18.4, align=TA_LEFT)
    _, ph = p.wrapOn(c, CONTENT_W - 36, 96)
    p.drawOn(c, MARGIN_X, y - ph - 22)
    y = y - ph - 38
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.line(MARGIN_X, y, PAGE_W - MARGIN_X - 120, y)
    return y - 30


def editorial_columns(c: canvas.Canvas, y: float, columns: list[tuple[str, list[str] | str]], gap=32) -> float:
    col_w = (CONTENT_W - gap * (len(columns) - 1)) / len(columns)
    max_bottom = y
    for idx, (heading, content) in enumerate(columns):
        x = MARGIN_X + idx * (col_w + gap)
        if isinstance(content, list):
            rule_h = min(142, 25 + len(content) * 18)
        else:
            rule_h = 92
        c.setStrokeColor(GREEN if idx % 2 == 0 else NAVY)
        c.setLineWidth(2.2)
        c.line(x, y, x, y - rule_h)
        c.setFont("Pitch-Bold", 7.4)
        c.setFillColor(MUTED)
        c.drawString(x + 16, y - 5, heading.upper())
        if isinstance(content, list):
            yy = y - 30
            for item in content:
                p = para(item, 9.7, INK, leading=12.4)
                _, h = p.wrapOn(c, col_w - 18, 38)
                p.drawOn(c, x + 16, yy - h)
                yy -= h + 8
            max_bottom = min(max_bottom, yy)
        else:
            p = para(content, 10.2, INK, leading=13.2)
            _, h = p.wrapOn(c, col_w - 18, 140)
            p.drawOn(c, x + 16, y - 32 - h)
            max_bottom = min(max_bottom, y - 32 - h)
    return max_bottom - 22


def bullets(c: canvas.Canvas, items: list[str], x: float, y: float, w: float, size=10.2, gap=14, dot=GREEN) -> float:
    for item in items:
        c.setFillColor(dot)
        c.circle(x + 3, y - 4, 2.6, stroke=0, fill=1)
        p = para(item, size, INK, leading=size * 1.22)
        _, h = p.wrapOn(c, w - 18, 40)
        p.drawOn(c, x + 18, y - h)
        y -= h + gap
    return y


def mini_card(c: canvas.Canvas, x: float, y: float, w: float, h: float, label: str, heading: str, text: str, accent=GREEN) -> None:
    c.setFillColor(accent)
    c.rect(x, y - h, 5, h, stroke=0, fill=1)
    c.setFont("Pitch-Bold", 6.8)
    c.drawString(x + 16, y - 18, label.upper())
    c.setFont("Pitch-Bold", 12)
    c.setFillColor(INK)
    c.drawString(x + 16, y - 42, heading)
    p = para(text, 8.8, MUTED, leading=11.3)
    p.wrapOn(c, w - 32, h - 56)
    p.drawOn(c, x + 16, y - h + 17)


def label_chip(c: canvas.Canvas, x: float, y: float, w: float, text: str, fill=SOFT) -> None:
    c.setFillColor(fill)
    c.roundRect(x, y, w, 28, 4, stroke=0, fill=1)
    c.setFont("Pitch-Bold", 7.2)
    c.setFillColor(NAVY)
    c.drawCentredString(x + w / 2, y + 10, text.upper())


def cover_page(c: canvas.Canvas) -> None:
    draw_image_cover(c, COVER, 0, 0, PAGE_W, PAGE_H)
    c.showPage()


def dream_outcome(c: canvas.Canvas) -> None:
    y = header(c, 2, "Dream outcome")
    y = title(c, "Win, price and\ndeliver more\nsolar projects.", y, size=42)
    y = serif_accent(c, "With less structural friction.", y + 8, size=31)
    y -= 12
    y = statement_box(
        c,
        y,
        "Smart Steel helps HolmStone add speed, cost certainty and delivery capacity to the solar projects it is already winning, pricing and delivering.",
    )
    y = body(
        c,
        "HolmStone keeps the energy project, client relationship and EPC outcome. Smart Steel adds specialist structural delivery capacity around it.",
        MARGIN_X,
        y,
        CONTENT_W,
        size=11.2,
        leading=15.2,
    )
    y -= 30
    y2 = y - 26
    bullets(
        c,
        [
            "Faster structural input during tendering",
            "Clearer structural costing before execution",
            "Less internal coordination around structural detail",
            "Additional delivery capacity when project volume increases",
        ],
        MARGIN_X + 26,
        y2,
        CONTENT_W - 52,
        size=10.2,
        gap=13,
    )
    footer(c, 2)
    c.showPage()


def the_offer(c: canvas.Canvas) -> None:
    y = header(c, 3, "The offer")
    y = title(c, "Array inputs in.\nStructural package out.", y, size=42)
    y = statement_box(
        c,
        y,
        "HolmStone gives Smart Steel the array requirements and site parameters. Smart Steel converts them into a structural solar package.",
        fill=GREEN,
    )
    y = body(
        c,
        "The aim is not to replace HolmStone's process. The aim is to make the structural side of that process faster, clearer and easier to deliver.",
        MARGIN_X,
        y,
        CONTENT_W,
        size=11.2,
        leading=15.2,
    )
    y -= 42
    editorial_columns(
        c,
        y,
        [
            (
                "Structural package",
                [
                    "Early structural logic",
                    "Budget costing",
                    "Structural engineering",
                    "Production detailing",
                    "Manufacturing and packaging",
                    "Delivery and installation-aware planning",
                ],
            ),
            (
                "Value to HolmStone",
                [
                    "Earlier tender confidence",
                    "Clearer project assumptions",
                    "Less coordination load",
                    "More complete structural scope",
                    "More practical site execution",
                    "Better basis for comparison",
                ],
            ),
        ],
    )
    footer(c, 3)
    c.showPage()


def value_stack(c: canvas.Canvas) -> None:
    y = header(c, 4, "Value stack")
    y = title(c, "Not cheaper steel.", y, size=40)
    y = serif_accent(c, "A better structural outcome.", y + 4, size=28)
    y += 10
    c.setFont("Pitch", 11)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X, y, "The useful comparison is total cost, speed and friction of getting the structural package delivered.")
    y -= 48
    w = (CONTENT_W - 16) / 2
    mini_card(c, MARGIN_X, y, w, 106, "01", "Tender Advantage", "Earlier structural input and clearer costing help HolmStone qualify, price and shape solar projects with more confidence.", GREEN)
    mini_card(c, MARGIN_X + w + 16, y, w, 106, "02", "Margin Protection", "Better structural assumptions reduce pricing surprises between tender, engineering and execution.", NAVY)
    y -= 124
    mini_card(c, MARGIN_X, y, w, 106, "03", "Execution Simplicity", "A more complete structural package reduces interfaces, scope gaps, site uncertainty and coordination load.", NAVY)
    mini_card(c, MARGIN_X + w + 16, y, w, 106, "04", "Capacity Leverage", "Additional structural delivery capacity helps HolmStone handle volume without permanent internal overhead.", GREEN)
    y -= 150
    c.setStrokeColor(GREEN)
    c.setLineWidth(2)
    c.line(MARGIN_X + 46, y, PAGE_W - MARGIN_X - 46, y)
    p = para("If the structural workstream is slow, tendering slows. If costing is unclear, margin risk increases. If installation is difficult, steel savings can disappear in labour, delays and rework.", 10.2, INK, leading=14.2, align=TA_CENTER, font_name="Pitch-Serif-BoldItalic")
    _, h = p.wrapOn(c, CONTENT_W - 40, 54)
    p.drawOn(c, MARGIN_X + 20, y - h - 20)
    c.setStrokeColor(GREEN)
    c.setLineWidth(0.8)
    c.line(MARGIN_X + 100, y - h - 36, PAGE_W - MARGIN_X - 100, y - h - 36)
    footer(c, 4)
    c.showPage()


def why_smart_steel(c: canvas.Canvas) -> None:
    y = header(c, 5, "Why Smart Steel")
    y = title(c, "One delivery system.", y, size=42)
    y = serif_accent(c, "Not a supplier chain.", y + 3, size=30)
    y += 4
    y = statement_box(
        c,
        y,
        "Atlas gives Smart Steel a way to turn recurring structural decisions into repeatable product logic.",
    )
    y = body(
        c,
        "A conventional structural route can treat every project as a fresh coordination exercise. Smart Steel is building the opposite model: standardise what repeats, engineer what changes.",
        MARGIN_X,
        y,
        CONTENT_W,
        size=11,
        leading=15,
    )
    y -= 36
    proof_y = y
    proof_items = [
        (
            "Engineered as a system",
            "Repeatable structural logic rather than isolated project designs.",
            GREEN,
        ),
        (
            "Designed for manufacture",
            "Engineering and production detailing developed around the manufacturing process.",
            NAVY,
        ),
        (
            "Designed for assembly",
            "Repeatable components and connections developed with site execution in mind.",
            GREEN,
        ),
    ]
    col_gap = 16
    col_w = (CONTENT_W - col_gap * 2) / 3
    for idx, (label, text, accent) in enumerate(proof_items):
        x = MARGIN_X + idx * (col_w + col_gap)
        c.setStrokeColor(accent)
        c.setLineWidth(2.2)
        c.line(x, proof_y, x, proof_y - 114)
        c.setFont("Pitch-Bold", 7.2)
        c.setFillColor(MUTED)
        c.drawString(x + 13, proof_y - 4, label.upper())
        p = para(text, 9.3, INK, leading=12.0)
        _, h = p.wrapOn(c, col_w - 16, 78)
        p.drawOn(c, x + 13, proof_y - 31 - h)
    y = proof_y - 148
    bullets(
        c,
        [
            "Project-specific constraints still receive proper engineering attention.",
            "HolmStone retains project and engineering oversight while Smart Steel adds dedicated structural delivery capacity.",
        ],
        MARGIN_X + 24,
        y,
        CONTENT_W - 48,
        size=10.5,
        gap=15,
    )
    c.setFont("Pitch-Bold", 8)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X, 186, "APPLIES ACROSS SELECTED STRUCTURAL SOLAR WORK")
    chip_w = (CONTENT_W - 24) / 4
    for idx, label in enumerate(["Ground mounts", "Elevated structures", "Solar carports", "Custom applications"]):
        label_chip(c, MARGIN_X + idx * (chip_w + 8), 148, chip_w, label, PALE_GREEN if idx in [0, 2] else SOFT)
    footer(c, 5)
    c.showPage()


def proof_step(c: canvas.Canvas) -> None:
    y = header(c, 6, "Practical proof")
    y = title(c, "One suitable\nproject.", y, size=43)
    y = serif_accent(c, "Enough to test the value.", y + 4, size=28)
    y += 8
    y = statement_box(
        c,
        y,
        "Let HolmStone benchmark Smart Steel's structural approach against its current route on a real project.",
        fill=GREEN,
    )
    y = body(
        c,
        "HolmStone does not need to change its process to test the value. No exclusivity. No supplier replacement. No long-term commitment upfront. Just a practical comparison against the current solution.",
        MARGIN_X,
        y,
        CONTENT_W,
        size=11,
        leading=15,
    )
    y -= 60
    editorial_columns(
        c,
        y,
        [
            (
                "Compare",
                [
                    "Structural cost",
                    "Material weight",
                    "Engineering logic",
                    "Turnaround time",
                    "Scope completeness",
                    "Manufacturing practicality",
                    "Installation simplicity",
                    "Overall delivery friction",
                ],
            ),
            (
                "Potential next step",
                "If Smart Steel can add value on one project, the same model can be explored across selected future projects where speed, certainty and delivery capacity matter.",
            ),
        ],
    )
    footer(c, 6)
    c.showPage()


def build() -> None:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("HolmStone Structural Solar Solutions")
    c.setAuthor("Smart Steel")
    cover_page(c)
    dream_outcome(c)
    the_offer(c)
    value_stack(c)
    why_smart_steel(c)
    proof_step(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
