"""
TriMerge Comply — User & Administration Manual Generator
Produces a client-ready PDF based on verified codebase analysis.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate
from datetime import date
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "TriMerge_Comply_User_Admin_Manual.pdf")

# ── Colours ──────────────────────────────────────────────────────────────────
NAVY   = colors.HexColor("#0D2137")
BLUE   = colors.HexColor("#1A5276")
TEAL   = colors.HexColor("#148F77")
LGREY  = colors.HexColor("#F4F6F7")
MGREY  = colors.HexColor("#D5D8DC")
DGREY  = colors.HexColor("#717D7E")
WHITE  = colors.white
BLACK  = colors.black
RED    = colors.HexColor("#C0392B")
AMBER  = colors.HexColor("#E67E22")
GREEN  = colors.HexColor("#1E8449")

# ── Style Sheet ───────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def s(name, **kw):
    return ParagraphStyle(name, **kw)

STYLE = {
    "cover_title": s("cover_title", fontName="Helvetica-Bold", fontSize=32,
                     textColor=WHITE, alignment=TA_CENTER, spaceAfter=12, leading=38),
    "cover_sub":   s("cover_sub",   fontName="Helvetica",      fontSize=14,
                     textColor=colors.HexColor("#AED6F1"), alignment=TA_CENTER, spaceAfter=8),
    "cover_meta":  s("cover_meta",  fontName="Helvetica",      fontSize=11,
                     textColor=WHITE, alignment=TA_CENTER, spaceAfter=4),
    "cover_conf":  s("cover_conf",  fontName="Helvetica-Oblique", fontSize=9,
                     textColor=colors.HexColor("#AED6F1"), alignment=TA_CENTER),

    "h1":   s("h1",  fontName="Helvetica-Bold", fontSize=18, textColor=NAVY,
              spaceBefore=24, spaceAfter=8, leading=22),
    "h2":   s("h2",  fontName="Helvetica-Bold", fontSize=13, textColor=BLUE,
              spaceBefore=16, spaceAfter=6, leading=17),
    "h3":   s("h3",  fontName="Helvetica-Bold", fontSize=11, textColor=TEAL,
              spaceBefore=12, spaceAfter=4, leading=15),
    "body": s("body", fontName="Helvetica", fontSize=10, textColor=BLACK,
              spaceAfter=6, leading=14, alignment=TA_JUSTIFY),
    "bullet": s("bullet", fontName="Helvetica", fontSize=10, textColor=BLACK,
                spaceAfter=3, leading=14, leftIndent=16, firstLineIndent=-10,
                bulletIndent=4),
    "subbullet": s("subbullet", fontName="Helvetica", fontSize=9.5, textColor=DGREY,
                   spaceAfter=2, leading=13, leftIndent=30, firstLineIndent=-10,
                   bulletIndent=18),
    "code":  s("code", fontName="Courier", fontSize=8.5, textColor=NAVY,
               backColor=LGREY, spaceAfter=4, leading=12, leftIndent=12),
    "note":  s("note", fontName="Helvetica-Oblique", fontSize=9, textColor=DGREY,
               spaceAfter=4, leading=13),
    "th":    s("th",   fontName="Helvetica-Bold", fontSize=9.5, textColor=WHITE,
               alignment=TA_CENTER),
    "td":    s("td",   fontName="Helvetica", fontSize=9.5, textColor=BLACK,
               alignment=TA_LEFT, leading=13),
    "toc_h1": s("toc_h1", fontName="Helvetica-Bold", fontSize=10, textColor=NAVY,
                leftIndent=0, spaceAfter=3),
    "toc_h2": s("toc_h2", fontName="Helvetica", fontSize=9.5, textColor=BLUE,
                leftIndent=16, spaceAfter=2),
    "section_label": s("section_label", fontName="Helvetica-Bold", fontSize=9,
                       textColor=TEAL, spaceBefore=4, spaceAfter=2),
    "warning": s("warning", fontName="Helvetica", fontSize=9.5, textColor=BLACK,
                 backColor=colors.HexColor("#FDFEFE"), leftIndent=8, spaceAfter=4, leading=13),
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def P(text, style="body"):
    return Paragraph(text, STYLE[style])

def B(text):
    return Paragraph(f"&bull;&nbsp; {text}", STYLE["bullet"])

def SB(text):
    return Paragraph(f"&#8211;&nbsp; {text}", STYLE["subbullet"])

def HR():
    return HRFlowable(width="100%", thickness=0.5, color=MGREY, spaceAfter=6, spaceBefore=6)

def SP(h=6):
    return Spacer(1, h)

def section_break():
    return PageBreak()

def heading1(num, title):
    return P(f"<b>{num}&nbsp;&nbsp;{title}</b>", "h1")

def heading2(num, title):
    return P(f"<b>{num}&nbsp;&nbsp;{title}</b>", "h2")

def heading3(title):
    return P(f"<b>{title}</b>", "h3")

def table(headers, rows, col_widths=None, highlight_rows=None):
    data = [[Paragraph(f"<b>{h}</b>", STYLE["th"]) for h in headers]]
    for i, row in enumerate(rows):
        data.append([Paragraph(str(c), STYLE["td"]) for c in row])

    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LGREY]),
        ("GRID",       (0, 0), (-1, -1), 0.4, MGREY),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]
    if highlight_rows:
        for r in highlight_rows:
            style_cmds.append(("BACKGROUND", (0, r+1), (-1, r+1), colors.HexColor("#D6EAF8")))

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle(style_cmds))
    return t

def info_box(label, text):
    data = [[Paragraph(f"<b>{label}</b>", STYLE["section_label"])],
            [Paragraph(text, STYLE["warning"])]]
    t = Table(data, colWidths=[6.5*inch])
    t.setStyle(TableStyle([
        ("BOX",        (0, 0), (-1, -1), 0.8, TEAL),
        ("BACKGROUND", (0, 0), (-1, 0),  LGREY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ]))
    return t

# ── Page templates ────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = letter

def cover_footer(canvas, doc):
    pass  # clean cover, no footer

def body_header_footer(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(NAVY)
    canvas.rect(0.5*inch, PAGE_H - 0.55*inch, PAGE_W - 1*inch, 0.28*inch, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(WHITE)
    canvas.drawString(0.6*inch, PAGE_H - 0.42*inch, "TriMerge Comply  |  User & Administration Manual")
    canvas.drawRightString(PAGE_W - 0.6*inch, PAGE_H - 0.42*inch, "CONFIDENTIAL")
    # Footer
    canvas.setFillColor(MGREY)
    canvas.rect(0.5*inch, 0.4*inch, PAGE_W - 1*inch, 0.02*inch, fill=1, stroke=0)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(DGREY)
    canvas.drawString(0.6*inch, 0.28*inch, f"Version 1.0  |  {date.today().strftime('%B %Y')}")
    canvas.drawCentredString(PAGE_W/2, 0.28*inch, "© 2026 TriMerge Consulting. All rights reserved.")
    canvas.drawRightString(PAGE_W - 0.6*inch, 0.28*inch, f"Page {doc.page}")
    canvas.restoreState()

# ── Build content ─────────────────────────────────────────────────────────────
def build_story():
    story = []

    # ═══════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════
    story.append(Spacer(1, 1.4*inch))
    story.append(P("TriMerge Comply", "cover_title"))
    story.append(P("User &amp; Administration Manual", "cover_sub"))
    story.append(Spacer(1, 0.5*inch))

    cover_block = Table([
        [Paragraph("<b>Version</b>", STYLE["cover_meta"]), Paragraph("1.0.0", STYLE["cover_meta"])],
        [Paragraph("<b>Release Date</b>", STYLE["cover_meta"]), Paragraph(date.today().strftime("%B %d, %Y"), STYLE["cover_meta"])],
        [Paragraph("<b>Platform</b>", STYLE["cover_meta"]), Paragraph("REST API / Cloud", STYLE["cover_meta"])],
        [Paragraph("<b>Classification</b>", STYLE["cover_meta"]), Paragraph("CONFIDENTIAL", STYLE["cover_meta"])],
        [Paragraph("<b>Prepared For</b>", STYLE["cover_meta"]), Paragraph("TriMerge Consulting — Internal Use", STYLE["cover_meta"])],
    ], colWidths=[2.2*inch, 4*inch])
    cover_block.setStyle(TableStyle([
        ("ALIGN",   (0,0), (-1,-1), "CENTER"),
        ("VALIGN",  (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, colors.HexColor("#AED6F1")),
    ]))
    story.append(cover_block)
    story.append(Spacer(1, 1.0*inch))
    story.append(P(
        "This document contains confidential and proprietary information belonging to TriMerge Consulting. "
        "It is intended solely for authorised personnel involved in the implementation, administration, "
        "and use of the TriMerge Comply platform. Unauthorised reproduction, distribution, or disclosure "
        "is strictly prohibited.",
        "cover_conf"
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("", "Table of Contents"))
    story.append(HR())

    toc_entries = [
        ("1", "Executive Summary", False),
        ("2", "System Overview", False),
        ("3", "Technology Stack", False),
        ("4", "User Roles &amp; Permissions", False),
        ("5", "Authentication &amp; Account Management", False),
        ("5.1", "Registration &amp; Email Verification", True),
        ("5.2", "Login &amp; Session Management", True),
        ("5.3", "Password Management", True),
        ("5.4", "Profile Management", True),
        ("6", "Application Modules", False),
        ("6.1", "Dashboard", True),
        ("6.2", "Audit Management", True),
        ("6.3", "Adverse Impact Analysis (CSV Upload)", True),
        ("6.4", "Flags", True),
        ("6.5", "Findings Management", True),
        ("6.6", "Evidence Management", True),
        ("6.7", "Pay Equity Analysis", True),
        ("6.8", "Position Document Review", True),
        ("6.9", "Employee Handbooks", True),
        ("7", "Workflow Documentation", False),
        ("7.1", "Audit Lifecycle", True),
        ("7.2", "Audit Deletion Approval Workflow", True),
        ("7.3", "Findings &amp; Evidence Workflow", True),
        ("7.4", "Flag Triage Workflow", True),
        ("8", "Reporting &amp; Exports", False),
        ("9", "Troubleshooting Guide", False),
        ("10", "Frequently Asked Questions", False),
        ("11", "Security &amp; Compliance", False),
        ("12", "Administrator Guide", False),
        ("13", "Data Dictionary", False),
        ("14", "Glossary", False),
    ]

    toc_data = []
    for num, title, is_sub in toc_entries:
        style = "toc_h2" if is_sub else "toc_h1"
        row = [Paragraph(f"{num}&nbsp;&nbsp;{title}", STYLE[style])]
        toc_data.append(row)

    toc_table = Table(toc_data, colWidths=[6.5*inch])
    toc_table.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
    ]))
    story.append(toc_table)
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 1. EXECUTIVE SUMMARY
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("1", "Executive Summary"))
    story.append(HR())
    story.append(P(
        "TriMerge Comply is a cloud-native HR compliance and audit management platform built by TriMerge Consulting. "
        "It enables HR teams, engagement directors, and compliance analysts to manage the full lifecycle of workforce "
        "audits — from adverse impact screening and pay equity analysis through to formal findings, evidence collection, "
        "and client-ready PDF reporting."
    ))

    heading3("Purpose")
    story.append(P(
        "The platform automates the labour-intensive steps of compliance auditing: statistical analysis of applicant "
        "flow data, AI-assisted pay equity gap detection, position description review against government standards, "
        "and findings documentation with governance controls that prevent unevidenced conclusions from being approved."
    ))

    heading3("Intended Users")
    story.append(table(
        ["Role", "Audience"],
        [
            ["Platform Admin", "TriMerge system administrators managing users and organization settings"],
            ["Engagement Director", "Senior client-facing staff who approve findings and control audit deletion"],
            ["Project Manager", "Mid-level staff overseeing audit progress and analyst assignments"],
            ["Analyst", "HR compliance analysts performing day-to-day audit and analysis work"],
            ["SME Reviewer", "Subject-matter experts validating flags and reviewing findings"],
            ["Client Read-Only", "External clients with read-only access to their audit data"],
        ],
        col_widths=[1.8*inch, 4.7*inch]
    ))

    story.append(SP(10))
    heading3("Core Features")
    features = [
        "Multi-tenancy: complete data isolation per organisation via UUID-based scoping",
        "Adverse impact analysis: Four-Fifths Rule, Chi-Square, Fisher's Exact statistical tests on CSV applicant flow data",
        "Pay equity analysis: OLS regression gap detection across departments and demographic groups from CSV/Excel/PDF/DOCX",
        "Position description review: AI-powered compliance checking against government job-posting standards",
        "Handbook indexing: full-text chunking and semantic search used to ground AI-drafted finding criteria",
        "Findings management: status machine (new → under review → approved / rejected → closed) with governance gate",
        "Evidence sub-resource: text notes and Cloudinary-hosted file uploads (PDF, Word, Excel, CSV, images)",
        "Audit deletion workflow: two-path deletion with mandatory notes and director approval for lower roles",
        "Comprehensive audit trail: ActivityLog captures every material action across all modules",
        "PDF report generation: branded Findings Register, Pay Equity Report, and Position Document Report",
        "CSV exports: dashboard summary, audit list, and flag data",
    ]
    for f in features:
        story.append(B(f))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 2. SYSTEM OVERVIEW
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("2", "System Overview"))
    story.append(HR())
    story.append(P(
        "TriMerge Comply is a RESTful API backend deployed on Render. All client interactions — "
        "whether from a web frontend, mobile app, or the Swagger UI — occur over HTTPS via JSON requests "
        "to versioned API endpoints. The platform is designed as a multi-tenant service where each organisation's "
        "data is isolated by a unique <b>organizationId</b> UUID assigned at signup."
    ))

    heading2("2.1", "Architecture")
    story.append(P(
        "The system follows a layered MVC architecture:"
    ))
    arch_data = [
        ["Layer", "Components", "Purpose"],
        ["Routing", "Express Router per module", "URL dispatch, role-guard middleware application"],
        ["Middleware", "auth.middleware, validate.middleware, error.middleware", "Authentication, input validation, centralised error handling"],
        ["Controllers", "One controller per module", "Business logic, request/response shaping"],
        ["Services", "AI, analytics, pay equity, position, storage, email, findings", "Reusable domain logic decoupled from HTTP layer"],
        ["Models", "Mongoose schemas (11 models)", "Data validation and MongoDB interaction"],
        ["Database", "MongoDB Atlas", "Document storage with compound indexes"],
        ["Storage", "Cloudinary", "Binary file storage (handbooks, position docs, pay equity files, evidence)"],
    ]
    story.append(table(arch_data[0], arch_data[1:], col_widths=[1.4*inch, 2.4*inch, 2.7*inch]))

    story.append(SP(10))
    heading2("2.2", "Major Modules")
    modules = [
        ("Authentication", "Signup, OTP verification, login, token refresh, password management, profile"),
        ("Audit Management", "Create/read/update/delete audits, CSV export, Findings Register PDF"),
        ("Adverse Impact Analysis", "CSV upload, Four-Fifths Rule + statistical tests, flag generation"),
        ("Flags", "Triage, assign, decide (dismiss/review) adverse impact flags"),
        ("Findings", "Formal compliance findings linked to audits and flags, AI-drafted criteria"),
        ("Evidence", "Text and file evidence attached to findings, Cloudinary uploads"),
        ("Pay Equity Analysis", "Multi-format upload, OLS regression gap analysis, AI advisory PDF report"),
        ("Position Documents", "Upload and AI-review of job descriptions against government standards"),
        ("Handbooks", "Policy document indexing used to ground AI finding drafts"),
        ("Dashboard", "KPI summary (audit counts, flag severity, risk levels), CSV export"),
        ("Activity Log", "Immutable event trail across all modules"),
        ("Audit Deletion Workflow", "Two-path deletion: direct (director/admin) or approval-routed (analyst/manager/reviewer)"),
    ]
    story.append(table(
        ["Module", "Description"],
        modules,
        col_widths=[2.0*inch, 4.5*inch]
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 3. TECHNOLOGY STACK
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("3", "Technology Stack"))
    story.append(HR())
    story.append(table(
        ["Category", "Technology", "Purpose"],
        [
            ["Runtime", "Node.js v24", "Server-side JavaScript runtime"],
            ["Framework", "Express 4.x", "HTTP routing and middleware pipeline"],
            ["Database", "MongoDB Atlas (via Mongoose 9)", "Primary document store with multi-tenant isolation"],
            ["Authentication", "JSON Web Tokens (jsonwebtoken)", "Stateless access tokens (15 min) + hashed refresh tokens"],
            ["OTP / Email", "Mailgun + mailgun.js", "Email verification and password-change OTP delivery"],
            ["File Storage", "Cloudinary", "Binary file hosting for handbooks, position docs, pay equity files, evidence"],
            ["AI / LLM", "OpenAI GPT (openai.service)", "Finding draft criteria, pay equity recommendations, position review"],
            ["PDF Generation", "PDFKit (pdfkit)", "Server-side PDF rendering for all report types"],
            ["Document Parsing", "mammoth (DOCX), pdf-parse (PDF), xlsx (Excel)", "Text extraction from uploaded compliance documents"],
            ["Security", "helmet, express-mongo-sanitize, hpp, express-rate-limit", "HTTP headers, injection protection, rate limiting"],
            ["Hosting", "Render (backend branch)", "Cloud deployment platform"],
            ["API Docs", "Swagger UI (swagger-ui-express)", "Interactive API documentation at /api/docs"],
            ["Password Hashing", "bcryptjs", "bcrypt with configurable rounds (default: 10)"],
        ],
        col_widths=[1.4*inch, 2.0*inch, 3.1*inch]
    ))

    story.append(SP(12))
    story.append(info_box(
        "Environment Variables Required",
        "MONGODB_URI · JWT_SECRET · JWT_REFRESH_SECRET · CLOUDINARY_URL · OPENAI_API_KEY "
        "(optional — AI features degrade gracefully) · MAILGUN_API_KEY · MAILGUN_DOMAIN · "
        "MAILGUN_SENDER · CORS_ORIGIN · BCRYPT_ROUNDS · NODE_ENV"
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 4. USER ROLES & PERMISSIONS
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("4", "User Roles &amp; Permissions"))
    story.append(HR())
    story.append(P(
        "TriMerge Comply enforces role-based access control (RBAC) across all endpoints. Every authenticated request "
        "is checked against the role attached to the user's account. Roles are assigned at registration (default: "
        "<b>viewer</b>) and can be changed by an <b>admin</b> scoped to the same organisation."
    ))

    heading2("4.1", "Role Descriptions")
    story.append(table(
        ["Role Key", "Display Name", "Description"],
        [
            ["admin", "Platform Admin",
             "Full access. Manage users, assign roles, direct-delete audits, view all deletion requests in the org."],
            ["director", "Engagement Director",
             "Approve or reject audit deletion requests routed to them. Direct-delete their own audits. View all org data."],
            ["manager", "Project Manager",
             "Create audits, upload analyses, assign flags to analysts, route deletion requests. Cannot approve findings."],
            ["analyst", "Analyst",
             "Primary workhorse role. Create audits, upload all analysis types, create findings, add/delete their own evidence."],
            ["reviewer", "SME Reviewer",
             "Review and decide on flags. Read findings and evidence. Route deletion requests. Cannot create audits."],
            ["viewer", "Client Read-Only",
             "Read-only access to audits, flags, and findings. Cannot create, edit, or delete anything."],
        ],
        col_widths=[0.9*inch, 1.4*inch, 4.2*inch]
    ))

    story.append(SP(12))
    heading2("4.2", "Permission Matrix")
    story.append(P("&#10003; = permitted &nbsp;&nbsp; &#8212; = not permitted &nbsp;&nbsp; <b>Own</b> = only their own records"))
    story.append(SP(4))

    perm_headers = ["Action", "Admin", "Director", "Manager", "Analyst", "Reviewer", "Viewer"]
    perm_rows = [
        ["Create audit",            "✓", "✓", "✓", "✓", "—", "—"],
        ["View audits",             "✓", "✓", "✓", "✓", "✓", "✓"],
        ["Update audit",            "✓", "✓", "✓", "Own","—", "—"],
        ["Direct delete audit",     "✓", "✓", "—", "—", "—", "—"],
        ["Route deletion request",  "—", "—", "✓", "✓", "✓", "—"],
        ["Review deletion request", "—", "✓", "—", "—", "—", "—"],
        ["View deletion requests",  "✓", "Own","—","—", "—", "—"],
        ["Upload CSV (adv. impact)","✓", "✓", "✓", "✓", "—", "—"],
        ["View flags",              "✓", "✓", "✓", "✓", "✓", "✓"],
        ["Decide flag",             "✓", "✓", "✓", "✓", "✓", "—"],
        ["Assign flag",             "✓", "✓", "✓", "—", "—", "—"],
        ["Create finding",          "✓", "✓", "✓", "✓", "—", "—"],
        ["View findings",           "✓", "✓", "✓", "✓", "✓", "✓"],
        ["Update finding",          "✓", "✓", "✓", "✓", "✓", "—"],
        ["Advance finding status",  "✓", "✓", "✓", "✓", "✓", "—"],
        ["Add text evidence",       "✓", "✓", "✓", "✓", "—", "—"],
        ["Upload file evidence",    "✓", "✓", "✓", "✓", "—", "—"],
        ["Delete evidence",         "✓", "✓", "✓", "Own","—", "—"],
        ["Upload pay equity",       "✓", "✓", "✓", "✓", "—", "—"],
        ["Upload position doc",     "✓", "✓", "✓", "✓", "—", "—"],
        ["Upload handbook",         "✓", "✓", "✓", "✓", "—", "—"],
        ["Delete handbook",         "✓", "✓", "—", "—", "—", "—"],
        ["View dashboard",          "✓", "✓", "✓", "✓", "✓", "✓"],
        ["Export dashboard CSV",    "✓", "✓", "✓", "✓", "—", "—"],
        ["Manage user roles",       "✓", "—", "—", "—", "—", "—"],
        ["View all org users",      "✓", "✓", "✓", "✓", "✓", "✓"],
    ]
    story.append(table(perm_headers, perm_rows,
                       col_widths=[2.3*inch, 0.6*inch, 0.75*inch, 0.75*inch, 0.75*inch, 0.75*inch, 0.6*inch]))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 5. AUTHENTICATION & ACCOUNT MANAGEMENT
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("5", "Authentication &amp; Account Management"))
    story.append(HR())

    heading2("5.1", "Registration &amp; Email Verification")
    story.append(P("New accounts are created via the signup endpoint. The following fields are accepted:"))
    story.append(table(
        ["Field", "Required", "Notes"],
        [
            ["name",        "Yes", "Display name shown throughout the platform"],
            ["email",       "Yes", "Unique, lowercased. Becomes the login username"],
            ["password",    "Yes", "Minimum 8 characters. bcrypt-hashed before storage"],
            ["companyName", "No",  "Used to assign organizationId. Users with matching company names are grouped into the same org"],
            ["phone",       "No",  "Optional contact number"],
        ],
        col_widths=[1.1*inch, 0.8*inch, 4.6*inch]
    ))
    story.append(SP(8))
    story.append(P("After signup, the system:"))
    steps = [
        "Creates the user with <b>isVerified = false</b> and default role <b>viewer</b>",
        "Generates a 6-digit OTP and hashes it with bcrypt before storage",
        "Sends the OTP to the user's email via Mailgun (purpose: email_verification)",
        "The user submits the OTP to <b>POST /api/auth/verify-otp</b> — on success, isVerified is set to true",
        "The user may now log in",
    ]
    for i, s in enumerate(steps, 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(6))
    story.append(info_box("OTP Security Policy",
        "OTP validity: 10 minutes · Max attempts: 5 · Cooldown between resends: 60 seconds · "
        "Verification purpose is stored and checked — an email OTP cannot be used for password change."))

    story.append(SP(10))
    heading2("5.2", "Login &amp; Session Management")
    story.append(P(
        "Authentication uses a dual-token scheme. On successful login the API returns an <b>access token</b> "
        "(short-lived, 15 minutes) and a <b>refresh token</b> (longer-lived). The refresh token is SHA-256 hashed "
        "before being stored in the database; the raw value is returned to the client and never stored in plain text."
    ))
    story.append(table(
        ["Token", "Lifetime", "Usage"],
        [
            ["Access Token (JWT)", "15 minutes", "Sent in Authorization: Bearer header on every API request"],
            ["Refresh Token", "Configurable (JWT_REFRESH_SECRET)", "POST /api/auth/refresh-tokens to obtain new token pair"],
        ],
        col_widths=[1.6*inch, 1.4*inch, 3.5*inch]
    ))
    story.append(SP(8))
    story.append(P(
        "<b>Account Lockout:</b> After 5 consecutive failed login attempts, the account is locked for 15 minutes. "
        "The remaining wait time is returned in the error response."
    ))

    story.append(SP(10))
    heading2("5.3", "Password Management")
    story.append(P("The platform provides two password reset paths:"))
    heading3("Forgot Password (unauthenticated)")
    for i, s in enumerate([
        "User submits their email to <b>POST /api/auth/forgot-password</b>",
        "A cryptographically secure token is generated, SHA-256 hashed, and stored with a 1-hour expiry",
        "A reset link containing the raw token is emailed via Mailgun",
        "User submits the raw token + new password to <b>POST /api/auth/reset-password</b>",
        "On success, the token and all refresh sessions are invalidated",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(8))
    heading3("Change Password (authenticated — OTP-verified)")
    for i, s in enumerate([
        "Authenticated user submits old + new password to <b>POST /api/auth/change-password</b>",
        "The system verifies the old password, then hashes and stores the new password as pending",
        "An OTP is sent to the user's email (purpose: password_change)",
        "User confirms with OTP via <b>POST /api/auth/verify-change-password</b>",
        "On success, the pending hash is promoted, and all active sessions are invalidated",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(10))
    heading2("5.4", "Profile Management")
    story.append(table(
        ["Endpoint", "Action"],
        [
            ["GET /api/auth/me", "Retrieve current user profile (excludes all sensitive fields)"],
            ["PATCH /api/auth/change-name", "Update display name"],
            ["GET /api/auth/users", "List all users in the same organisation (all authenticated roles)"],
            ["PATCH /api/auth/users/:id/role", "Change another user's role — admin only, same org"],
        ],
        col_widths=[2.5*inch, 4.0*inch]
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 6. APPLICATION MODULES
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("6", "Application Modules"))
    story.append(HR())

    # 6.1 Dashboard
    heading2("6.1", "Dashboard")
    story.append(P(
        "The dashboard provides an organisation-scoped KPI summary aggregated in real time from audits and flags."
    ))
    story.append(table(
        ["Metric", "Description"],
        [
            ["Total Audits", "Count of all audits in the organisation"],
            ["Audits by Status", "Breakdown: draft, processing, completed, flagged"],
            ["Total Flags", "Count of all adverse impact flags across all analyses"],
            ["Flags by Severity", "Breakdown: low, medium, high, critical"],
            ["Flags by Status", "Breakdown: open, reviewed, dismissed"],
            ["Overall Risk", "Highest severity level across all open flags"],
            ["Audit Risk Summaries", "Per-audit flag counts, severity breakdown, and calculated risk level"],
            ["Recent Audits", "5 most recently created audits with creator details"],
            ["Recent Flags", "5 most recently generated flags with audit name"],
        ],
        col_widths=[1.9*inch, 4.6*inch]
    ))
    story.append(SP(6))
    story.append(B("<b>Export:</b> GET /api/dashboard/export — downloads a CSV with all audits and all flags in a single file"))

    story.append(SP(12))
    heading2("6.2", "Audit Management")
    story.append(P(
        "Audits are the top-level container for all compliance work. Each audit belongs to an organisation "
        "and can have associated flags, findings, and a generated PDF Findings Register."
    ))
    story.append(table(
        ["Field", "Description"],
        [
            ["name",         "Audit name (required, max 100 chars)"],
            ["description",  "Optional narrative description (max 500 chars)"],
            ["organization", "Organisation or department being audited"],
            ["clientName",   "Client name for the engagement"],
            ["auditType",    "Type classification (e.g. Adverse Impact, Pay Equity)"],
            ["status",       "draft | processing | completed | flagged"],
        ],
        col_widths=[1.3*inch, 5.2*inch]
    ))
    story.append(SP(8))
    story.append(P("<b>Key operations:</b>"))
    story.append(B("Create: POST /api/audits — analyst and above"))
    story.append(B("List: GET /api/audits — filter by clientName, auditType, auditName, status"))
    story.append(B("Export: GET /api/audits/export — CSV of all audits matching filters"))
    story.append(B("Findings Register PDF: GET /api/audits/:id/report — branded PDF with cover page, KPI summary, and one block per finding"))
    story.append(B("Update: PATCH /api/audits/:id — analysts can only update audits they created"))
    story.append(B("Delete: see Section 7.2 — Audit Deletion Approval Workflow"))

    story.append(SP(12))
    heading2("6.3", "Adverse Impact Analysis (CSV Upload)")
    story.append(P(
        "Upload applicant flow data in CSV format to run automated adverse impact screening. The system applies "
        "the <b>Four-Fifths Rule</b> (EEOC Uniform Guidelines) and optionally Chi-Square and Fisher's Exact tests. "
        "Flags are automatically generated for groups where the impact ratio falls below 0.80."
    ))
    story.append(P("<b>Required CSV columns:</b>"))
    story.append(B("group — Demographic group name (e.g. Female, Hispanic)"))
    story.append(B("selected — Number of applicants selected"))
    story.append(B("total — Total applicants in that group"))
    story.append(SP(6))
    story.append(P("<b>Statistical tests performed:</b>"))
    story.append(table(
        ["Test", "When Applied", "What It Measures"],
        [
            ["Four-Fifths Rule", "Always", "Impact ratio = group selection rate / highest group rate. Flagged if < 0.80"],
            ["Chi-Square", "When sample sizes are sufficient", "Statistical significance of selection rate differences"],
            ["Fisher's Exact", "Small sample sizes", "Exact probability of observed selection rates under null hypothesis"],
        ],
        col_widths=[1.4*inch, 1.8*inch, 3.3*inch]
    ))
    story.append(SP(8))
    story.append(P("Flag severity is assigned based on the impact ratio and statistical test results: "
                   "<b>critical</b> (ratio &lt; 0.60), <b>high</b> (0.60–0.69), <b>medium</b> (0.70–0.79), <b>low</b> (≥ 0.80 but still statistically significant)."))

    story.append(SP(12))
    heading2("6.4", "Flags")
    story.append(P(
        "Flags represent individual adverse impact violations detected by statistical analysis. Each flag is "
        "scoped to an organisation and can be linked to either a specific audit or a standalone CSV upload."
    ))
    story.append(table(
        ["Field", "Description"],
        [
            ["severity",        "low | medium | high | critical — calculated from impact ratio"],
            ["status",          "open (default) | reviewed | dismissed"],
            ["group",           "The demographic group that was flagged"],
            ["referenceGroup",  "The highest-selecting group used as the comparison benchmark"],
            ["selectionRate",   "Fraction selected within the group"],
            ["impactRatio",     "group rate ÷ reference group rate (below 0.80 triggers a flag)"],
            ["testType",        "four_fifths | fisher_exact | chi_square | adverse_impact"],
            ["pValue",          "Statistical significance value from Chi-Square or Fisher's Exact test"],
            ["assignedTo",      "Optional: analyst assigned to investigate this flag"],
        ],
        col_widths=[1.5*inch, 5.0*inch]
    ))
    story.append(SP(8))
    story.append(P("<b>Key operations:</b>"))
    story.append(B("Decide: POST /api/flags/:id/decide — submit a decision (reviewed or dismissed) with notes"))
    story.append(B("Assign: PATCH /api/flags/:id/assign — manager+ assigns a flag to an analyst for investigation"))
    story.append(B("View: GET /api/flags — list with filters by severity, status, auditId"))

    story.append(SP(12))
    heading2("6.5", "Findings Management")
    story.append(P(
        "Findings are formal compliance investigation records created by analysts. They represent a documented "
        "conclusion drawn from statistical data, interview notes, policy research, and other evidence. A finding "
        "cannot be approved without attached evidence, populated criteria, and a populated recommendation."
    ))

    heading3("Status Machine")
    story.append(table(
        ["From Status", "To Status", "Who Can Transition"],
        [
            ["new",                      "under_review",             "Any (analyst, manager, director, admin, reviewer)"],
            ["under_review",             "additional_info_required", "Any"],
            ["under_review",             "approved",                 "Any — but governance gate blocks without evidence + criteria + recommendation"],
            ["under_review",             "rejected",                 "Any"],
            ["additional_info_required", "under_review",             "Any"],
            ["approved",                 "closed",                   "Any"],
            ["rejected",                 "closed",                   "Any"],
        ],
        col_widths=[1.6*inch, 1.8*inch, 3.1*inch]
    ))

    story.append(SP(8))
    story.append(info_box("Governance Gate",
        "Moving a finding to 'approved' is blocked unless: (1) the criteria field is non-empty, "
        "(2) the recommendation field is non-empty, and (3) at least one evidence item is attached. "
        "This is enforced server-side and cannot be bypassed."))

    story.append(SP(8))
    story.append(P("<b>AI Draft Generation:</b> When a finding is created with OPENAI_API_KEY configured, "
                   "the system automatically drafts the <b>criteria</b> and <b>recommendation</b> fields using "
                   "the observation text, risk level, and relevant handbook excerpts retrieved via semantic search. "
                   "If OPENAI_API_KEY is absent, the fields default to empty and the analyst fills them manually. "
                   "The <b>POST /api/findings/:id/regenerate-draft</b> endpoint re-runs this draft at any time."))

    story.append(SP(8))
    story.append(P("<b>Auto-Evidence from Flags:</b> When a finding is created with a <b>flagId</b>, the system "
                   "automatically creates a <b>statistical_result</b> evidence item containing the flag's full "
                   "statistical data (impact ratio, selection rates, p-value, test type, etc.). This satisfies "
                   "the governance gate requirement immediately for flag-linked findings."))

    story.append(SP(8))
    story.append(P("<b>findingId alias:</b> Every finding response includes both <b>_id</b> and a <b>findingId</b> "
                   "alias (equal to _id) to make it easy to copy the correct value into evidence sub-resource URLs."))

    story.append(SP(12))
    heading2("6.6", "Evidence Management")
    story.append(P(
        "Evidence items are attached to a specific finding and represent the proof that supports the finding's "
        "conclusion. Evidence can be text-based or file-backed (hosted on Cloudinary)."
    ))
    story.append(table(
        ["Evidence Type", "Description", "Typical Source"],
        [
            ["statistical_result", "Quantitative analysis output — impact ratios, p-values, regression gaps", "Auto-generated from flag or pay equity analysis"],
            ["interview_note",     "Notes from a structured interview; includes interviewee name and date", "Manual entry by analyst"],
            ["policy_excerpt",     "Text excerpt from an HR policy, handbook, or regulation", "Manual entry or handbook search"],
            ["data_extract",       "Raw data table or extract from HR systems", "Manual entry"],
            ["observation_note",   "Field notes from a process walkthrough or observation", "Manual entry"],
            ["document",           "Uploaded file (PDF, Word, Excel, CSV, PNG, JPEG — max 10 MB)", "File upload"],
        ],
        col_widths=[1.5*inch, 2.9*inch, 2.1*inch]
    ))
    story.append(SP(8))
    story.append(P("<b>File Upload:</b> POST /api/findings/:findingId/evidence/upload — send as multipart/form-data "
                   "with a <b>file</b> field. Metadata (title, type, description, content) are passed as URL query "
                   "parameters. Maximum file size: 10 MB."))
    story.append(SP(4))
    story.append(P("<b>Lock Rule:</b> Evidence cannot be added or deleted on findings with status <b>approved</b> "
                   "or <b>closed</b>."))
    story.append(SP(4))
    story.append(P("<b>Delete Rule:</b> Analysts may only delete evidence they created. Manager and above can delete any."))

    story.append(SP(12))
    heading2("6.7", "Pay Equity Analysis")
    story.append(P(
        "Upload compensation data in CSV, Excel (.xlsx/.xls), PDF, or DOCX format. The system extracts tabular "
        "data and runs OLS (Ordinary Least Squares) regression to identify statistically significant pay gaps "
        "across departments and demographic groups, controlling for legitimate compensable factors."
    ))
    story.append(P("<b>Required columns in the underlying data:</b>"))
    story.append(B("Employee identifier (e.g. employee_id)"))
    story.append(B("Salary / compensation figure"))
    story.append(B("Demographic group (e.g. gender, race/ethnicity)"))
    story.append(B("Department or job group"))
    story.append(SP(6))
    story.append(P(
        "The analysis produces a <b>Pay Equity Report PDF</b> (GET /api/payequity/:id/report) that includes "
        "an executive summary, plain-language interpretation, key insights, and recommendations. If OPENAI_API_KEY "
        "is configured, these sections are AI-generated; otherwise, the system falls back to rule-based text."
    ))

    story.append(SP(12))
    heading2("6.8", "Position Document Review")
    story.append(P(
        "Upload job descriptions (PDF, DOCX, TXT, CSV) to receive an AI-powered compliance review against "
        "government job-posting standards (based on OFCCP and EEOC requirements)."
    ))
    story.append(table(
        ["Review Status", "Meaning"],
        [
            ["not_reviewed", "Uploaded but not yet assessed"],
            ["in_review",    "Currently being evaluated by an analyst"],
            ["approved",     "Meets compliance standards"],
            ["needs_changes","Non-compliant — specific issues identified"],
            ["dismissed",    "Excluded from further review"],
        ],
        col_widths=[1.4*inch, 5.1*inch]
    ))
    story.append(SP(8))
    story.append(P(
        "A <b>Standards Review</b> can be triggered separately (POST /api/position/:id/standards-review) to run "
        "a detailed checklist-style AI analysis comparing the document against the government standard. "
        "A PDF report is available at <b>GET /api/position/:id/report</b>."
    ))

    story.append(SP(12))
    heading2("6.9", "Employee Handbooks")
    story.append(P(
        "Upload company handbooks (PDF or DOCX) to make policy content available to the AI when it drafts "
        "finding criteria. The system extracts full text and splits it into 400-word overlapping chunks stored "
        "in MongoDB. When a finding is created, the AI searches these chunks semantically to retrieve "
        "relevant policy excerpts that ground the criteria draft."
    ))
    story.append(B("Upload: POST /api/handbooks/upload — optionally set display name via x-handbook-name header or ?name= query param"))
    story.append(B("List: GET /api/handbooks — returns all handbooks (chunk data excluded for performance)"))
    story.append(B("Delete: DELETE /api/handbooks/:id — director and admin only; logs the deletion in ActivityLog"))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 7. WORKFLOW DOCUMENTATION
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("7", "Workflow Documentation"))
    story.append(HR())

    heading2("7.1", "Audit Lifecycle")
    story.append(P("The standard audit engagement follows this sequence:"))
    audit_steps = [
        ("Analyst / Manager", "Create Audit", "POST /api/audits with name, clientName, auditType"),
        ("Analyst", "Upload Adverse Impact CSV", "POST /api/upload/csv — flags auto-generated on success"),
        ("Analyst / Reviewer", "Triage Flags", "Review each flag: decide (reviewed/dismissed) or assign to analyst"),
        ("Analyst", "Create Findings", "POST /api/findings — link flagId for auto-evidence; AI drafts criteria"),
        ("Analyst", "Collect Evidence", "Add text evidence and upload supporting documents to each finding"),
        ("Analyst", "Submit for Review", "PATCH /api/findings/:id/status → under_review"),
        ("Director / Manager", "Review Finding", "Verify criteria, recommendation, and evidence are complete"),
        ("Director", "Approve Finding", "PATCH status → approved (governance gate enforced server-side)"),
        ("Analyst / Director", "Generate Report", "GET /api/audits/:id/report — branded PDF Findings Register"),
        ("Analyst / Manager", "Close", "PATCH status → closed on each approved or rejected finding"),
    ]
    story.append(table(
        ["Responsible Role", "Step", "System Action"],
        audit_steps,
        col_widths=[1.5*inch, 1.7*inch, 3.3*inch]
    ))

    story.append(SP(14))
    heading2("7.2", "Audit Deletion Approval Workflow")
    story.append(P(
        "Deleting an audit is an irreversible action with a two-path approval mechanism designed to ensure "
        "compliance accountability:"
    ))

    heading3("Path A — Direct Deletion (Director / Admin)")
    for i, s in enumerate([
        "Director or admin sends DELETE /api/audits/:id with mandatory <b>deletionNotes</b> (minimum 10 characters)",
        "Audit is immediately deleted",
        "ActivityLog entry created with action <b>audit_deleted</b>, deletedVia: 'direct', and the notes",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(8))
    heading3("Path B — Approval-Routed Deletion (Manager / Analyst / Reviewer)")
    for i, s in enumerate([
        "Requester calls <b>GET /api/users/directors</b> to obtain the list of available Engagement Directors",
        "Requester submits POST /api/audits/:id/deletion-request with <b>deletionNotes</b> and selected <b>directorId</b>",
        "System validates: notes ≥ 10 chars, directorId is a real director in the org, no pending request already exists",
        "An <b>AuditDeletionRequest</b> record is created with status <b>pending</b>; an audit snapshot is preserved for compliance",
        "ActivityLog entry created with action <b>deletion_requested</b> including routing details",
        "Director views pending requests: GET /api/audits/deletion-requests (directors see only their own requests)",
        "Director submits PATCH /api/audits/deletion-requests/:requestId/review with <b>decision</b> (approved/rejected) and mandatory <b>approvalNotes</b>",
        "If approved: audit is deleted and two ActivityLog entries are created (deletion_approved + audit_deleted)",
        "If rejected: audit is preserved; ActivityLog entry created with action <b>deletion_rejected</b>",
        "Duplicate pending requests for the same audit are blocked (HTTP 409)",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(14))
    heading2("7.3", "Findings &amp; Evidence Workflow")
    story.append(P("The findings lifecycle enforces an evidence-before-approval principle:"))
    for i, s in enumerate([
        "Analyst creates finding (POST /api/findings) — AI drafts criteria and recommendation if configured",
        "If flagId provided: statistical_result evidence auto-attached; governance gate is immediately satisfiable",
        "Analyst reviews AI draft, edits criteria and recommendation as needed",
        "Analyst adds supplemental evidence: interview notes, policy excerpts, data extracts, or file uploads",
        "Analyst advances status to <b>under_review</b>",
        "Reviewer / Director verifies all three governance gate conditions are met (evidence, criteria, recommendation)",
        "Director approves — gate checks run server-side on every approval attempt",
        "Finding locked: no evidence can be added or removed after approval",
        "Finding can subsequently be closed",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(14))
    heading2("7.4", "Flag Triage Workflow")
    story.append(P("When CSV adverse impact data is uploaded, flags are automatically created for each violating group:"))
    for i, s in enumerate([
        "Manager or above assigns flag to analyst: PATCH /api/flags/:id/assign",
        "Analyst investigates: reviews statistical results, applicant flow data, and any related findings",
        "Analyst (or reviewer) decides: POST /api/flags/:id/decide with status <b>reviewed</b> or <b>dismissed</b> and decision notes",
        "If reviewed: analyst typically creates a formal Finding linked to this flag",
        "If dismissed: flag is closed with documented rationale; ActivityLog records the decision",
        "Dashboard flag counters update in real time",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 8. REPORTING & EXPORTS
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("8", "Reporting &amp; Exports"))
    story.append(HR())
    story.append(table(
        ["Report / Export", "Endpoint", "Format", "Access"],
        [
            ["Findings Register PDF", "GET /api/audits/:id/report",       "PDF", "analyst+"],
            ["Pay Equity Report PDF", "GET /api/payequity/:id/report",    "PDF", "analyst+"],
            ["Position Review PDF",   "GET /api/position/:id/report",     "PDF", "analyst+"],
            ["Dashboard Export",      "GET /api/dashboard/export",        "CSV", "analyst+"],
            ["Audit List Export",     "GET /api/audits/export",           "CSV", "analyst+"],
        ],
        col_widths=[1.9*inch, 2.4*inch, 0.7*inch, 1.0*inch]
    ))
    story.append(SP(12))
    heading2("8.1", "Findings Register PDF")
    story.append(P(
        "Generated on demand for any audit. Contains: branded cover page with audit metadata, a KPI summary "
        "table (total findings, breakdown by status and risk level), and one detailed block per finding "
        "showing observation, risk level, criteria, recommendation, assigned reviewer, and handbook reference. "
        "Findings are sorted by risk level (critical first) then creation date."
    ))
    story.append(SP(8))
    heading2("8.2", "Pay Equity Report PDF")
    story.append(P(
        "Generated on demand for any pay equity analysis. Contains: executive summary, plain-language "
        "interpretation, key insights, flagged pay gaps by department and demographic group, OLS model "
        "parameters, and recommendations. AI-enhanced content is generated via OpenAI if available; "
        "rule-based fallback text is used otherwise."
    ))
    story.append(SP(8))
    heading2("8.3", "Position Document Report PDF")
    story.append(P(
        "Generated on demand for any uploaded position document. Contains: document metadata, AI analysis "
        "summary, compliance findings, and recommendations. Includes company name on the cover when available."
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 9. TROUBLESHOOTING
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("9", "Troubleshooting Guide"))
    story.append(HR())

    issues = [
        (
            "401 Unauthorized on all requests",
            "Access token has expired (15-minute TTL)",
            "Call POST /api/auth/refresh-tokens with your refresh token to obtain a new access token pair"
        ),
        (
            "403 Email not verified",
            "User registered but did not verify their email OTP",
            "Call POST /api/auth/resend-otp, then submit the OTP to POST /api/auth/verify-otp"
        ),
        (
            "Account locked — 423 response",
            "5 or more consecutive failed login attempts",
            "Wait 15 minutes, then retry. The error message includes the exact remaining wait time"
        ),
        (
            "CSV upload returns 422 validation failed",
            "CSV is missing required columns (group, selected, total) or contains negative / invalid values",
            "Ensure all rows have group name, non-negative selected count ≤ total count, and total > 0"
        ),
        (
            "Finding approval blocked — 400 response",
            "Governance gate: missing evidence, criteria, or recommendation",
            "Add at least one evidence item (POST /api/findings/:id/evidence) and ensure criteria + recommendation fields are filled"
        ),
        (
            "Evidence upload returns 503",
            "CLOUDINARY_URL environment variable not set on the server",
            "Contact the platform administrator to configure the Cloudinary integration"
        ),
        (
            "Evidence upload returns 415",
            "File type not permitted",
            "Accepted types: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), CSV, plain text (.txt), PNG, JPEG. Re-save or convert the file"
        ),
        (
            "Evidence upload returns 413",
            "File exceeds the 10 MB size limit",
            "Compress or split the file and re-upload"
        ),
        (
            "Handbook upload: 422 — could not extract text",
            "PDF is a scanned image without embedded text layer",
            "Run the document through OCR software (e.g. Adobe Acrobat Pro) to embed a text layer before uploading"
        ),
        (
            "AI fields are empty after creating a finding",
            "OPENAI_API_KEY is not configured — AI draft is skipped silently",
            "Confirm OPENAI_API_KEY is set in the server environment. Use POST /api/findings/:id/regenerate-draft once configured"
        ),
        (
            "Deletion request returns 409",
            "A pending deletion request already exists for this audit",
            "The director must action (approve or reject) the existing request before a new one can be submitted"
        ),
        (
            "Deletion request returns 400: director not found",
            "The directorId provided does not belong to a user with the director role in this organisation",
            "Call GET /api/users/directors first to obtain valid director IDs, then resubmit"
        ),
        (
            "Pay equity upload returns 415",
            "File format not supported",
            "Accepted formats: CSV, Excel (.xlsx, .xls), PDF with embedded text, DOCX. Scanned PDFs without text layers are not supported"
        ),
    ]

    for issue, cause, fix in issues:
        story.append(KeepTogether([
            heading3(f"Issue: {issue}"),
            P(f"<b>Cause:</b> {cause}"),
            P(f"<b>Resolution:</b> {fix}"),
            SP(4),
        ]))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 10. FAQ
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("10", "Frequently Asked Questions"))
    story.append(HR())

    faqs = [
        ("Can I use the platform without OpenAI configured?",
         "Yes. All core features work without OPENAI_API_KEY. AI-assisted fields (finding criteria/recommendation drafts, pay equity report narratives, position document analysis) will be empty or use rule-based fallback text. You can fill these fields manually."),
        ("What happens to the audit data when an audit is deleted?",
         "The audit record is removed from the database. However, a full AuditDeletionRequest record (including an auditSnapshot preserving all audit metadata) and two ActivityLog entries are retained indefinitely for compliance purposes."),
        ("Can two users from different companies see each other's data?",
         "No. All data is isolated by organizationId — a UUID assigned when the first user from a company registers. Every database query includes an organizationId filter enforced at the controller level."),
        ("How do I add a new user to my organisation?",
         "Users join an organisation by registering with the same companyName as an existing user. The system automatically assigns them the organisation's UUID. An admin must then update their role if they need more than viewer access."),
        ("What does the 'findingId' field in finding responses mean?",
         "findingId is an alias for the finding's _id field. It is included explicitly so you can copy it directly into evidence endpoint URLs without having to know that _id and findingId are the same value."),
        ("Can I upload the same CSV twice?",
         "Yes, but each upload creates a new AdverseImpactAnalysis record and new flags. There is no duplicate detection. Review the flag list before uploading again to avoid duplicating existing flags."),
        ("Why does my finding show as 'new' status?",
         "new is the default status on creation. Advance it to under_review when you are ready to submit it for evaluation."),
        ("How are handbook chunks used in AI draft generation?",
         "When a finding is created, the system searches all 'ready' handbooks in the organisation using a keyword match against the finding's observation text. The top 2 matching chunks per handbook (up to 3 total) are passed to the AI as context for drafting criteria."),
        ("Can I re-generate the AI draft after editing the observation?",
         "Yes. Use POST /api/findings/:id/regenerate-draft. This re-runs the AI with the current observation and the latest handbook content. If the finding is in 'approved' or 'closed' status, regeneration is blocked."),
        ("Does the system send notifications to the director when a deletion request is submitted?",
         "Currently, the system does not send email notifications for deletion requests. The director must check their deletion request queue (GET /api/audits/deletion-requests) periodically. Email notifications are planned for a future release."),
        ("What is the maximum number of audits I can have?",
         "There is no hard limit imposed by the application. MongoDB Atlas cluster capacity and the organisation's subscription plan are the practical constraints."),
        ("How do I access the interactive API documentation?",
         "Navigate to /api/docs on the deployed server (e.g. https://trimerge-comply.onrender.com/api/docs). The Swagger UI lists all endpoints, schemas, and allows you to try requests directly from the browser."),
    ]

    for q, a in faqs:
        story.append(KeepTogether([
            P(f"<b>Q: {q}</b>"),
            P(f"A: {a}"),
            SP(8),
        ]))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 11. SECURITY & COMPLIANCE
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("11", "Security &amp; Compliance"))
    story.append(HR())

    heading2("11.1", "Authentication Security")
    story.append(table(
        ["Control", "Implementation"],
        [
            ["Password hashing",     "bcryptjs with configurable rounds (default 10). Passwords never stored in plain text"],
            ["Access tokens",        "JWT signed with JWT_SECRET, 15-minute TTL. Stateless — no server-side session store"],
            ["Refresh tokens",       "SHA-256 hashed before database storage. Raw value returned to client only once"],
            ["Token rotation",       "Each /refresh-tokens call issues a new pair, invalidating the previous refresh token"],
            ["Logout",               "Refresh token hash cleared in database; subsequent refresh attempts fail"],
            ["Account lockout",      "5 failed login attempts triggers a 15-minute lockout. Counter resets on success"],
            ["OTP hashing",          "All OTPs are bcrypt-hashed before storage. Plain text OTP never persisted"],
            ["Password change",      "Requires current password + email OTP confirmation. New password stored as pending until OTP verified"],
            ["Verified-only access", "All protected routes check isVerified = true. Unverified users cannot access the API"],
        ],
        col_widths=[2.0*inch, 4.5*inch]
    ))

    story.append(SP(12))
    heading2("11.2", "API &amp; Transport Security")
    story.append(table(
        ["Control", "Implementation"],
        [
            ["HTTPS enforcement",         "Render enforces TLS. HTTP connections are redirected"],
            ["HTTP security headers",     "helmet sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, CSP, etc."],
            ["NoSQL injection protection","express-mongo-sanitize strips $ and . from all request inputs"],
            ["HTTP parameter pollution",  "hpp prevents duplicate query parameters from bypassing validation"],
            ["Global rate limiting",      "500 requests per 15-minute window per IP across all routes"],
            ["Auth rate limiting",        "30 requests per 15-minute window per IP on /api/auth/* endpoints"],
            ["CORS",                      "Restricted to configured CORS_ORIGIN + localhost:3000 + production Render domain"],
            ["Body size limits",          "JSON body: 10 KB · File uploads: 10 MB enforced in Express middleware"],
            ["Input validation",          "express-validator applied on auth routes; controller-level guards on all others"],
        ],
        col_widths=[2.0*inch, 4.5*inch]
    ))

    story.append(SP(12))
    heading2("11.3", "Authorization &amp; Data Isolation")
    story.append(table(
        ["Control", "Implementation"],
        [
            ["Role-based access control", "requireRole() middleware on every route. Role checked from JWT user object"],
            ["Multi-tenant isolation",    "Every database query includes organizationId from req.user — users cannot access other orgs' data"],
            ["Owner-only enforcement",    "Analysts can only update audits they created; only delete evidence they added (unless manager+)"],
            ["Sensitive field exclusion", "password, refreshToken, otpCode, resetToken excluded by default in all User queries"],
            ["Director scoping",          "Deletion requests visible only to the director they were routed to (admins see all)"],
        ],
        col_widths=[2.0*inch, 4.5*inch]
    ))

    story.append(SP(12))
    heading2("11.4", "Audit Trail")
    story.append(P(
        "The ActivityLog model captures every material action performed on the platform. Entries are immutable "
        "— there are no update or delete endpoints on ActivityLog. The following actions are logged:"
    ))
    story.append(table(
        ["Action", "Trigger"],
        [
            ["audit_created",          "Audit created"],
            ["audit_updated",          "Audit fields modified (with before/after values)"],
            ["audit_deleted",          "Audit deleted (either path)"],
            ["deletion_requested",     "Deletion request submitted by analyst/manager/reviewer"],
            ["deletion_approved",      "Director approves deletion request"],
            ["deletion_rejected",      "Director rejects deletion request"],
            ["flag_decided",           "Flag marked reviewed or dismissed"],
            ["flag_assigned",          "Flag assigned to an analyst"],
            ["finding_created",        "Finding created"],
            ["finding_updated",        "Finding fields modified (with change delta)"],
            ["finding_status_changed", "Finding status advanced"],
            ["evidence_added",         "Evidence item attached to finding (text or file)"],
            ["evidence_removed",       "Evidence item deleted"],
            ["handbook_uploaded",      "Handbook indexed into the system"],
            ["handbook_deleted",       "Handbook removed"],
        ],
        col_widths=[2.0*inch, 4.5*inch]
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 12. ADMINISTRATOR GUIDE
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("12", "Administrator Guide"))
    story.append(HR())

    heading2("12.1", "User Management")
    story.append(P(
        "All user management is performed via API calls authenticated as an <b>admin</b> role account. "
        "There is no separate admin console; the Swagger UI at /api/docs provides a convenient interface."
    ))
    story.append(table(
        ["Task", "Endpoint", "Notes"],
        [
            ["List all org users",   "GET /api/auth/users",          "Returns all users with matching organizationId"],
            ["Change a user's role", "PATCH /api/auth/users/:id/role","Body: { role: 'analyst' }. Admin only. Same org."],
            ["View profile",         "GET /api/auth/me",             "Returns own profile"],
            ["Update display name",  "PATCH /api/auth/change-name",  "Body: { name: '...' }"],
        ],
        col_widths=[1.8*inch, 2.4*inch, 2.3*inch]
    ))

    story.append(SP(10))
    heading2("12.2", "Role Assignment Process")
    for i, s in enumerate([
        "Log in as an admin account and obtain an access token",
        "Call GET /api/auth/users to list all users in your organisation",
        "Identify the user whose role needs to change and note their _id",
        "Call PATCH /api/auth/users/:id/role with body { \"role\": \"analyst\" } (or whichever role is required)",
        "The user's role is updated immediately; their next API request will use the new role",
    ], 1):
        story.append(P(f"<b>{i}.</b> {s}", "bullet"))

    story.append(SP(10))
    story.append(info_box("Note on New User Onboarding",
        "New users register themselves via POST /api/auth/signup. They are assigned the 'viewer' role by default "
        "and must verify their email before they can log in. An admin must then update their role if they need "
        "analyst, reviewer, manager, director, or admin access."))

    story.append(SP(10))
    heading2("12.3", "Maintenance Tasks")
    story.append(table(
        ["Task", "How To", "Frequency"],
        [
            ["Review pending deletion requests", "GET /api/audits/deletion-requests?status=pending (as director/admin)", "Weekly or as needed"],
            ["Audit activity log", "GET /api/activity — filter by action, targetType, or date range", "Monthly for compliance review"],
            ["Monitor flag backlog", "GET /api/flags?status=open — review open flags", "Weekly"],
            ["Prune old handbooks", "DELETE /api/handbooks/:id (director/admin) when policy docs are superseded", "When policies change"],
            ["Export audit data", "GET /api/audits/export or GET /api/dashboard/export for CSV snapshots", "Per engagement close or quarterly"],
        ],
        col_widths=[2.0*inch, 2.8*inch, 1.7*inch]
    ))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 13. DATA DICTIONARY
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("13", "Data Dictionary"))
    story.append(HR())

    entities = [
        ("User", [
            ("_id", "ObjectId", "Primary key"),
            ("email", "String", "Unique login identifier, lowercased"),
            ("name", "String", "Display name"),
            ("companyName", "String", "Used to group users into an organisation"),
            ("role", "Enum", "admin | director | manager | analyst | reviewer | viewer"),
            ("organizationId", "String (UUID)", "Org isolation key. All queries scoped to this value"),
            ("isVerified", "Boolean", "True after OTP email verification. Login blocked until true"),
            ("isActive", "Boolean", "False = soft-deactivated. Login blocked"),
            ("lastLoginAt", "Date", "Timestamp of last successful login"),
            ("failedLoginAttempts", "Number", "Counter reset on success; triggers lockout at 5"),
            ("lockedUntil", "Date", "Account locked until this timestamp after excessive failures"),
        ]),
        ("Audit", [
            ("_id", "ObjectId", "Primary key"),
            ("name", "String", "Required, max 100 chars"),
            ("description", "String", "Optional narrative, max 500 chars"),
            ("status", "Enum", "draft | processing | completed | flagged"),
            ("organization", "String", "Organisation or department name"),
            ("clientName", "String", "Client engagement name"),
            ("auditType", "String", "Classification string (free text)"),
            ("organizationId", "String", "Org isolation key"),
            ("createdBy", "Ref: User", "User who created this audit"),
        ]),
        ("Flag", [
            ("_id", "ObjectId", "Primary key"),
            ("auditId", "Ref: Audit", "Present on audit-linked flags"),
            ("uploadId", "Ref: AdverseImpactAnalysis", "Present on CSV-based flags"),
            ("severity", "Enum", "low | medium | high | critical"),
            ("status", "Enum", "open | reviewed | dismissed"),
            ("group", "String", "Demographic group that was flagged"),
            ("referenceGroup", "String", "Highest-selecting comparison group"),
            ("selectionRate", "Number", "Fraction selected in this group"),
            ("impactRatio", "Number", "group rate / reference rate (< 0.80 = flagged)"),
            ("testType", "Enum", "four_fifths | fisher_exact | chi_square | adverse_impact"),
            ("pValue", "Number", "Statistical significance value"),
            ("assignedTo", "Ref: User", "Analyst assigned to investigate"),
            ("results", "Mixed", "Detailed statistical results from CSV processing"),
        ]),
        ("Finding", [
            ("_id", "ObjectId", "Primary key; also exposed as findingId alias"),
            ("auditId", "Ref: Audit", "Parent audit"),
            ("flagId", "Ref: Flag", "Optional linked flag"),
            ("observation", "String", "Required — what the analyst observed"),
            ("risk.level", "Enum", "low | medium | high | critical"),
            ("risk.description", "String", "Context for the risk assessment"),
            ("criteria", "String", "Regulatory/policy basis for the finding (AI-drafted or manual)"),
            ("recommendation", "String", "Corrective action recommendation (AI-drafted or manual)"),
            ("status", "Enum", "new | under_review | additional_info_required | approved | rejected | closed"),
            ("aiDrafted", "Boolean", "True if criteria/recommendation were AI-generated"),
            ("handbookReference", "Object", "Handbook excerpt used to ground the AI draft"),
            ("assignedTo", "Ref: User", "Analyst working on this finding"),
            ("reviewedBy", "Ref: User", "Director/reviewer who made the final decision"),
            ("reviewedAt", "Date", "Timestamp of approval or rejection"),
        ]),
        ("Evidence", [
            ("_id", "ObjectId", "Primary key"),
            ("findingId", "Ref: Finding", "Parent finding"),
            ("auditId", "Ref: Audit", "Denormalised for query efficiency"),
            ("type", "Enum", "document | statistical_result | interview_note | policy_excerpt | data_extract | observation_note"),
            ("source", "Enum", "manual | flag | payequity | adverse_impact | position | handbook"),
            ("title", "String", "Required, max 200 chars"),
            ("description", "String", "Short summary"),
            ("content", "String", "Full text content for non-file evidence"),
            ("file.fileName", "String", "Original filename (file-backed evidence only)"),
            ("file.fileUrl", "String", "Cloudinary secure URL"),
            ("file.mimeType", "String", "MIME type of the uploaded file"),
            ("file.sizeBytes", "Number", "File size in bytes"),
            ("interviewee", "String", "Name of interviewee (interview_note type only)"),
            ("interviewDate", "Date", "Date of interview"),
            ("collectedBy", "Ref: User", "Analyst who added this evidence"),
        ]),
        ("AuditDeletionRequest", [
            ("_id", "ObjectId", "Primary key"),
            ("auditId", "Ref: Audit", "Audit being requested for deletion"),
            ("auditSnapshot", "Mixed", "Full copy of audit fields at request time — retained after deletion"),
            ("requestedBy", "Ref: User", "User who submitted the deletion request"),
            ("deletionNotes", "String", "Mandatory justification (min 10 chars)"),
            ("directorId", "Ref: User", "Director selected to approve or reject"),
            ("status", "Enum", "pending | approved | rejected"),
            ("reviewedBy", "Ref: User", "Director who actioned the request"),
            ("reviewedAt", "Date", "Timestamp of approval or rejection"),
            ("approvalNotes", "String", "Mandatory director rationale (min 10 chars)"),
        ]),
        ("ActivityLog", [
            ("_id", "ObjectId", "Primary key"),
            ("targetType", "Enum", "audit | flag | finding | handbook | position | payequity"),
            ("targetId", "ObjectId", "ID of the affected record"),
            ("auditId", "Ref: Audit", "Denormalised audit reference for filtering"),
            ("action", "Enum", "One of 19 defined action types (see Section 11.4)"),
            ("performedBy", "Ref: User", "User who performed the action"),
            ("organizationId", "String", "Org isolation key"),
            ("details", "Mixed", "Action-specific payload (before/after values, notes, etc.)"),
        ]),
    ]

    for entity_name, fields in entities:
        story.append(heading3(entity_name))
        story.append(table(
            ["Field", "Type", "Description"],
            fields,
            col_widths=[1.7*inch, 1.3*inch, 3.5*inch]
        ))
        story.append(SP(10))
    story.append(section_break())

    # ═══════════════════════════════════════════════════════════════
    # 14. GLOSSARY
    # ═══════════════════════════════════════════════════════════════
    story.append(heading1("14", "Glossary"))
    story.append(HR())

    terms = [
        ("Adverse Impact", "A substantially different rate of selection in employment decisions that works to the disadvantage of members of a protected group (race, gender, national origin, etc.)"),
        ("Audit", "The top-level container in TriMerge Comply representing a compliance engagement for a specific client or department"),
        ("bcrypt", "A password hashing function used to securely store passwords. A bcrypt hash is computationally expensive to reverse"),
        ("Cloudinary", "A cloud-based media storage and delivery service used by TriMerge Comply to host uploaded documents and evidence files"),
        ("Evidence", "A piece of information attached to a finding to support its conclusion. Can be text (notes, excerpts) or a file (PDF, spreadsheet, image)"),
        ("Finding", "A formal compliance conclusion documented within an audit. Must pass through a defined status machine and governance gate before approval"),
        ("Flag", "An automatically generated indicator that a demographic group's selection rate falls below the EEOC four-fifths threshold"),
        ("Four-Fifths Rule", "An EEOC guideline stating that a selection rate for a protected group that is less than four-fifths (80%) of the rate for the group with the highest selection rate is evidence of adverse impact"),
        ("Governance Gate", "A server-side enforcement check that blocks a finding from being approved unless criteria, recommendation, and at least one evidence item are present"),
        ("Impact Ratio", "The selection rate of a demographic group divided by the selection rate of the highest-selecting group. A value below 0.80 triggers a flag"),
        ("JWT (JSON Web Token)", "A compact, URL-safe token format used to convey authentication claims between the client and server"),
        ("Mailgun", "The third-party email delivery service used to send OTP codes and password reset links"),
        ("Multi-tenancy", "An architecture where a single platform instance serves multiple organisations, with complete data isolation between them"),
        ("OLS Regression", "Ordinary Least Squares regression — a statistical method used in pay equity analysis to estimate compensation gaps after controlling for legitimate factors"),
        ("OTP (One-Time Password)", "A single-use numeric code sent via email to verify identity for account verification and password changes"),
        ("organizationId", "A UUID (Universally Unique Identifier) assigned to a group of users sharing the same companyName. All data is filtered by this value to enforce multi-tenant isolation"),
        ("Pay Equity", "The principle that employees receive the same compensation for the same work, regardless of demographic characteristics"),
        ("Position Document", "An uploaded job description or job posting reviewed against government compliance standards"),
        ("Severity", "A classification of flag urgency: low, medium, high, or critical — determined by the impact ratio and statistical test results"),
        ("SME Reviewer", "A subject-matter expert who reviews and validates flags and findings created by analysts"),
    ]

    for term, definition in terms:
        story.append(KeepTogether([
            P(f"<b>{term}</b>"),
            P(definition, "note"),
            SP(4),
        ]))

    return story


# ── Document Build ─────────────────────────────────────────────────────────────
class CoverBodyDoc(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)

        cover_frame = Frame(
            0.75*inch, 0.75*inch,
            PAGE_W - 1.5*inch, PAGE_H - 1.5*inch,
            id="cover"
        )
        body_frame = Frame(
            0.75*inch, 0.7*inch,
            PAGE_W - 1.5*inch, PAGE_H - 1.4*inch,
            id="body"
        )

        self.addPageTemplates([
            PageTemplate(id="Cover", frames=cover_frame,  onPage=cover_footer),
            PageTemplate(id="Body",  frames=body_frame,   onPage=body_header_footer),
        ])

    def afterFlowable(self, flowable):
        pass


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    doc = CoverBodyDoc(
        OUTPUT_PATH,
        pagesize=letter,
        title="TriMerge Comply — User & Administration Manual",
        author="TriMerge Consulting",
        subject="Platform User & Administration Manual v1.0",
        creator="TriMerge Comply Documentation System",
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )

    # Draw cover background
    def cover_bg(canvas, doc):
        canvas.saveState()
        # Dark gradient background
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # Accent bar
        canvas.setFillColor(TEAL)
        canvas.rect(0, PAGE_H * 0.38, PAGE_W, 6, fill=1, stroke=0)
        canvas.setFillColor(BLUE)
        canvas.rect(0, PAGE_H * 0.38 - 3, PAGE_W, 3, fill=1, stroke=0)
        canvas.restoreState()

    # Rebuild page templates with cover background
    doc.pageTemplates[0].onPage = cover_bg

    story = build_story()

    # Insert frame change after cover page
    from reportlab.platypus import NextPageTemplate
    story.insert(0, NextPageTemplate("Cover"))

    # After cover page, switch to Body template
    toc_idx = next(i for i, f in enumerate(story) if isinstance(f, PageBreak))
    story.insert(toc_idx + 1, NextPageTemplate("Body"))

    doc.build(story)
    print(f"PDF generated: {OUTPUT_PATH}")
    print(f"Size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
