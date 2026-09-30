/**
 * CampusAI - Lightweight Local HTTP & API Dev Server
 * Built with standard Node.js libraries (Zero external npm packages required)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'src', 'main', 'resources', 'static');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle Mock API Endpoints
  if (pathname === '/api/chatbot/query' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const query = (data.query || '').toLowerCase();
        
        let reply = "Hello! 👋 I am **CampusAI Assistant** (Institutional Edition). Every answer cites authentic handbooks, circulars, and bulletin archives.";
        let citation = null;
        let quickReplies = ["💳 Fee due dates & late fine rules", "📚 Library book limit & fine policy", "📝 COE Exam circular & attendance cutoff", "⚖️ Grievance escalation & SLAs"];

        // 1. Library Rules
        if (/library|book|books|borrow|book bank|circulation|overdue|delnet|ieee/.test(query)) {
          reply = "📚 **Central Digital Library Regulations & Borrowing Code (Edition 4.2):**\n\n• **Operating Hours:** **8:30 AM – 7:00 PM** (Mon–Sat) | Exam Reading Halls open till **9:30 PM**.\n• **Borrowing Entitlements:** **UG Students: 5 Books for 14 Days** (1 online renewal) | PG: 7 Books | Faculty: 10 Books.\n• **Overdue Fines:** **₹2.00/day per book** (Days 1–7) → **₹5.00/day per book** (Day 8 onwards).\n• **SC/ST Book Bank:** Core textbook sets provided at **zero rental**.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"Undergraduate Students: 5 Books for a maximum duration of 14 days (1 online renewal permitted). Books retained beyond deadline incur overdue fines: ₹2.00 per book per day for the first 7 overdue days; ₹5.00 per book per day from Day 8 onwards.\"*";
          citation = {
            documentId: 'doc-lib-01',
            clauseId: 'cl-lib-5.2',
            refNumber: 'LIB/MANUAL/2026/V4.2',
            documentTitle: 'Central Digital Library Regulations Manual & Code of Ethics 2026 (Edition 4.2)',
            docType: 'REGULATORY_MANUAL',
            typeLabel: 'Central Digital Library Manual',
            section: '§ 5.2 Circulation Limits & Overdue Levies',
            issuingAuthority: 'Directorate of Central Library & Information Center',
            issueDate: 'June 25, 2026',
            effectiveTerm: 'Permanent Institutional Regulation',
            verified: true
          };
          quickReplies = ["SC/ST Book Bank scheme", "Digital Library VPN access", "Fee structure & deadlines", "Exam notices"];
        }
        // 2. Exam Revaluation & Photocopy
        else if (/revaluation|photocopy|reval|paper review|arrear|supplementary|script/.test(query)) {
          reply = "🔄 **Autonomous COE Revaluation & Supplementary Examination Guidelines:**\n\n• **Photocopy of Script:** Apply within **7 days** of results | Fee: **₹300 per subject**.\n• **Revaluation Window:** Apply within **10 days** | Fee: **₹400 per theory course**.\n• **Grade Upgrade Refund:** If grade improves by >= 2 letter grades, **50% revaluation fee is refunded**.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"Revaluation applications must be submitted within 10 calendar days of result declaration accompanied by a fee of ₹400 per theory course. If the revaluation yields an upward grade revision of 2 letter grades or more, 50% of the revaluation fee is refunded automatically.\"*";
          citation = {
            documentId: 'doc-coe-02',
            clauseId: 'cl-rev-4.2',
            refNumber: 'COE/REV/2026/SUPP-03',
            documentTitle: 'Autonomous Revaluation, Photocopy of Answer Scripts & Supplementary Examination Notification',
            docType: 'ADMIN_CIRCULAR',
            typeLabel: 'COE Regulatory Circular',
            section: '§ 4.2 Revaluation Protocols & Grade Refund',
            issuingAuthority: 'Office of the Controller of Examinations',
            issueDate: 'August 18, 2026',
            effectiveTerm: 'Permanent Examination Protocol',
            verified: true
          };
        }
        // 3. Exam Schedule & 75% Attendance Circular
        else if (/exam|coe|hall ticket|attendance percentage|condonation|end-sem/.test(query)) {
          reply = "📢 **Autonomous COE End-Semester Examination Circular (Ref: COE/CIR/2026/ODD/042):**\n\n• **Exam Schedule:** Theory Exams start **October 28, 2026** | Practicals: **October 14–22, 2026**.\n• **Attendance Rule:** Mandatory minimum **75.0% aggregate attendance** required for hall ticket eligibility.\n• **Medical Condonation (65.0% – 74.9%):** Hospital discharge summary, HOD recommendation, and **₹1,500 condonation fee** upon Principal approval.\n• **Hall Ticket Download:** Available from **October 20, 2026**.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"Per Autonomous Academic Regulation 7.2, a student must secure a minimum aggregate attendance of 75% across all registered courses to be eligible to sit for the Autonomous End-Semester Examinations.\"*";
          citation = {
            documentId: 'doc-coe-01',
            clauseId: 'cl-coe-2.3',
            refNumber: 'COE/CIR/2026/ODD/042',
            documentTitle: 'Autonomous Controller of Examinations (COE) ODD Semester Examination & Hall Ticket Directive',
            docType: 'ADMIN_CIRCULAR',
            typeLabel: 'Autonomous COE Official Circular',
            section: '§ 2.3 Mandatory 75% Attendance Eligibility',
            issuingAuthority: 'Office of the Controller of Examinations (Autonomous)',
            issueDate: 'September 20, 2026',
            effectiveTerm: 'Autonomous ODD Semester 2026',
            verified: true
          };
        }
        // 4. Anti-Ragging & ICC POSH Cell
        else if (/ragging|harassment|icc|posh|women cell|emergency helpline|squad/.test(query)) {
          reply = "🛡️ **Statutory Anti-Ragging Mandate & Internal Complaints Committee (ICC):**\n\n• **Zero-Tolerance Policy:** Immediate suspension, police FIR, and expulsion under UGC Regulations 2009.\n• **24/7 National Anti-Ragging Helpline:** 📞 **1800-180-5522** (Toll-Free)\n• **Campus Flying Squad Hotline:** 📞 **04324-290142 / 98424-26222** | ✉️ `antiragging@vsbec.edu.in`\n• **ICC POSH Committee:** Presiding Officer **Dr. S. Malathi** (`icc@vsbec.edu.in`) with 15-day resolution timeframe.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"VSB Engineering College enforces a strictly Zero-Tolerance policy against ragging in any form inside campus premises, hostels, and buses. Proven acts of ragging attract immediate institutional suspension, withholding of degree, police FIR lodging, and expulsion.\"*";
          citation = {
            documentId: 'doc-icc-01',
            clauseId: 'cl-icc-1.2',
            refNumber: 'INST/CIR/ICC-AR/2026/007',
            documentTitle: 'Statutory Anti-Ragging Mandate & Internal Complaints Committee (ICC / POSH) Constitution',
            docType: 'ADMIN_CIRCULAR',
            typeLabel: 'Statutory Compliance Notice',
            section: '§ 1.2 Zero-Tolerance Statutory Enforcement',
            issuingAuthority: 'Anti-Ragging Squad & Internal Complaints Committee (ICC)',
            issueDate: 'August 01, 2026',
            effectiveTerm: 'Permanent Statutory Directive',
            verified: true
          };
        }
        // 5. Grievance Redressal Multi-Tier Process
        else if (/grievance|complaint|escalation|sla|problem|issue|redressal|ombudsman/.test(query)) {
          reply = "⚖️ **Institutional Grievance Redressal Mechanism & Student Charter:**\n\nAll campus grievances are governed by a **Four-Tier Escalation Hierarchy** with guaranteed SLAs:\n\n• **Level 1 (Faculty Advisor / Mentor):** SLA: **24 to 48 Hours**.\n• **Level 2 (Head of Department - HoD):** SLA: **3 Working Days**.\n• **Level 3 (College GRC Committee & Principal):** SLA: **7 Working Days**.\n• **Level 4 (Anna University Ombudsman):** Final Appellate Authority.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"All complaints follow a structured four-tier escalation ladder with enforceable turnaround SLAs: Level 1 Faculty Advisor resolution within 24-48 hours; Level 2 Head of Department within 3 days; Level 3 Apex GRC & Principal within 7 working days.\"*";
          citation = {
            documentId: 'doc-grc-01',
            clauseId: 'cl-grc-3.1',
            refNumber: 'VSB/GRC/POLICY/2026/01',
            documentTitle: 'Institutional Grievance Redressal Mechanism & Student Charter (Ref: 2026/01)',
            docType: 'INSTITUTIONAL_HANDBOOK',
            typeLabel: 'Statutory Grievance Policy Manual',
            section: '§ 3.1 Four-Tier Escalation Hierarchy & SLAs',
            issuingAuthority: 'Apex Grievance Redressal Committee & Office of the Principal',
            issueDate: 'May 12, 2026',
            effectiveTerm: 'Permanent Institutional Statute',
            verified: true
          };
        }
        // 6. Scholarships & Waivers
        else if (/scholarship|merit|tnea|waiver|concession|topper|cash award|first graduate/.test(query)) {
          reply = "🏆 **VSB Educational Trust Merit Scholarships & Fee Concession Regulations:**\n\n• **TNEA Cutoff >= 195/200:** **100% Tuition Fee Waiver** for all 4 academic years.\n• **TNEA Cutoff 190.0 – 194.9:** **50% Tuition Fee Concession** throughout degree tenure.\n• **Semester CGPA Excellence:** Dept toppers with CGPA >= 9.25 receive **₹25,000 Cash Award**.\n• **Govt Welfare Grants:** First Graduate (₹25,000/yr) and 7.5% preferential quota waivers processed by the College Nodal Desk.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"Candidates securing admission through TNEA counseling with aggregate 10+2 cutoff marks >= 195/200 receive a 100% Tuition Fee Waiver for all 4 years. Candidates with cutoff marks between 190.0 and 194.9 receive a 50% Tuition Fee Concession throughout their academic tenure.\"*";
          citation = {
            documentId: 'doc-scholar-01',
            clauseId: 'cl-sch-2.1',
            refNumber: 'TRUST-SCHOLAR-2026/B-12',
            documentTitle: 'VSB Educational Trust Merit Scholarship & Concession Policy Bulletin 2026',
            docType: 'BULLETIN_ARCHIVE',
            typeLabel: 'Trust Policy Bulletin',
            section: '§ 2.1 TNEA Merit Entrance Waivers',
            issuingAuthority: 'Board of Trustees & Student Financial Aid Desk',
            issueDate: 'July 15, 2026',
            effectiveTerm: 'Academic Year 2026–2027',
            verified: true
          };
        }
        // 7. General Fees, Due Dates & Late Fine
        else if (/fee|fees|tuition|payment|due date|deadline|late fee|fine|installment|refund/.test(query)) {
          reply = "💳 **Institutional Tuition & Fee Payment Regulations (AY 2026–2027):**\n\n• **Payment Due Dates:** **Odd Semester: September 30, 2026** | **Even Semester: January 31, 2027**.\n• **Grace Period:** **7 working days** after due date with zero penalty.\n• **Late Fine Slabs:** **₹50/day** (Days 8 to 15) and **₹100/day** (Days 16 to 30).\n• **Fee Structure Breakdown:** Govt Quota: ₹55,000/sem | Management Quota: ₹85,000/sem | Lab & Amenities: ₹12,500/sem.\n\n> 📌 **Exact Excerpt from Institutional Archive**:\n> *\"All enrolled students must remit semester tuition and laboratory dues on or before the designated cutoff date: Odd Semester cutoff is September 30, 2026. A statutory grace period of 7 working days is granted before administrative late penalties commence.\"*";
          citation = {
            documentId: 'doc-fees-01',
            clauseId: 'cl-fee-4.2',
            refNumber: 'VSB/FIN/FEE-REG/2026-27/01',
            documentTitle: 'Institutional Tuition & Fee Schedule Regulations (Academic Year 2026–2027)',
            docType: 'INSTITUTIONAL_HANDBOOK',
            typeLabel: 'Institutional Academic Handbook',
            section: '§ 4.2(a) Semester Payment Deadlines & Surcharges',
            issuingAuthority: 'Office of Finance & Accounts & State Fee Regulatory Committee',
            issueDate: 'August 10, 2026',
            effectiveTerm: 'Academic Session 2026–2027',
            verified: true
          };
        }
        // Fallback
        else {
          citation = {
            documentId: 'doc-fees-01',
            clauseId: 'cl-fee-4.2',
            refNumber: 'VSB/INST/ARCHIVE/2026-27',
            documentTitle: 'Institutional Policy & Student Regulatory Handbooks',
            docType: 'INSTITUTIONAL_HANDBOOK',
            typeLabel: 'Institutional Archives',
            section: 'Official Statutory Knowledge Base',
            issuingAuthority: 'Office of the Principal & Academic Directorate',
            issueDate: 'Academic Session 2026–2027',
            effectiveTerm: 'AY 2026-27',
            verified: true
          };
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply, citation, quickReplies, intent: 'PROCESSED_WITH_CITATION' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON request' }));
      }
    });
    return;
  }

  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Check if static file exists in static folder or root
  let filePath = path.join(PUBLIC_DIR, pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, pathname);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1><p>CampusAI web asset not found.</p>');
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(` 🎓 CampusAI Web Server running at: http://localhost:${PORT}`);
  console.log(` 🚀 Student Portal:   http://localhost:${PORT}/student-dashboard.html`);
  console.log(` 👨‍🏫 Faculty Portal:   http://localhost:${PORT}/faculty-dashboard.html`);
  console.log(` 🛡️  Admin Console:    http://localhost:${PORT}/admin-dashboard.html`);
  console.log('====================================================');
});
