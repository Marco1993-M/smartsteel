from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
COVER = Path("/Users/marcogerritsen/Desktop/Afgri Proposal Cover.png")
OUT = ROOT / "output" / "pdf" / "afgri-commercial-collaboration-framework.pdf"

PAGE_W, PAGE_H = A4

BLACK = (0, 0, 0)
WHITE = (1, 1, 1)
NAVY = (0 / 255, 29 / 255, 46 / 255)
CREAM = (244 / 255, 240 / 255, 229 / 255)
SOFT = (248 / 255, 246 / 255, 239 / 255)
LINE = (0.82, 0.82, 0.82)
MUTED = (0.28, 0.28, 0.28)

MARGIN_X = 44
CONTENT_W = PAGE_W - (MARGIN_X * 2)
TOP_RULE_Y = PAGE_H - 48
BOTTOM_RULE_Y = 108
BOTTOM_SAFE = 136


def set_rgb(c, color):
    c.setFillColorRGB(*color)
    c.setStrokeColorRGB(*color)


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


def draw_wrapped(c, text, x, y, max_width, font="Helvetica", size=10.2, leading=12.4, color=BLACK):
    set_rgb(c, color)
    c.setFont(font, size)
    for line in wrap_text(c, text, font, size, max_width):
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_header_footer(c, page_no=None):
    set_rgb(c, BLACK)
    c.setLineWidth(1.35)
    c.line(MARGIN_X, TOP_RULE_Y, PAGE_W - MARGIN_X, TOP_RULE_Y)
    c.setFont("Helvetica", 10.5)
    c.drawString(MARGIN_X + 20, PAGE_H - 70, "August")
    c.drawRightString(PAGE_W - MARGIN_X - 20, PAGE_H - 70, "2026")
    if page_no is not None:
        c.setFont("Helvetica", 8.2)
        c.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 30, f"{page_no:02d}")

    c.setLineWidth(1.25)
    c.line(MARGIN_X, BOTTOM_RULE_Y, PAGE_W - MARGIN_X, BOTTOM_RULE_Y)
    c.setFont("Helvetica", 9.5)
    c.drawString(MARGIN_X + 20, 83, "A collaborative discussion paper for a controlled pilot across Atlas Warehouses,")
    c.drawString(MARGIN_X + 20, 69, "Solar Ground Mounts, Solar Carports and selected agricultural structures.")
    c.setFont("Helvetica-Oblique", 9.5)
    c.drawString(MARGIN_X + 20, 48, "Atlas by Smart Steel.")
    c.setFont("Helvetica", 9.5)
    c.drawString(MARGIN_X + 123, 48, "Draft for discussion.")


def draw_cover(c):
    c.drawImage(ImageReader(str(COVER)), 0, 0, width=PAGE_W, height=PAGE_H)
    c.showPage()


def start_page(c, section_no, title, intro=None, page_no=None, title_size=26):
    draw_header_footer(c, page_no=page_no)
    set_rgb(c, CREAM)
    c.rect(MARGIN_X, PAGE_H - 178, 38, 34, fill=1, stroke=0)
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(MARGIN_X + 19, PAGE_H - 164, section_no)
    c.setFont("Helvetica-Bold", title_size)
    c.drawString(MARGIN_X, PAGE_H - 217, title)
    y = PAGE_H - 244
    if intro:
        y = draw_wrapped(c, intro, MARGIN_X, y, CONTENT_W * 0.88, size=10.4, leading=13.2)
    return y - 14


def para(c, text, x, y, width, size=9.8, leading=12.2, font="Helvetica"):
    return draw_wrapped(c, text, x, y, width, font=font, size=size, leading=leading)


def heading(c, text, x, y, size=12.5):
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)
    return y - 18


def bullet_list(c, items, x, y, width, size=8.9, leading=10.7, gap=3):
    set_rgb(c, BLACK)
    for item in items:
        c.setFont("Helvetica-Bold", size)
        c.drawString(x, y, "-")
        y = draw_wrapped(c, item, x + 12, y, width - 12, size=size, leading=leading)
        y -= gap
    return y


def card(c, x, y, w, h, label, title, body, fill=CREAM):
    set_rgb(c, fill)
    c.rect(x, y - h, w, h, fill=1, stroke=0)
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(x + 13, y - 18, label.upper())
    c.setFont("Helvetica-Bold", 11.4)
    c.drawString(x + 13, y - 39, title)
    draw_wrapped(c, body, x + 13, y - 58, w - 26, size=8.5, leading=10.1)


def cards3(c, y, cards, h=104):
    gap = 18
    w = (CONTENT_W - gap * 2) / 3
    for idx, data in enumerate(cards):
        card(c, MARGIN_X + idx * (w + gap), y, w, h, *data)
    return y - h


def note(c, y, label, text, h=48):
    x = MARGIN_X
    set_rgb(c, SOFT)
    c.rect(x, y - h, CONTENT_W, h, fill=1, stroke=0)
    set_rgb(c, NAVY)
    c.rect(x, y - h, 6, h, fill=1, stroke=0)
    set_rgb(c, BLACK)
    c.setFont("Helvetica-Bold", 7.8)
    c.drawString(x + 18, y - 15, label)
    draw_wrapped(c, text, x + 18, y - 29, CONTENT_W - 36, size=8.5, leading=10.2)
    return y - h


def table(c, x, y, widths, headers, rows, row_h=34, header_h=25, font_size=7.6):
    total_w = sum(widths)
    set_rgb(c, NAVY)
    c.rect(x, y - header_h, total_w, header_h, fill=1, stroke=0)
    set_rgb(c, WHITE)
    c.setFont("Helvetica-Bold", 8.0)
    cx = x
    for idx, h in enumerate(headers):
        c.drawString(cx + 10, y - 16, h)
        cx += widths[idx]
    y -= header_h
    for r_idx, row in enumerate(rows):
        fill = SOFT if r_idx % 2 else WHITE
        set_rgb(c, fill)
        c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
        set_rgb(c, LINE)
        c.setLineWidth(0.5)
        c.line(x, y - row_h, x + total_w, y - row_h)
        cx = x
        for col in widths[:-1]:
            cx += col
            c.line(cx, y, cx, y - row_h)
        cx = x
        for col_idx, value in enumerate(row):
            font = "Helvetica-Bold" if col_idx == 0 else "Helvetica"
            draw_wrapped(c, value, cx + 10, y - 12, widths[col_idx] - 18, font=font, size=font_size, leading=font_size + 1.3)
            cx += widths[col_idx]
        y -= row_h
    set_rgb(c, LINE)
    c.rect(x, y, total_w, header_h + row_h * len(rows), fill=0, stroke=1)
    return y


def two_columns(c, y, left_title, left_items, right_title, right_items):
    gap = 24
    w = (CONTENT_W - gap) / 2
    y_left = heading(c, left_title, MARGIN_X, y, size=11.5)
    y_left = bullet_list(c, left_items, MARGIN_X, y_left, w, size=8.7)
    y_right = heading(c, right_title, MARGIN_X + w + gap, y, size=11.5)
    y_right = bullet_list(c, right_items, MARGIN_X + w + gap, y_right, w, size=8.7)
    return min(y_left, y_right)


def flow(c, y, steps, cols=4):
    gap = 12
    w = (CONTENT_W - gap * (cols - 1)) / cols
    h = 58
    for idx, (num, title, body) in enumerate(steps):
        row = idx // cols
        col = idx % cols
        x = MARGIN_X + col * (w + gap)
        yy = y - row * (h + 12)
        set_rgb(c, CREAM if idx % 2 == 0 else SOFT)
        c.rect(x, yy - h, w, h, fill=1, stroke=0)
        set_rgb(c, BLACK)
        c.setFont("Helvetica-Bold", 7.6)
        c.drawString(x + 10, yy - 14, num)
        c.setFont("Helvetica-Bold", 8.8)
        c.drawString(x + 10, yy - 29, title)
        draw_wrapped(c, body, x + 10, yy - 43, w - 20, size=7.2, leading=8.1)
    rows = (len(steps) + cols - 1) // cols
    return y - rows * (h + 12)


def page_important_note(c, page_no):
    y = start_page(c, "00", "Document Status", "This paper supports commercial and operational alignment between Smart Steel and Afgri.", page_no, title_size=27)
    y = note(c, y - 8, "Important note", "This discussion paper is not a binding offer, legal agreement or final commercial proposal. All commercial, legal, tax, financing, product, installation and operational terms remain subject to further modelling, review and written agreement.", h=74)
    y = heading(c, "Purpose", MARGIN_X, y - 28)
    y = para(c, "The document is intended to help both parties test the logic of an Atlas-enabled commercial collaboration before committing to a broader rollout.", MARGIN_X, y, CONTENT_W * 0.84)
    cards3(c, y - 24, [
        ("Audience", "Afgri stakeholders", "Partnership, commercial, finance and operations teams."),
        ("Status", "Draft for discussion", "Designed to support alignment, challenge and refinement."),
        ("Basis", "Subject to agreement", "Commercial assumptions remain open until final written agreement."),
    ], h=94)
    c.showPage()


def page_exec(c, page_no):
    y = start_page(c, "01", "Executive Overview", None, page_no, title_size=28)
    y = para(c, "Smart Steel and Afgri have a potential opportunity to create a practical infrastructure collaboration for agricultural, commercial and energy-related customers.", MARGIN_X, y, CONTENT_W * 0.92, size=10.0, leading=12.4)
    y = para(c, "The proposed model combines Afgri's customer relationships, finance capability, branch network and market credibility with Smart Steel's modular steel infrastructure systems, structural engineering capability, manufacturing base, technical support and Atlas digital platform.", MARGIN_X, y - 10, CONTENT_W * 0.92, size=10.0, leading=12.4)
    y = para(c, "The aim is to create a simple commercial path for Afgri: generate customer opportunity and additional return, without carrying unnecessary technical, installation or operational complexity.", MARGIN_X, y - 10, CONTENT_W * 0.92, size=10.0, leading=12.4)
    y = heading(c, "The intended customer experience is simple:", MARGIN_X, y - 14, size=11)
    cards3(c, y, [
        ("Afgri", "Customer channel", "Primary commercial relationship, customer-facing partner and finance channel."),
        ("Smart Steel", "Technical partner", "Technical review, engineering, manufacturing, documentation and project delivery support."),
        ("Atlas", "Workflow platform", "Lead capture, configuration, quotation workflow, project tracking and after-sales support."),
    ], h=112)
    note(c, y - 142, "Pilot principle", "Start controlled. Prove customer appetite, branch adoption, finance workflow, product fit, quotation turnaround, installation delivery and Atlas usability before scaling nationally.", h=58)
    c.showPage()


def page_rationale(c, page_no):
    y = start_page(c, "02", "Collaboration Rationale", "The proposed collaboration is based on a clear fit between Afgri's market access and Smart Steel's infrastructure capability.", page_no)
    y = two_columns(c, y, "Afgri brings", [
        "Established agricultural and commercial customer relationships.",
        "Trusted branch and sales network.",
        "Customer financing capability.",
        "Commercial credibility with agricultural producers.",
        "Ongoing account management and repeat-customer reach.",
    ], "Smart Steel brings", [
        "Engineered modular steel systems.",
        "Structural design and technical review capability.",
        "Manufacturing and supply capability.",
        "Standardised product logic across launch categories.",
        "Atlas workflow for configuration, quotation and tracking.",
    ])
    note(c, y - 18, "Shared opportunity", "A customer can engage through Afgri, access finance, select a structure, receive Smart Steel technical support and move through a controlled process from enquiry to delivery, installation and warranty support.", h=62)
    c.showPage()


def page_model(c, page_no):
    y = start_page(c, "03", "Proposed Collaboration Model", "The preferred structure is a protected dealer-price model, with Afgri remaining the customer-facing commercial party.", page_no)
    y = flow(c, y - 8, [
        ("01", "Customer", "Afgri qualifies the opportunity."),
        ("02", "Atlas", "Project information is captured."),
        ("03", "Review", "Smart Steel reviews scope and assumptions."),
        ("04", "Dealer quote", "Smart Steel quotes Afgri."),
        ("05", "Proposal", "Afgri issues customer proposal."),
        ("06", "Finance", "Payment or finance is managed."),
        ("07", "PO", "Afgri instructs Smart Steel."),
        ("08", "Delivery", "Smart Steel executes agreed scope."),
    ], cols=4)
    y = heading(c, "Why this model", MARGIN_X, y - 18)
    y = bullet_list(c, [
        "Afgri remains the primary customer relationship owner.",
        "Smart Steel retains technical, engineering and manufacturing control.",
        "Pricing discipline is easier to manage than under an open commission model.",
        "A commission model can remain available only where a specific transaction structure requires it.",
    ], MARGIN_X, y, CONTENT_W * 0.78)
    c.showPage()


def page_customer_journey(c, page_no):
    y = start_page(c, "04", "Customer Journey", "The journey is designed to reduce informal quoting, incomplete project information, uncontrolled scope changes and fragmented communication.", page_no)
    steps = [
        ("01", "Opportunity", "Afgri receives or identifies a customer opportunity."),
        ("02", "Qualification", "Customer, product and finance needs are captured."),
        ("03", "Technical review", "Smart Steel reviews project information."),
        ("04", "Dealer quotation", "Smart Steel issues approved quote to Afgri."),
        ("05", "Customer proposal", "Afgri issues proposal and manages finance."),
        ("06", "Acceptance", "Customer accepts and Afgri issues instruction."),
        ("07", "Execution", "Engineering, manufacturing, delivery and installation proceed."),
        ("08", "Close-out", "Completion, snagging and warranty registration are recorded."),
    ]
    flow(c, y - 8, steps, cols=4)
    c.showPage()


def page_commercial(c, page_no):
    y = start_page(c, "05", "Commercial Framework", "The preferred commercial structure is a protected dealer-price model, supported by a proposed pilot return and clear volume incentives as the collaboration scales.", page_no, title_size=28)
    y = cards3(c, y - 4, [
        ("Model", "Protected price", "Smart Steel sets the approved dealer quotation for the Smart Steel scope."),
        ("Pilot return", "5% proposed", "Afgri receives a proposed return on qualifying structural supply value."),
        ("Growth", "Tier incentives", "Additional upside can be linked to agreed volume or branch-adoption thresholds."),
    ], h=108)
    c.setFont("Helvetica-Bold", 12.5)
    set_rgb(c, BLACK)
    c.drawString(MARGIN_X, y - 27, "Tiered volume incentives")
    bottom = table(c, MARGIN_X, y - 43, [96, 204, 207], ["Tier", "Indicative Qualification", "Indicative Commercial Benefit"], [
        ("Partner Entry", "Pilot period or early launch period", "Proposed 5% pilot commercial return"),
        ("Growth Tier", "Agreed annual revenue, project volume or branch adoption threshold", "Improved dealer margin or additional rebate, subject to modelling"),
        ("Strategic Tier", "High annual volume, strong payment performance and broad branch adoption", "Highest approved incentive or annual performance rebate"),
        ("Campaign Tier", "Specific product campaign, regional push or seasonal programme", "Temporary targeted incentive agreed per campaign"),
    ], row_h=32, font_size=7.7)
    note(c, bottom - 16, "Commercial note", "The 5% return should be positioned as a proposed pilot commercial return, subject to final modelling, qualification rules and written agreement between the parties.", h=46)
    c.showPage()


def page_return(c, page_no):
    y = start_page(c, "06", "Pilot Return Basis", "The proposed starting commercial return for Afgri is 5% during the pilot and initial launch period.", page_no)
    y = note(c, y - 4, "Recommended calculation base", "5% of the approved Smart Steel structural supply value, excluding VAT, delivery, installation, foundations, professional fees and third-party equipment unless otherwise agreed.", h=60)
    y = heading(c, "The return should apply where", MARGIN_X, y - 24)
    bullet_list(c, [
        "The opportunity is properly registered through the Afgri channel.",
        "The project is approved by Smart Steel.",
        "The customer accepts the approved Afgri customer proposal.",
        "Any required payment condition, deposit or finance approval has been met.",
        "Afgri issues the required purchase order or formal instruction to Smart Steel.",
        "The project proceeds within the approved scope and commercial terms.",
    ], MARGIN_X, y, CONTENT_W * 0.82)
    c.showPage()


def page_portfolio(c, page_no):
    y = start_page(c, "07", "Launch Product Portfolio", "The pilot should focus on product categories that are commercially attractive, technically supportable and suitable for structured selling.", page_no)
    gap = 18
    w = (CONTENT_W - gap) / 2
    h = 116
    items = [
        ("Primary", "Atlas Warehouses", "Standard widths, bay increments, cladding options, supply-only and installed options, and location-dependent delivery."),
        ("Energy", "Solar Ground Mounts", "Modular structural arrangements, panel configuration logic and project-specific engineering where required."),
        ("Energy", "Solar Carports", "Parking shade and solar infrastructure in one structure, with standard bay and panel layout logic."),
        ("Request-only", "Custom Agricultural Structures", "Agricultural storage, workshops, livestock structures, poultry buildings, pump houses and custom solar structures."),
    ]
    for i, item in enumerate(items):
        x = MARGIN_X + (i % 2) * (w + gap)
        yy = y - (i // 2) * (h + 20)
        card(c, x, yy, w, h, *item)
    note(c, y - 2 * (h + 20) - 12, "Pilot boundary", "Custom agricultural structures should remain request-only until engineering, pricing rules, documentation and scope definitions have been standardised.", h=52)
    c.showPage()


def page_marketing(c, page_no):
    y = start_page(c, "08", "Afgri-Led Marketing Approach", "Afgri should control the customer-facing marketing campaign for the pilot, with Smart Steel available to support where requested.", page_no)
    y = cards3(c, y - 4, [
        ("Lead", "Afgri controls marketing", "Afgri drives campaign timing, channels, message and customer activation through its own market reach."),
        ("Support", "Smart Steel on request", "Smart Steel can supply product data, creatives, technical summaries and visuals whenever Afgri needs them."),
        ("Measure", "Atlas attribution", "Campaign source, branch, salesperson, lead status and conversion outcome are captured."),
    ], h=120)
    y = two_columns(c, y - 28, "Afgri leads", [
        "Campaign planning and branch-level promotion.",
        "Customer database communication.",
        "Finance-led campaign messaging.",
        "Regional campaign selection and salesperson activation.",
        "Lead follow-up and customer relationship management.",
    ], "Smart Steel available support", [
        "Product sheets and technical data.",
        "Standard configuration guidance.",
        "Product imagery, creatives and project visuals.",
        "Proposal content and scope language when requested.",
        "Atlas lead-capture and training content as needed.",
    ])
    c.showPage()


def page_campaigns(c, page_no):
    y = start_page(c, "09", "Campaign Execution", "Campaign material should be practical, measurable and led by Afgri, with Smart Steel support available where useful.", page_no)
    y = heading(c, "Initial campaign themes", MARGIN_X, y)
    y = bullet_list(c, [
        "Farm storage and operational infrastructure.",
        "Modular warehouse solutions.",
        "Solar-ready steel structures.",
        "Solar ground-mount infrastructure.",
        "Solar carport structures.",
        "Finance-enabled infrastructure upgrades.",
        "Seasonal or regional agricultural infrastructure needs.",
    ], MARGIN_X, y, CONTENT_W * 0.45)
    note(c, PAGE_H - 348, "Marketing control", "Afgri should have full control of the pilot marketing campaign. Smart Steel can provide product data, creatives, visuals and technical inputs at any point where Afgri requests support.", h=72)
    cards3(c, PAGE_H - 450, [
        ("Voice", "Afgri customer lead", "Afgri owns customer-facing campaign voice, channels and deployment."),
        ("Support", "Smart Steel resources", "Smart Steel supplies accurate product, technical and creative resources when needed."),
        ("Reporting", "Pilot evidence", "Lead source, branch, salesperson, finance interest and conversion outcome are recorded."),
    ], h=112)
    c.showPage()


def page_technical(c, page_no):
    y = start_page(c, "10", "Technical Qualification", "Afgri sales personnel should be supported by a guided workflow rather than asked to make structural decisions.", page_no)
    y = heading(c, "Atlas should capture", MARGIN_X, y)
    y = two_columns(c, y, "Site and scope", [
        "Site location and GPS position where available.",
        "Structure dimensions and intended use.",
        "Site photographs and access constraints.",
        "Terrain, exposure and wind considerations.",
        "Ground and foundation information.",
    ], "Product and project data", [
        "Installation scope and cladding requirements.",
        "Openings and access requirements.",
        "Solar-panel specifications where applicable.",
        "Existing infrastructure and site levels.",
        "Delivery and site-readiness constraints.",
    ])
    cards3(c, y - 18, [
        ("Estimate", "Budget estimate", "Indicative estimate before final technical review."),
        ("Supplier", "Dealer quotation", "Smart Steel quotation to Afgri after technical and commercial approval."),
        ("Customer", "Afgri proposal", "Customer-facing proposal using approved scope, pricing basis and exclusions."),
    ], h=106)
    c.showPage()


def page_installation(c, page_no):
    y = start_page(c, "11", "Installation Approach", "Afgri's involvement should remain simple. Smart Steel can support installed projects, or the customer can self-install on a supply-only basis.", page_no)
    gap = 24
    w = (CONTENT_W - gap) / 2
    card(c, MARGIN_X, y - 4, w, 122, "Model", "Smart Steel-installed", "Smart Steel manages installation through approved installers, with construction responsibilities and site requirements clearly agreed.")
    card(c, MARGIN_X + w + gap, y - 4, w, 122, "Model", "Supply-only", "The customer self-installs or appoints its own installer, with Smart Steel providing installation directions and technical documentation.")
    y = heading(c, "Project responsibilities should clarify", MARGIN_X, y - 152)
    bullet_list(c, [
        "Who appoints the installer and manages construction health and safety.",
        "Who acts as principal contractor where required.",
        "Who manages site readiness and signs off practical completion.",
        "Who carries installation workmanship warranty.",
        "How snagging is recorded and resolved.",
        "What installation standards and documentation must be followed.",
        "What installation directions and support documents Smart Steel provides for supply-only projects.",
    ], MARGIN_X, y, CONTENT_W * 0.84)
    c.showPage()


def page_financing(c, page_no):
    y = start_page(c, "12", "Financing", "Afgri's financing capability is a central differentiator in the proposed collaboration.", page_no)
    y = para(c, "The financing process should be integrated into the customer journey and, where practical, into Atlas. This would allow the customer to move from product interest to structured finance, technical review, acceptance and project delivery through one coordinated process.", MARGIN_X, y, CONTENT_W * 0.9)
    y = heading(c, "The financing model should clarify", MARGIN_X, y - 16)
    y = two_columns(c, y, "Eligibility", [
        "Which products qualify for finance.",
        "Whether supply-only and installed projects qualify.",
        "Whether delivery, foundations, installation, VAT and professional fees can be financed.",
        "Minimum and maximum finance values.",
    ], "Commercial treatment", [
        "Deposit requirements and finance terms.",
        "Credit-assessment and security requirements.",
        "Payment timing from Afgri to Smart Steel.",
        "Treatment of cancellations and customer default.",
    ])
    note(c, y - 16, "Payment principle", "Smart Steel should be paid by Afgri according to agreed supplier payment milestones. Customer repayment performance under Afgri financing should be treated separately from Smart Steel supplier payment terms.", h=60)
    c.showPage()


def page_atlas(c, page_no):
    y = start_page(c, "13", "Atlas Partner Dashboard", "The Afgri-dedicated Atlas dashboard would provide the structured workflow for the collaboration.", page_no)
    y = heading(c, "Atlas should reduce", MARGIN_X, y)
    y = bullet_list(c, [
        "Email dependency, incomplete enquiries and pricing inconsistency.",
        "Technical misunderstandings, lost documentation and unclear project status.",
        "Warranty confusion and missing project decision history.",
    ], MARGIN_X, y, CONTENT_W * 0.85)
    y = heading(c, "Pilot dashboard functions", MARGIN_X, y - 18)
    y = two_columns(c, y, "Sales workflow", [
        "Secure Afgri salesperson login.",
        "Lead capture and customer profile.",
        "Product selection and preliminary configuration.",
        "Budget estimate and site-information capture.",
        "Document and image upload.",
    ], "Project workflow", [
        "Smart Steel technical-review workflow.",
        "Dealer quotation status.",
        "Purchase-order or instruction record.",
        "Basic project status and support requests.",
        "Reporting by branch and salesperson.",
    ])
    c.showPage()


def page_scope(c, page_no):
    y = start_page(c, "14", "Scope Changes and Cancellations", "Any change after customer acceptance may affect engineering, pricing, procurement, delivery timing, installation method or warranty.", page_no, title_size=24)
    y = heading(c, "Changes requiring review", MARGIN_X, y)
    y = bullet_list(c, [
        "Structure dimensions, cladding, finish, openings or access points.",
        "Site location, access conditions, foundation scope or solar-panel specification.",
        "Installation scope, programme, delivery date or departure from approved drawings.",
    ], MARGIN_X, y, CONTENT_W * 0.9)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN_X, y - 12, "Cancellation framework")
    table(c, MARGIN_X, y - 30, [180, 327], ["Cancellation Stage", "Indicative Treatment for Discussion"], [
        ("Before detailed engineering begins", "Administration or design fee where applicable"),
        ("After engineering begins", "Engineering completed becomes payable"),
        ("After material procurement", "Engineering plus committed materials and supplier costs become payable"),
        ("During manufacturing", "Work completed plus committed costs become payable"),
        ("After dispatch readiness", "Full structural supply value becomes payable"),
    ], row_h=30, font_size=7.5)
    c.showPage()


def page_warranty(c, page_no):
    y = start_page(c, "15", "Warranty and Claims", "Afgri should remain the first point of contact for customer warranty claims.", page_no)
    y = flow(c, y - 4, [
        ("01", "Customer", "Customer contacts Afgri."),
        ("02", "Log", "Afgri logs the claim in Atlas."),
        ("03", "Triage", "Smart Steel supports technical triage."),
        ("04", "Assign", "Responsible party is assigned."),
        ("05", "Evidence", "Photos and site notes are uploaded."),
        ("06", "Inspect", "Site inspection is arranged if required."),
        ("07", "Correct", "Corrective action is approved and completed."),
        ("08", "Close-out", "Claim close-out is recorded in Atlas."),
    ], cols=4)
    note(c, y - 12, "Warranty principle", "Each party should warrant the work, product or service within its control. Warranty terms, exclusions and service levels should be agreed before launch.", h=54)
    c.showPage()


def page_pilot(c, page_no):
    y = start_page(c, "16", "Pilot Structure", "The collaboration should begin with a controlled pilot before broad rollout.", page_no)
    y = heading(c, "The pilot should test", MARGIN_X, y)
    y = bullet_list(c, [
        "Customer demand, branch adoption and salesperson activation.",
        "Finance workflow and payment timing.",
        "Smart Steel technical-review workload and quotation turnaround.",
        "Pricing accuracy, installation delivery and customer experience.",
        "Atlas dashboard usability and commercial viability for both parties.",
    ], MARGIN_X, y, CONTENT_W * 0.86)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN_X, y - 12, "Initial service-level targets")
    table(c, MARGIN_X, y - 30, [260, 247], ["Activity", "Proposed Target"], [
        ("Afgri lead acknowledgement", "1 business day"),
        ("Smart Steel completeness review", "1 business day after submission"),
        ("Standard off-the-shelf dealer quotation", "1 business day after complete information"),
        ("Custom project dealer quotation", "3 to 5 business days after complete technical information"),
        ("Warranty claim acknowledgement", "1 business day"),
    ], row_h=30, font_size=7.6)
    c.showPage()


def page_governance(c, page_no):
    y = start_page(c, "17", "Governance", "Atlas can manage project workflow, but the relationship itself still needs governance, escalation and review.", page_no)
    y = cards3(c, y - 4, [
        ("Owner", "Named leads", "Smart Steel and Afgri each appoint commercial and operational owners."),
        ("Cadence", "Pilot rhythm", "Weekly operational check-ins during month one, then monthly steering meetings."),
        ("Escalation", "Clear routes", "Finance, complaints, pricing, variation, installer and quality escalations are defined."),
    ], h=120)
    y = heading(c, "Rollout decision", MARGIN_X, y - 26)
    bullet_list(c, [
        "Broader rollout should be based on agreed success criteria.",
        "Criteria should include commercial performance, branch adoption, customer feedback and finance workflow.",
        "Installation readiness, dashboard readiness and unresolved legal or operational items should be reviewed before scale.",
    ], MARGIN_X, y, CONTENT_W * 0.86)
    c.showPage()


def page_alignment(c, page_no):
    y = start_page(c, "18", "Matters for Joint Alignment", "The following matters should be discussed and agreed before launch.", page_no, title_size=24)
    table(c, MARGIN_X, y, [145, 362], ["Area", "Matter for Alignment"], [
        ("Commercial", "Protected dealer-price structure, exceptions, 5% pilot return and final calculation base."),
        ("Volume incentives", "Tier thresholds and incentive treatment."),
        ("Pricing", "Discount authority, quotation validity and manifest pricing errors."),
        ("Products", "Final pilot product matrix and custom-request boundaries."),
        ("Marketing", "Afgri-controlled campaigns, lead routing, Smart Steel support resources and reporting."),
        ("Installation", "Smart Steel-installed or supply-only model, site responsibility, health and safety and workmanship warranty."),
        ("Finance", "Eligible products, project costs, deposits and payment timing."),
        ("Atlas", "Dashboard scope, access permissions, reporting and integration roadmap."),
        ("Warranty/Data", "Claims workflow, POPIA responsibilities, retention and access rights."),
        ("Governance", "Owners, escalation paths, meeting cadence and rollout approval."),
    ], row_h=32, font_size=7.3)
    c.showPage()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    draw_cover(c)
    pages = [
        page_important_note,
        page_exec,
        page_rationale,
        page_model,
        page_customer_journey,
        page_commercial,
        page_return,
        page_portfolio,
        page_marketing,
        page_campaigns,
        page_technical,
        page_installation,
        page_financing,
        page_atlas,
        page_scope,
        page_warranty,
        page_pilot,
        page_governance,
        page_alignment,
    ]
    for idx, fn in enumerate(pages, start=2):
        fn(c, idx)
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
