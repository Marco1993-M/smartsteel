from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "afgri-commercial-framework-test-page.pdf"

PAGE_W, PAGE_H = A4

BLACK = (0, 0, 0)
NAVY = (0 / 255, 29 / 255, 46 / 255)
CREAM = (244 / 255, 240 / 255, 229 / 255)
SOFT = (248 / 255, 246 / 255, 239 / 255)
MID = (0.2, 0.2, 0.2)
LIGHT_LINE = (0.82, 0.82, 0.82)

MARGIN_X = 44
CONTENT_W = PAGE_W - (MARGIN_X * 2)


def set_rgb(c, color):
    c.setFillColorRGB(*color)
    c.setStrokeColorRGB(*color)


def text_width(text, font, size):
    return canvas.Canvas("/tmp/measure.pdf").stringWidth(text, font, size)


def wrap_text(c, text, font, size, max_width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        candidate = word if not line else f"{line} {word}"
        if c.stringWidth(candidate, font, size) <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_wrapped(c, text, x, y, max_width, font="Helvetica", size=10.8, leading=13.2, color=BLACK):
    set_rgb(c, color)
    c.setFont(font, size)
    for line in wrap_text(c, text, font, size, max_width):
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_header_footer(c):
    set_rgb(c, BLACK)
    c.setLineWidth(1.35)
    c.line(MARGIN_X, PAGE_H - 48, PAGE_W - MARGIN_X, PAGE_H - 48)
    c.setFont("Helvetica", 10.8)
    c.drawString(MARGIN_X + 20, PAGE_H - 70, "August")
    c.drawRightString(PAGE_W - MARGIN_X - 20, PAGE_H - 70, "2026")

    footer_y = 70
    c.setLineWidth(1.25)
    c.line(MARGIN_X, footer_y + 38, PAGE_W - MARGIN_X, footer_y + 38)
    c.setFont("Helvetica", 10.3)
    c.drawString(MARGIN_X + 20, footer_y + 13, "A collaborative discussion paper for a controlled pilot across Atlas Warehouses,")
    c.drawString(MARGIN_X + 20, footer_y - 1, "Solar Ground Mounts, Solar Carports and selected agricultural structures.")
    c.setFont("Helvetica-Oblique", 10.3)
    c.drawString(MARGIN_X + 20, footer_y - 22, "Atlas by Smart Steel.")
    c.setFont("Helvetica", 10.3)
    c.drawString(MARGIN_X + 127, footer_y - 22, "Draft for discussion.")


def draw_section_title(c):
    set_rgb(c, CREAM)
    c.rect(MARGIN_X, PAGE_H - 178, 38, 34, fill=1, stroke=0)
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(MARGIN_X + 19, PAGE_H - 164, "06")

    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN_X, PAGE_H - 217, "Commercial Framework")

    c.setFont("Helvetica", 10.5)
    intro = (
        "The preferred commercial structure is a protected dealer-price model, supported by "
        "a proposed pilot return and clear volume incentives as the collaboration scales."
    )
    return draw_wrapped(c, intro, MARGIN_X, PAGE_H - 244, CONTENT_W * 0.86, size=10.5, leading=13.2)


def draw_card(c, x, y, w, h, label, title, body):
    set_rgb(c, CREAM)
    c.rect(x, y - h, w, h, fill=1, stroke=0)
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(x + 13, y - 20, label.upper())
    c.setFont("Helvetica-Bold", 12.2)
    c.drawString(x + 13, y - 43, title)
    draw_wrapped(c, body, x + 13, y - 62, w - 26, size=9.1, leading=10.8, color=BLACK)


def draw_cards(c, top_y):
    gap = 18
    card_w = (CONTENT_W - gap * 2) / 3
    card_h = 108
    cards = [
        (
            "Model",
            "Protected price",
            "Smart Steel sets the approved dealer quotation for the Smart Steel scope.",
        ),
        (
            "Pilot return",
            "5% proposed",
            "Afgri receives a proposed return on qualifying structural supply value.",
        ),
        (
            "Growth",
            "Tier incentives",
            "Additional upside can be linked to agreed volume or branch-adoption thresholds.",
        ),
    ]
    for idx, card in enumerate(cards):
        draw_card(c, MARGIN_X + idx * (card_w + gap), top_y, card_w, card_h, *card)
    return top_y - card_h


def draw_table(c, top_y):
    x = MARGIN_X
    widths = [96, 204, 207]
    row_h = 32
    header_h = 25

    set_rgb(c, NAVY)
    c.rect(x, top_y - header_h, CONTENT_W, header_h, fill=1, stroke=0)
    set_rgb(c, (1, 1, 1))
    c.setFont("Helvetica-Bold", 8.1)
    headers = ["Tier", "Indicative Qualification", "Indicative Commercial Benefit"]
    cx = x
    for idx, header in enumerate(headers):
        c.drawString(cx + 10, top_y - 16, header)
        cx += widths[idx]

    rows = [
        (
            "Partner Entry",
            "Pilot period or early launch period",
            "Proposed 5% pilot commercial return",
        ),
        (
            "Growth Tier",
            "Agreed annual revenue, project volume or branch adoption threshold",
            "Improved dealer margin or additional rebate, subject to modelling",
        ),
        (
            "Strategic Tier",
            "High annual volume, strong payment performance and broad branch adoption",
            "Highest approved incentive or annual performance rebate",
        ),
        (
            "Campaign Tier",
            "Specific product campaign, regional push or seasonal programme",
            "Temporary targeted incentive agreed per campaign",
        ),
    ]

    y = top_y - header_h
    for row_idx, row in enumerate(rows):
        fill = SOFT if row_idx % 2 else (1, 1, 1)
        set_rgb(c, fill)
        c.rect(x, y - row_h, CONTENT_W, row_h, fill=1, stroke=0)
        set_rgb(c, LIGHT_LINE)
        c.setLineWidth(0.55)
        c.line(x, y - row_h, x + CONTENT_W, y - row_h)
        c.line(x + widths[0], y, x + widths[0], y - row_h)
        c.line(x + widths[0] + widths[1], y, x + widths[0] + widths[1], y - row_h)

        tx = x
        for col_idx, value in enumerate(row):
            font = "Helvetica-Bold" if col_idx == 0 else "Helvetica"
            size = 7.7
            draw_wrapped(c, value, tx + 10, y - 12, widths[col_idx] - 18, font=font, size=size, leading=8.8, color=BLACK)
            tx += widths[col_idx]
        y -= row_h

    set_rgb(c, LIGHT_LINE)
    c.rect(x, top_y - header_h - row_h * len(rows), CONTENT_W, header_h + row_h * len(rows), fill=0, stroke=1)
    return top_y - header_h - row_h * len(rows)


def draw_note(c, top_y):
    x = MARGIN_X
    h = 46
    set_rgb(c, SOFT)
    c.rect(x, top_y - h, CONTENT_W, h, fill=1, stroke=0)
    set_rgb(c, NAVY)
    c.rect(x, top_y - h, 6, h, fill=1, stroke=0)
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", 7.8)
    c.drawString(x + 18, top_y - 15, "Commercial note")
    note = (
        "The 5% return should be positioned as a proposed pilot commercial return, subject to final "
        "modelling, qualification rules and written agreement between the parties."
    )
    draw_wrapped(c, note, x + 18, top_y - 29, CONTENT_W - 36, size=8.5, leading=10.2, color=BLACK)


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    draw_header_footer(c)
    y = draw_section_title(c)
    y = draw_cards(c, y - 18)

    c.setFont("Helvetica-Bold", 12.5)
    set_rgb(c, BLACK)
    c.drawString(MARGIN_X, y - 27, "Tiered volume incentives")
    table_bottom = draw_table(c, y - 43)
    draw_note(c, table_bottom - 16)

    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
