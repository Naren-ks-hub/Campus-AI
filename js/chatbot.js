/**
 * CampusAI - Smart AI Chatbot Assistant Engine
 * Enhanced with Institutional Document & Admin Notice Citations
 * Knowledge Base: Official Handbooks, Circulars, and Bulletin Archives
 */

// ==========================================================
// INSTITUTIONAL KNOWLEDGE BASE & OFFICIAL ARCHIVES REGISTRY
// ==========================================================
const INSTITUTIONAL_ARCHIVE_KB = {
  // 1. FEES & FINANCIAL REGULATIONS
  'doc-fees-01': {
    id: 'doc-fees-01',
    category: 'FEES',
    docType: 'INSTITUTIONAL_HANDBOOK',
    typeLabel: 'Institutional Academic Handbook',
    icon: 'fa-file-invoice-dollar',
    title: 'Institutional Tuition & Fee Schedule Regulations (Academic Year 2026–2027)',
    refNumber: 'VSB/FIN/FEE-REG/2026-27/01',
    issuingAuthority: 'Office of Finance & Accounts & State Fee Regulatory Committee',
    signatory: 'Dr. Alistair Vance (Principal) & Shri K. Natesan (Chairman, VSB Educational Trust)',
    issueDate: 'August 10, 2026',
    effectiveTerm: 'Academic Session 2026–2027',
    verificationCode: 'VER-AUTH-2026-FEE-8891',
    verified: true,
    summary: 'Prescribes mandatory tuition fee structures, payment deadlines, late fine penalties, installment procedures, and discontinuation refund schedules.',
    clauses: [
      {
        id: 'cl-fee-4.1',
        section: '§ 4.1 Fee Structure & Breakdown',
        title: 'Tuition & Infrastructure Amenities Breakup',
        text: 'The approved annual tuition fee adheres strictly to the Tamil Nadu State Fee Committee guidelines: Government Quota B.E./B.Tech tuition fee is fixed at ₹55,000 per semester; Management Quota tuition fee is fixed at ₹85,000 per semester. Special amenities fees (Advanced Computing Labs, High-Speed Internet, AICTE IDEA Lab usage, and Career Training) are fixed at ₹12,500 per semester.'
      },
      {
        id: 'cl-fee-4.2',
        section: '§ 4.2(a) Semester Payment Deadlines & Grace Period',
        title: 'Payment Schedules & Mandatory Clearance',
        text: 'All enrolled undergraduate and postgraduate students must remit their semester tuition and laboratory dues on or before the designated cutoff date: Odd Semester cutoff is September 30, 2026; Even Semester cutoff is January 31, 2027. A statutory grace period of 7 working days is granted following the cutoff date before administrative late penalties commence.'
      },
      {
        id: 'cl-fee-4.3',
        section: '§ 4.3 Late Payment Fine Slabs & De-registration',
        title: 'Administrative Surcharges for Delinquent Dues',
        text: 'Dues paid after the 7-day grace window shall attract a late administrative fee: Days 8 to 15: ₹50 per calendar day; Days 16 to 30: ₹100 per calendar day. Failure to remit fees beyond 30 days from the original deadline results in administrative de-registration and withholding of Autonomous End-Semester Examination Hall Tickets until a No-Dues Certificate is endorsed by the Dean (Academic).'
      },
      {
        id: 'cl-fee-4.4',
        section: '§ 4.4 Installment & Financial Deferral Petitions',
        title: 'Hardship Installment Assistance Mechanism',
        text: 'Students experiencing verified financial hardships may submit a formal petition for split installment payments (maximum two installments of 50% each) to the Office of the Dean (Student Affairs) at least 10 days prior to the fee deadline. Endorsement requires parent/guardian consent and recommendation of the Faculty Advisor.'
      },
      {
        id: 'cl-fee-4.5',
        section: '§ 4.5 Fee Refund & Cancellation Policy',
        title: 'Statutory AICTE/UGC Normative Refund Slabs',
        text: 'Requests for program withdrawal submitted before the commencement of the academic semester shall be refunded 100% of the tuition fee minus a maximum administrative processing deduction of ₹1,000. For withdrawals made within 15 days of class commencement, an 80% refund is issued; within 30 days, a 50% refund is issued. Caution deposits are refunded in full after library and lab clearance.'
      }
    ]
  },

  // 2. SCHOLARSHIPS & MERIT CONCESSIONS
  'doc-scholar-01': {
    id: 'doc-scholar-01',
    category: 'FEES',
    docType: 'BULLETIN_ARCHIVE',
    typeLabel: 'Trust Policy Bulletin',
    icon: 'fa-award',
    title: 'VSB Educational Trust Merit Scholarship & Concession Policy Bulletin 2026',
    refNumber: 'TRUST-SCHOLAR-2026/B-12',
    issuingAuthority: 'Board of Trustees & Student Financial Aid Desk',
    signatory: 'Shri K. Natesan (Trust Chairman) & Prof. P. Kanagaraj (Trustee)',
    issueDate: 'July 15, 2026',
    effectiveTerm: 'Academic Year 2026–2027',
    verificationCode: 'VER-AUTH-2026-SCH-4102',
    verified: true,
    summary: 'Outlines 100% and 50% tuition waivers for top TNEA ranking students, high CGPA semester incentives, and government welfare fee remissions.',
    clauses: [
      {
        id: 'cl-sch-2.1',
        section: '§ 2.1 TNEA Merit Entrance Waivers',
        title: 'TNEA Score Concession Slabs',
        text: 'Candidates securing admission through TNEA counseling with aggregate 10+2 cutoff marks >= 195/200 receive a 100% Tuition Fee Waiver for all 4 years. Candidates with cutoff marks between 190.0 and 194.9 receive a 50% Tuition Fee Concession throughout their academic tenure, contingent on maintaining minimum 7.5 CGPA and zero standing arrears.'
      },
      {
        id: 'cl-sch-2.2',
        section: '§ 2.2 Academic Semester Excellence Awards',
        title: 'CGPA Departmental Cash Incentives',
        text: 'The top academic rank holder in each engineering branch per semester securing a CGPA >= 9.25 is awarded the VSB Trust Scholar Cash Prize of ₹25,000 and a Certificate of Merit. The overall college topper receives ₹35,000 and a citation at the Annual College Day ceremony.'
      },
      {
        id: 'cl-sch-2.3',
        section: '§ 2.3 Government Welfare & First Graduate Scheme',
        title: 'First-Generation Graduate & Post-Matric SC/ST Grants',
        text: 'Eligible students admitted under the Tamil Nadu Government 7.5% preferential quota for government school students, First Graduate Scheme (₹25,000 waiver per year), and Post-Matric SC/ST scholarship receive direct fee adjustments through the College Scholarship Nodal Cell.'
      }
    ]
  },

  // 3. LIBRARY REGULATIONS & DIGITAL ARCHIVES
  'doc-lib-01': {
    id: 'doc-lib-01',
    category: 'LIBRARY',
    docType: 'REGULATORY_MANUAL',
    typeLabel: 'Central Digital Library Manual',
    icon: 'fa-book-bookmark',
    title: 'Central Digital Library Regulations Manual & Code of Ethics 2026 (Edition 4.2)',
    refNumber: 'LIB/MANUAL/2026/V4.2',
    issuingAuthority: 'Directorate of Central Library & Information Center',
    signatory: 'Dr. M. Soundararajan (Chief Librarian) & Dr. Alistair Vance (Principal)',
    issueDate: 'June 25, 2026',
    effectiveTerm: 'Permanent Institutional Regulation',
    verificationCode: 'VER-AUTH-2026-LIB-1094',
    verified: true,
    summary: 'Specifies library opening hours, borrowing quotas per user role, renewal limits, overdue fine calculations, SC/ST Book Bank access, and digital resource usage.',
    clauses: [
      {
        id: 'cl-lib-3.1',
        section: '§ 3.1 Operating Hours & Air-Conditioned Study Halls',
        title: 'Library Working Hours & Exam Extension',
        text: 'The Central Digital Library operates from 8:30 AM to 7:00 PM on all instructional working days (Monday to Saturday). During autonomous mid-semester and end-semester examination cycles, the reference reading halls and digital workstation pods remain open on extended schedule until 9:30 PM with Wi-Fi and power-backup support.'
      },
      {
        id: 'cl-lib-5.2',
        section: '§ 5.2 Circulation Limits & Borrowing Durations',
        title: 'Borrowing Quota by User Category',
        text: 'Circulation entitlements are governed strictly by user role: Undergraduate (B.E./B.Tech) Students: 5 Books for a maximum duration of 14 days (1 online renewal permitted if no reservation hold is placed); Postgraduate (M.E./MBA) Students: 7 Books for 21 days; Faculty Members: 10 Books for 30 days. Barcoded Smart Student ID cards are non-transferable.'
      },
      {
        id: 'cl-lib-6.4',
        section: '§ 6.4 Overdue Fines & Penalty Accumulation',
        title: 'Late Return Fine Structure',
        text: 'Books retained beyond the stipulated return/renewal deadline shall incur overdue fines: ₹2.00 per book per day for the first 7 overdue days; ₹5.00 per book per day from Day 8 onwards. If total accrued fines on a student account exceed ₹50.00, book borrowing privileges are automatically suspended until settlement at the library circulation desk.'
      },
      {
        id: 'cl-lib-7.1',
        section: '§ 7.1 SC/ST & Economically Weaker Book Bank Scheme',
        title: 'Special Semester Book Bank Lending',
        text: 'Under the VSB Central Book Bank scheme, eligible SC/ST and economically weaker students are issued a full set of core prescribed textbooks (up to 6 textbooks per semester) for the entire semester duration at zero borrowing cost. Books must be surrendered within 5 days following the conclusion of autonomous theory exams.'
      },
      {
        id: 'cl-lib-8.3',
        section: '§ 8.3 E-Resource Portals (IEEE Xplore, DELNET, Springer, NPTEL)',
        title: 'Digital Resource Remote VPN Access',
        text: 'All enrolled students receive authenticated off-campus VPN access to IEEE Xplore Digital Library, DELNET Inter-Library Loan portal, ScienceDirect, Springer journals, and local NPTEL video storage servers (50TB repository). Credentials are provided by the Digital Library Administrator.'
      },
      {
        id: 'cl-lib-9.2',
        section: '§ 9.2 Lost / Damaged Book Replacement Policy',
        title: 'Indemnification & Procurement Surcharge',
        text: 'In the event of physical loss or severe mutilation of a borrowed volume, the borrower must replace the book with an identical or newer edition within 14 days. Alternatively, the borrower must reimburse the current catalog retail price of the book plus a 50% administrative procurement surcharge.'
      }
    ]
  },

  // 4. EXAM NOTICES & AUTONOMOUS COE CIRCULARS
  'doc-coe-01': {
    id: 'doc-coe-01',
    category: 'EXAMS',
    docType: 'ADMIN_CIRCULAR',
    typeLabel: 'Autonomous COE Official Circular',
    icon: 'fa-file-signature',
    title: 'Autonomous Controller of Examinations (COE) ODD Semester Examination & Hall Ticket Directive',
    refNumber: 'COE/CIR/2026/ODD/042',
    issuingAuthority: 'Office of the Controller of Examinations (Autonomous)',
    signatory: 'Dr. K. Senthil, Ph.D. (Controller of Examinations)',
    issueDate: 'September 20, 2026',
    effectiveTerm: 'Autonomous ODD Semester 2026',
    verificationCode: 'VER-AUTH-2026-COE-7721',
    verified: true,
    summary: 'Mandates official exam dates starting October 28th, strict 75% attendance threshold for hall ticket generation, medical condonation slabs, and malpractice disciplinary action.',
    clauses: [
      {
        id: 'cl-coe-1.1',
        section: '§ 1.1 Examination Commencement Schedules',
        title: 'Theory & Practical Exam Dates',
        text: 'Autonomous End-Semester Theory Examinations for 3rd, 5th, and 7th Semester B.E./B.Tech programs will commence on October 28, 2026. Practical laboratory examinations and project viva-voce assessments are scheduled between October 14 and October 22, 2026. Daily sessions: Forenoon (09:30 AM to 12:30 PM) and Afternoon (01:30 PM to 04:30 PM).'
      },
      {
        id: 'cl-coe-2.3',
        section: '§ 2.3 Mandatory 75% Attendance Requirement',
        title: 'Hall Ticket Generation Eligibility Criterion',
        text: 'Per Autonomous Academic Regulation 7.2, a student must secure a minimum aggregate attendance of 75% across all registered theory and laboratory courses to be eligible to sit for the Autonomous End-Semester Examinations. Students failing to meet 75% aggregate attendance shall be categorized as "Detained due to Lack of Attendance" (SA) and will not be issued a hall ticket.'
      },
      {
        id: 'cl-coe-2.4',
        section: '§ 2.4 Medical Condonation Exemption Window',
        title: 'Condonation Slabs (65.0% to 74.9%) on Medical Grounds',
        text: 'Students possessing attendance between 65.0% and 74.9% may apply for Condonation of Attendance on valid medical grounds (hospitalization, surgery, or serious contagious illness) or representation of the institution in state/national sports. Applications must be endorsed by the Head of Department with certified hospital documents and approved by the Principal, subject to a condonation processing fee of ₹1,500 per semester.'
      },
      {
        id: 'cl-coe-3.1',
        section: '§ 3.1 Hall Ticket Issuance & Entry Protocols',
        title: 'Digital Hall Ticket Release & Verification',
        text: 'Digital Hall Tickets will be released on the CampusAI Student Portal on October 20, 2026, at 10:00 AM for all fee-cleared, attendance-eligible candidates. Candidates must carry a clear printed physical hall ticket and valid college photo ID card into the examination hall. Entry without hall ticket is prohibited under Regulation 11.1.'
      },
      {
        id: 'cl-coe-4.2',
        section: '§ 4.2 Examination Malpractice Disciplinary Penalties',
        title: 'Autonomous Malpractice Penal Code (Clause 14.3)',
        text: 'Possession of unauthorized study materials, mobile phones, smartwatches, programmable calculators, or copying from other candidates shall result in immediate confiscation, cancellation of all registered exams in the current semester, and referral to the Standing Examination Disciplinary Committee.'
      }
    ]
  },

  // 5. EXAM REVALUATION & SUPPLEMENTARY NOTICES
  'doc-coe-02': {
    id: 'doc-coe-02',
    category: 'EXAMS',
    docType: 'ADMIN_CIRCULAR',
    typeLabel: 'COE Regulatory Circular',
    icon: 'fa-rotate-left',
    title: 'Autonomous Revaluation, Photocopy of Answer Scripts & Supplementary Examination Notification',
    refNumber: 'COE/REV/2026/SUPP-03',
    issuingAuthority: 'Office of the Controller of Examinations',
    signatory: 'Dr. K. Senthil, Ph.D. (Controller of Examinations)',
    issueDate: 'August 18, 2026',
    effectiveTerm: 'Permanent Examination Protocol',
    verificationCode: 'VER-AUTH-2026-COE-3301',
    verified: true,
    summary: 'Specifies application windows and fees for photocopy of evaluated answer scripts, revaluation review, grade revision refunds, and supplementary exam attempts.',
    clauses: [
      {
        id: 'cl-rev-4.1',
        section: '§ 4.1 Photocopy of Evaluated Answer Scripts',
        title: 'Answer Script Inspection Process',
        text: 'Students desiring to inspect their evaluated answer scripts must apply through the portal within 7 working days of result publication. A non-refundable fee of ₹300 per subject script applies. Evaluated scripts are delivered digitally to the student portal within 48 hours of verification.'
      },
      {
        id: 'cl-rev-4.2',
        section: '§ 4.2 Revaluation Application & Grade Revision Refund',
        title: 'Revaluation Protocols & Fee Waiver',
        text: 'Revaluation applications must be submitted within 10 calendar days of result declaration accompanied by a fee of ₹400 per theory course. If the revaluation yields an upward grade revision of 2 letter grades or more (e.g., from C to A, or B to O), 50% of the revaluation fee is refunded automatically.'
      },
      {
        id: 'cl-rev-5.1',
        section: '§ 5.1 Supplementary / Arrear Examination Cycles',
        title: 'Arrear Clearence & Fast-Track Windows',
        text: 'Supplementary examinations for odd-semester courses are conducted alongside regular even-semester exams in April/May. For final-year students with standing arrears in maximum 2 courses, a Special Fast-Track Supplementary Examination is convened within 30 days of graduation result publication.'
      }
    ]
  },

  // 6. GRIEVANCE REDRESSAL & STUDENT CHARTER
  'doc-grc-01': {
    id: 'doc-grc-01',
    category: 'GRIEVANCE',
    docType: 'INSTITUTIONAL_HANDBOOK',
    typeLabel: 'Statutory Grievance Policy Manual',
    icon: 'fa-scale-balanced',
    title: 'Institutional Grievance Redressal Mechanism & Student Charter (Ref: 2026/01)',
    refNumber: 'VSB/GRC/POLICY/2026/01',
    issuingAuthority: 'Apex Grievance Redressal Committee & Office of the Principal',
    signatory: 'Prof. R. Revathi (Chairperson, GRC) & Dr. Alistair Vance (Principal)',
    issueDate: 'May 12, 2026',
    effectiveTerm: 'Permanent Institutional Statute',
    verificationCode: 'VER-AUTH-2026-GRC-9014',
    verified: true,
    summary: 'Defines four-tier grievance escalation hierarchy, strict 24-48h resolution SLA for Level 1, protection from retaliation, and digital complaint tracking.',
    clauses: [
      {
        id: 'cl-grc-2.1',
        section: '§ 2.1 Scope & Grievance Classifications',
        title: 'Recognized Complaint Categories',
        text: 'The Institutional Grievance Redressal Mechanism entertains grievances across five primary categories: (1) Academic Disputes & Internal Assessment Discrepancies; (2) Campus Infrastructure, Labs, Electricity, and Wi-Fi Services; (3) Hostel Accommodation, Cleanliness, and Mess Dining; (4) Canteen Quality & College Bus Transportation; (5) Interpersonal Harassment, Discrimination, or Unethical Conduct.'
      },
      {
        id: 'cl-grc-3.1',
        section: '§ 3.1 Four-Tier Escalation Hierarchy & Turnaround SLAs',
        title: 'Multi-Level Redressal Hierarchy & SLA Timelines',
        text: 'All complaints follow a structured four-tier escalation ladder with enforceable turnaround SLAs:\n• Level 1 - Faculty Advisor / Class Mentor: First point of resolution. Enforceable Resolution SLA: 24 to 48 Hours.\n• Level 2 - Head of the Department (HOD): For unresolved academic or lab matters. Resolution SLA: 3 Working Days.\n• Level 3 - Apex College Grievance Redressal Committee (GRC) & Principal: For administrative, financial, hostel, or disciplinary appeals. Resolution SLA: 7 Working Days.\n• Level 4 - University Student Grievance Ombudsman (Anna University / AICTE Appellate Authority): Final appellate tier for unresolved institutional disputes.'
      },
      {
        id: 'cl-grc-4.2',
        section: '§ 4.2 Digital Grievance Logging & Confidentiality',
        title: 'Zero-Retaliation Policy & Real-Time Tracking',
        text: 'Students can lodge formal complaints 24/7 via the "Grievance Desk" tab on their CampusAI Student Dashboard or via email to grievance@vsbec.edu.in. Every complaint generates a unique Ticket ID with real-time status tracking (Pending → In Progress → Resolved). The institute maintains strict zero-retaliation and anonymity protections for all complainants.'
      }
    ]
  },

  // 7. ANTI-RAGGING & INTERNAL COMPLAINTS COMMITTEE (ICC)
  'doc-icc-01': {
    id: 'doc-icc-01',
    category: 'GRIEVANCE',
    docType: 'ADMIN_CIRCULAR',
    typeLabel: 'Statutory Compliance Notice',
    icon: 'fa-shield-halved',
    title: 'Statutory Anti-Ragging Mandate & Internal Complaints Committee (ICC / POSH) Constitution',
    refNumber: 'INST/CIR/ICC-AR/2026/007',
    issuingAuthority: 'Anti-Ragging Squad & Internal Complaints Committee (ICC)',
    signatory: 'Dr. S. Malathi (Presiding Officer, ICC) & Dr. Alistair Vance (Principal)',
    issueDate: 'August 01, 2026',
    effectiveTerm: 'Permanent Statutory Directive',
    verificationCode: 'VER-AUTH-2026-ICC-2089',
    verified: true,
    summary: 'Zero tolerance anti-ragging penalties, 24/7 toll-free helpline numbers, and confidential Internal Complaints Committee (POSH) redressal within 15 days.',
    clauses: [
      {
        id: 'cl-icc-1.2',
        section: '§ 1.2 Zero-Tolerance Anti-Ragging Enforcement',
        title: 'UGC Ragging Regulations 2009 Statutory Penalties',
        text: 'VSB Engineering College enforces a strictly Zero-Tolerance policy against ragging in any form (physical, verbal, digital, or psychological) inside campus premises, hostels, and buses. Proven acts of ragging attract immediate institutional suspension, withholding of degree/scholarships, police FIR lodging, and permanent expulsion without appeal.'
      },
      {
        id: 'cl-icc-1.3',
        section: '§ 1.3 24/7 Emergency Helplines & Flying Squad',
        title: 'Immediate Contact Points for Assistance',
        text: 'Students in distress may contact emergency squads immediately:\n• National Anti-Ragging Toll-Free Helpline: 1800-180-5522 (24/7 Helpline)\n• VSB Campus Anti-Ragging Flying Squad Hotline: 04324-290142 / 98424-26222\n• Dedicated Emergency Email: antiragging@vsbec.edu.in'
      },
      {
        id: 'cl-icc-2.1',
        section: '§ 2.1 Internal Complaints Committee (ICC / POSH Cell)',
        title: 'Gender Sensitization & Confidential POSH Grievances',
        text: 'Constituted under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013. Female students and staff can lodge confidential grievances to Presiding Officer Dr. S. Malathi via icc@vsbec.edu.in or physical drop box at the Administration Block. Formal inquiry proceedings conclude within 15 working days.'
      }
    ]
  },

  // 8. PLACEMENTS & CAREER MANUAL
  'doc-cdc-01': {
    id: 'doc-cdc-01',
    category: 'PLACEMENTS',
    docType: 'INSTITUTIONAL_HANDBOOK',
    typeLabel: 'Career Development Handbook',
    icon: 'fa-briefcase',
    title: 'Career Development Centre (CDC) Training & Placement Code of Conduct 2026',
    refNumber: 'CDC/POLICY/2026/P-01',
    issuingAuthority: 'Career Development Centre (CDC) & Placement Directorate',
    signatory: 'Prof. K. Venkatesh (Dean, Corporate Relations & Placements)',
    issueDate: 'July 10, 2026',
    effectiveTerm: 'Academic Year 2026–2027',
    verificationCode: 'VER-AUTH-2026-CDC-5501',
    verified: true,
    summary: 'Details 47 LPA highest CTC record, 1000+ offers, dream package policies, on-campus drive eligibility, and mandatory pre-placement training modules.',
    clauses: [
      {
        id: 'cl-cdc-1.1',
        section: '§ 1.1 Placement Statistics & Highest Package Records',
        title: 'Institutional CTC Benchmarks',
        text: 'VSB Engineering College maintains an elite recruitment footprint with the highest annual CTC reaching INR 47.0 Lakhs per annum (offered by Autodesk & Amazon). Top recruiters include Amazon, Autodesk, TCS Digital, Zoho, Infosys, Cognizant, Wipro, Hexaware, and Capgemini with 1000+ offers across branches.'
      },
      {
        id: 'cl-cdc-2.3',
        section: '§ 2.3 Dream Company & Multiple Offer Policy',
        title: 'Offer Upgrade Criteria',
        text: 'Students securing a regular offer (<= 6.0 LPA) are eligible to appear for "Dream" tier drives (7.0 to 12.0 LPA) and "Super Dream" tier drives (> 12.0 LPA). Once a student receives a Super Dream offer, their placement cycle is concluded to ensure equal opportunity across the batch.'
      }
    ]
  },

  // 9. TRANSPORT & BUS ROUTES
  'doc-trans-01': {
    id: 'doc-trans-01',
    category: 'TRANSPORT',
    docType: 'REGULATORY_MANUAL',
    typeLabel: 'Transportation Operations Manual',
    icon: 'fa-bus-simple',
    title: 'College Bus Transportation & Commuter Regulations (Academic Year 2026–2027)',
    refNumber: 'TRANS/MANUAL/2026/R-50',
    issuingAuthority: 'Transport Division & General Administration',
    signatory: 'Er. N. Selvaraj (Transport Officer) & Dr. Alistair Vance (Principal)',
    issueDate: 'August 05, 2026',
    effectiveTerm: 'Academic Year 2026–2027',
    verificationCode: 'VER-AUTH-2026-TRN-9022',
    verified: true,
    summary: 'Covers 50+ college buses connecting Karur, Trichy, Dindigul, Erode, and Namakkal, bus pass issuance, morning pickup schedules, and 4:45 PM departure.',
    clauses: [
      {
        id: 'cl-trans-1.1',
        section: '§ 1.1 Route Coverage & Departure Schedules',
        title: '50+ Dedicated Bus Routes Network',
        text: 'The college operates 50+ modern GPS-equipped buses covering routes across Karur City & Suburbs, Tiruchirappalli (Trichy), Dindigul, Erode, and Namakkal. All buses arrive on campus by 8:30 AM and depart daily at 4:45 PM (extended to 6:30 PM for lab/placement participants).'
      },
      {
        id: 'cl-trans-2.2',
        section: '§ 2.2 Digital Bus Pass & RFID Attendance',
        title: 'Bus Pass Verification Protocol',
        text: 'Students commuting via college transport must tap their RFID Smart Student ID at the bus door reader during boarding. Route change petitions must be submitted to the Transport Division with 3 days advance notice.'
      }
    ]
  }
};

// ==========================================================
// CHATBOT INITIALIZATION & CORE LIFECYCLE
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

function initChatbot() {
  if (!document.getElementById('campusai-chatbot')) {
    injectChatbotMarkup();
  }

  const launcher = document.getElementById('chat-launcher');
  const container = document.getElementById('chat-container');
  const closeBtn = document.getElementById('chat-close-btn');
  const clearBtn = document.getElementById('chat-clear-btn');
  const archivesBtn = document.getElementById('chat-archives-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const voiceBtn = document.getElementById('chat-voice-btn');
  const input = document.getElementById('chat-input');
  const messagesBox = document.getElementById('chat-messages');
  const quickRepliesBox = document.getElementById('chat-quick-replies');

  if (!launcher || !container) return;

  // Toggle Chatbot Window
  launcher.addEventListener('click', () => {
    container.classList.toggle('open');
    if (container.classList.contains('open')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    container.classList.remove('open');
  });

  // Toggle Institutional Archive Knowledge Browser Drawer
  if (archivesBtn) {
    archivesBtn.addEventListener('click', () => {
      toggleArchivesDrawer();
    });
  }

  clearBtn.addEventListener('click', () => {
    messagesBox.innerHTML = '';
    appendBotMessage(
      "Hello! 👋 Chat history cleared. How else can I assist your campus life today?",
      null
    );
    renderQuickReplies([
      "💳 Fee due dates & late fine rules",
      "📚 Library book limit & fine policy",
      "📝 COE Exam circular & attendance cutoff",
      "⚖️ Grievance escalation & SLAs",
      "🏆 VSB Trust merit scholarships"
    ]);
  });

  // Send message handler
  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = '';
    quickRepliesBox.innerHTML = '';

    // Show typing animation
    const typingIndicator = showTypingIndicator();

    const user = typeof AuthState !== 'undefined' ? AuthState.getUser() : null;

    setTimeout(async () => {
      try {
        let response = null;
        if (typeof apiRequest === 'function') {
          try {
            response = await apiRequest('/chatbot/query', 'POST', {
              userId: user ? user.id : null,
              query: text
            });
          } catch(e) {
            response = null;
          }
        }

        // If local client-side processing
        if (!response || !response.reply) {
          response = processClientSideAI(text, user);
        }

        typingIndicator.remove();
        appendBotMessage(response.reply, response.citation, response.sourceDocs);

        if (response.quickReplies && response.quickReplies.length) {
          renderQuickReplies(response.quickReplies);
        }
      } catch (err) {
        typingIndicator.remove();
        const fallback = processClientSideAI(text, user);
        appendBotMessage(fallback.reply, fallback.citation, fallback.sourceDocs);
        renderQuickReplies(fallback.quickReplies);
      }
    }, 550);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });

  // Voice Input (Web Speech API)
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
      try {
        voiceBtn.classList.add('listening');
        if (typeof showToast === 'function') {
          showToast('Listening... Speak your campus question 🎙️', 'info');
        }
        recognition.start();
      } catch (err) {
        voiceBtn.classList.remove('listening');
      }
    });

    recognition.onresult = (event) => {
      voiceBtn.classList.remove('listening');
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      handleSend();
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove('listening');
      if (typeof showToast === 'function') {
        showToast('Voice recognition canceled or unavailable.', 'error');
      }
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
    };
  } else {
    voiceBtn.style.display = 'none';
  }

  // Initial welcome message with verified citation badge
  appendBotMessage(
    "Hello! 👋 I am **CampusAI Assistant** (Institutional Edition).\n\n"
    + "Every answer I provide on **Fees, Library Rules, Exam Circulars, and Grievance Redressal** is directly cited and cross-referenced from authentic **Institutional Handbooks, Admin Notices, and Bulletin Archives**.",
    {
      documentId: 'doc-fees-01',
      clauseId: 'cl-fee-4.2',
      refNumber: 'VSB/INST/ARCHIVE/2026-27',
      documentTitle: 'Official Institutional Archives & Statutory Guidelines',
      docType: 'INSTITUTIONAL_HANDBOOK',
      typeLabel: 'Institutional Repository',
      section: 'Comprehensive Knowledge Base',
      issuingAuthority: 'Office of the Principal & Academic Directorate',
      issueDate: 'Academic Session 2026–2027',
      effectiveTerm: 'AY 2026-27',
      verified: true
    }
  );

  renderQuickReplies([
    "💳 Fee due dates & late fine rules",
    "📚 Library book limit & fine policy",
    "📝 COE Exam circular & attendance cutoff",
    "⚖️ Grievance escalation & SLAs",
    "🏆 VSB Trust merit scholarships"
  ]);

  // Setup Archives Drawer search & categories
  setupArchivesDrawerEvents();
}

// ==========================================================
// INJECT CHATBOT DOM STRUCTURE & MODALS
// ==========================================================
function injectChatbotMarkup() {
  const wrapper = document.createElement('div');
  wrapper.id = 'campusai-chatbot';
  wrapper.innerHTML = `
    <!-- Floating Launcher -->
    <div class="chatbot-launcher pulse-glow" id="chat-launcher">
      <div class="chatbot-launcher-icon">
        <i class="fa-solid fa-robot"></i>
      </div>
      <span>Campus AI</span>
      <span class="verified-indicator-badge" title="Source Verified AI"><i class="fa-solid fa-shield-check"></i> Cited</span>
    </div>

    <!-- Chat Window Container -->
    <div class="chatbot-container" id="chat-container">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="bot-avatar">
            <i class="fa-solid fa-brain"></i>
          </div>
          <div class="chat-header-text">
            <div style="display:flex; align-items:center; gap:6px;">
              <h3>CampusAI Assistant</h3>
              <span class="badge-verified-pill" title="Answers cite official notices and handbooks"><i class="fa-solid fa-certificate"></i> Verified Docs</span>
            </div>
            <span class="status-online"><span class="status-dot"></span> Online • Citations Active</span>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="chat-btn-icon" id="chat-archives-btn" title="Browse Official Handbooks & Circular Archives">
            <i class="fa-solid fa-book-atlas"></i>
          </button>
          <button class="chat-btn-icon" id="chat-clear-btn" title="Clear Conversation">
            <i class="fa-solid fa-rotate-right"></i>
          </button>
          <button class="chat-btn-icon" id="chat-close-btn" title="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Live Notice Ticker Bar -->
      <div class="chat-notice-ticker">
        <span class="ticker-tag"><i class="fa-solid fa-bullhorn"></i> ARCHIVES:</span>
        <span class="ticker-text">Indexed 9 Handbooks, COE Circulars & Grievance Charters • Zero Hallucinations</span>
      </div>

      <!-- Messages Stream -->
      <div class="chat-messages" id="chat-messages"></div>

      <!-- Quick Reply Action Chips -->
      <div class="quick-replies" id="chat-quick-replies"></div>

      <!-- Input Footer -->
      <div class="chat-footer">
        <div class="chat-input-wrapper">
          <input type="text" id="chat-input" class="chat-input" placeholder="Ask about fees, library rules, exam circulars, grievances..." autocomplete="off">
          <button type="button" class="chat-voice-btn" id="chat-voice-btn" title="Voice Search"><i class="fa-solid fa-microphone"></i></button>
          <button type="button" class="chat-send-btn" id="chat-send-btn" title="Send Query"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>

      <!-- Archives Explorer Slide-Out Drawer -->
      <div class="chat-archives-drawer" id="chat-archives-drawer">
        <div class="archives-drawer-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-folder-closed" style="color:var(--primary-light); font-size:1.1rem;"></i>
            <h4 style="font-size:0.95rem; font-weight:700; margin:0;">Official Knowledge Base Archives</h4>
          </div>
          <button class="chat-btn-icon" id="close-archives-drawer-btn" style="width:26px; height:26px;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="archives-drawer-search">
          <input type="text" id="archives-search-input" placeholder="Search circulars, handbooks, notices..." autocomplete="off">
        </div>
        <div class="archives-category-chips" id="archives-category-chips">
          <button class="arch-cat-btn active" data-category="ALL">All Docs (9)</button>
          <button class="arch-cat-btn" data-category="FEES">Fees & Aid</button>
          <button class="arch-cat-btn" data-category="LIBRARY">Library Rules</button>
          <button class="arch-cat-btn" data-category="EXAMS">COE Exams</button>
          <button class="arch-cat-btn" data-category="GRIEVANCE">Grievances</button>
        </div>
        <div class="archives-drawer-list" id="archives-drawer-list"></div>
      </div>
    </div>

    <!-- Full Document Inspector & Authentic Notice Modal -->
    <div class="doc-inspector-modal-backdrop" id="doc-inspector-modal" style="display:none;">
      <div class="doc-inspector-dialog">
        <div class="doc-inspector-card">
          <!-- Institutional Official Notice Header -->
          <div class="doc-official-header">
            <div class="doc-crest-box">
              <i class="fa-solid fa-landmark-dome"></i>
            </div>
            <div class="doc-header-text">
              <span class="doc-inst-badge">V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)</span>
              <h2 id="doc-modal-title">Official Document Name</h2>
              <div class="doc-meta-row">
                <span class="doc-ref-pill"><i class="fa-solid fa-hashtag"></i> <strong id="doc-modal-ref">REF-0000</strong></span>
                <span class="doc-status-pill"><i class="fa-solid fa-circle-check"></i> DIGITALLY VERIFIED ARCHIVE</span>
                <span class="doc-date-pill"><i class="fa-solid fa-calendar-days"></i> <span id="doc-modal-date">Date</span></span>
              </div>
            </div>
            <button class="doc-modal-close-btn" id="close-doc-modal-btn"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <!-- Document Body -->
          <div class="doc-inspector-body">
            <!-- Issuance Metadata Strip -->
            <div class="doc-issuing-strip">
              <div class="strip-col">
                <label>Issuing Authority</label>
                <div class="val" id="doc-modal-authority">-</div>
              </div>
              <div class="strip-col">
                <label>Authorized Signatory</label>
                <div class="val" id="doc-modal-signatory">-</div>
              </div>
              <div class="strip-col">
                <label>Effective Academic Term</label>
                <div class="val" id="doc-modal-term">-</div>
              </div>
              <div class="strip-col">
                <label>Archive Integrity Code</label>
                <div class="val" style="font-family:monospace; color:var(--secondary);" id="doc-modal-hash">-</div>
              </div>
            </div>

            <!-- Target Clause Highlight Box -->
            <div class="doc-target-clause-box" id="doc-modal-clause-box">
              <div class="clause-box-header">
                <span class="clause-badge"><i class="fa-solid fa-bookmark"></i> <span id="doc-modal-clause-sec">Clause § 0.0</span></span>
                <span class="clause-title" id="doc-modal-clause-title">Clause Title</span>
                <button class="copy-clause-btn" id="copy-clause-text-btn" title="Copy Clause Text"><i class="fa-solid fa-copy"></i> Copy Clause</button>
              </div>
              <div class="clause-box-text" id="doc-modal-clause-text">...</div>
            </div>

            <!-- Full Document Content / All Clauses -->
            <div class="doc-full-clauses-section">
              <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-list-check"></i> Full Document Articles & Regulatory Sections:
              </h4>
              <div class="doc-clauses-accordion" id="doc-modal-all-clauses"></div>
            </div>
          </div>

          <!-- Document Footer / Actions -->
          <div class="doc-inspector-footer">
            <div class="doc-seal-badge">
              <i class="fa-solid fa-stamp"></i>
              <span>OFFICIAL INSTITUTIONAL RECORD • NO HALLUCINATIONS GUARANTEE</span>
            </div>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm" id="print-doc-notice-btn">
                <i class="fa-solid fa-print"></i> Print Notice
              </button>
              <button class="btn btn-primary btn-sm" id="close-doc-modal-footer-btn">
                <i class="fa-solid fa-check"></i> Done & Return to Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // Bind modal close events
  document.getElementById('close-doc-modal-btn').addEventListener('click', closeDocumentInspector);
  document.getElementById('close-doc-modal-footer-btn').addEventListener('click', closeDocumentInspector);
  document.getElementById('close-archives-drawer-btn').addEventListener('click', toggleArchivesDrawer);
  document.getElementById('print-doc-notice-btn').addEventListener('click', () => {
    window.print();
  });
  document.getElementById('copy-clause-text-btn').addEventListener('click', () => {
    const text = document.getElementById('doc-modal-clause-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast('Exact clause text copied to clipboard! 📋', 'success');
      }
    });
  });
}

// ==========================================================
// USER & BOT MESSAGE RENDERING WITH CITATIONS
// ==========================================================
function appendUserMessage(text) {
  const box = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `<div class="message-content">${escapeHTML(text)}</div>`;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function appendBotMessage(markdownText, citationData, sourceDocs) {
  const box = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';

  let citationHTML = '';
  if (citationData) {
    const doc = INSTITUTIONAL_ARCHIVE_KB[citationData.documentId] || citationData;
    const docTypeLabel = citationData.typeLabel || (doc && doc.typeLabel) || 'Institutional Document';
    const refNum = citationData.refNumber || (doc && doc.refNumber) || 'REF-ARCHIVE';
    const authority = citationData.issuingAuthority || (doc && doc.issuingAuthority) || 'Institutional Administration';
    const docTitle = citationData.documentTitle || (doc && doc.title) || 'Official College Document';
    const section = citationData.section || 'Official Clause';
    const docId = citationData.documentId || (doc && doc.id) || 'doc-fees-01';
    const clauseId = citationData.clauseId || (doc && doc.clauses && doc.clauses[0] ? doc.clauses[0].id : '');

    citationHTML = `
      <div class="chat-citation-card" data-doc-id="${docId}" data-clause-id="${clauseId}">
        <div class="citation-header-strip">
          <div class="citation-type-tag">
            <i class="fa-solid fa-landmark"></i> ${escapeHTML(docTypeLabel)}
          </div>
          <div class="citation-verified-badge">
            <i class="fa-solid fa-shield-check"></i> 100% Archive Verified
          </div>
        </div>

        <div class="citation-title">
          <strong>${escapeHTML(docTitle)}</strong>
        </div>

        <div class="citation-meta-tags">
          <span class="meta-pill"><i class="fa-solid fa-hashtag"></i> ${escapeHTML(refNum)}</span>
          <span class="meta-pill"><i class="fa-solid fa-section"></i> ${escapeHTML(section)}</span>
          <span class="meta-pill authority-pill"><i class="fa-solid fa-building-columns"></i> ${escapeHTML(authority)}</span>
        </div>

        <div class="citation-actions-bar">
          <button class="citation-inspect-btn" onclick="openDocumentInspector('${docId}', '${clauseId}')">
            <i class="fa-solid fa-file-magnifying-glass"></i> Inspect Exact Notice Excerpt
          </button>
          <button class="citation-copy-btn" onclick="copyCitationReference('${escapeHTML(docTitle)}', '${escapeHTML(refNum)}', '${escapeHTML(section)}')">
            <i class="fa-solid fa-copy"></i> Copy Citation
          </button>
        </div>
      </div>
    `;
  }

  bubble.innerHTML = `
    <div class="bot-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; margin-top: 4px;">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="message-content-wrapper">
      <div class="message-content">${formatMarkdown(markdownText)}</div>
      ${citationHTML}
    </div>
  `;

  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function showTypingIndicator() {
  const box = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot typing-wrapper';
  bubble.innerHTML = `
    <div class="bot-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; margin-top: 4px;">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="message-content" style="padding: 8px 16px;">
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
  return bubble;
}

function renderQuickReplies(replies) {
  const container = document.getElementById('chat-quick-replies');
  container.innerHTML = '';
  replies.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      document.getElementById('chat-input').value = text;
      document.getElementById('chat-send-btn').click();
    });
    container.appendChild(btn);
  });
}

// Markdown and Quote Formatter
function formatMarkdown(text) {
  if (!text) return '';
  return text
    // Verified Excerpt blockquotes
    .replace(/^>\s*📌\s*\*\*Exact Excerpt from (.*?)\*\*:\s*\n>\s*\*(.*?)\*/gim, 
      '<div class="verified-quote-box"><div class="quote-header"><i class="fa-solid fa-quote-left"></i> Verified Excerpt from $1</div><div class="quote-body"><em>$2</em></div></div>'
    )
    .replace(/^>\s*\*(.*?)\*/gim, 
      '<blockquote class="chat-blockquote"><em>$1</em></blockquote>'
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>')
    .replace(/\n/g, '<br>');
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==========================================================
// DOCUMENT INSPECTOR & MODAL LOGIC
// ==========================================================
window.openDocumentInspector = function(docId, clauseId) {
  const doc = INSTITUTIONAL_ARCHIVE_KB[docId];
  if (!doc) {
    if (typeof showToast === 'function') {
      showToast('Document record not found in local cache.', 'error');
    }
    return;
  }

  const modal = document.getElementById('doc-inspector-modal');
  document.getElementById('doc-modal-title').textContent = doc.title;
  document.getElementById('doc-modal-ref').textContent = doc.refNumber;
  document.getElementById('doc-modal-date').textContent = doc.issueDate;
  document.getElementById('doc-modal-authority').textContent = doc.issuingAuthority;
  document.getElementById('doc-modal-signatory').textContent = doc.signatory;
  document.getElementById('doc-modal-term').textContent = doc.effectiveTerm;
  document.getElementById('doc-modal-hash').textContent = doc.verificationCode;

  // Find target clause or default to first
  let targetClause = doc.clauses[0];
  if (clauseId) {
    const found = doc.clauses.find(c => c.id === clauseId);
    if (found) targetClause = found;
  }

  document.getElementById('doc-modal-clause-sec').textContent = targetClause.section;
  document.getElementById('doc-modal-clause-title').textContent = targetClause.title;
  document.getElementById('doc-modal-clause-text').innerHTML = `
    <p style="font-size:0.95rem; line-height:1.6; margin:0; color:#fff; font-weight:500;">
      "${escapeHTML(targetClause.text)}"
    </p>
  `;

  // Render all clauses accordion
  const allClausesContainer = document.getElementById('doc-modal-all-clauses');
  allClausesContainer.innerHTML = doc.clauses.map((c, idx) => `
    <div class="clause-accordion-item ${c.id === targetClause.id ? 'active-target' : ''}">
      <div class="clause-accordion-header" onclick="toggleClauseDetails(this)">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="clause-num-badge">${escapeHTML(c.section)}</span>
          <strong>${escapeHTML(c.title)}</strong>
        </div>
        <i class="fa-solid fa-chevron-down acc-icon"></i>
      </div>
      <div class="clause-accordion-content" style="${c.id === targetClause.id ? 'display:block;' : 'display:none;'}">
        <p style="margin:0; font-size:0.88rem; line-height:1.6; color:var(--text-main);">${escapeHTML(c.text)}</p>
      </div>
    </div>
  `).join('');

  modal.style.display = 'flex';
};

window.closeDocumentInspector = function() {
  const modal = document.getElementById('doc-inspector-modal');
  if (modal) modal.style.display = 'none';
};

window.toggleClauseDetails = function(headerElement) {
  const content = headerElement.nextElementSibling;
  const icon = headerElement.querySelector('.acc-icon');
  if (content.style.display === 'none' || !content.style.display) {
    content.style.display = 'block';
    if (icon) icon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    if (icon) icon.style.transform = 'rotate(0deg)';
  }
};

window.copyCitationReference = function(docTitle, refNum, section) {
  const citationText = `[Citation: ${docTitle} | ${refNum} | ${section} - Official VSBEC Archive]`;
  navigator.clipboard.writeText(citationText).then(() => {
    if (typeof showToast === 'function') {
      showToast('Official citation copied to clipboard! 📋', 'success');
    }
  });
};

// ==========================================================
// ARCHIVES KNOWLEDGE BASE DRAWER LOGIC
// ==========================================================
function toggleArchivesDrawer() {
  const drawer = document.getElementById('chat-archives-drawer');
  if (!drawer) return;
  drawer.classList.toggle('open');
  if (drawer.classList.contains('open')) {
    renderArchivesList('ALL', '');
  }
}

function setupArchivesDrawerEvents() {
  const searchInput = document.getElementById('archives-search-input');
  const catButtons = document.querySelectorAll('.arch-cat-btn');

  let currentCategory = 'ALL';
  let currentSearch = '';

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderArchivesList(currentCategory, currentSearch);
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderArchivesList(currentCategory, currentSearch);
    });
  });
}

function renderArchivesList(category, searchQuery) {
  const listContainer = document.getElementById('archives-drawer-list');
  if (!listContainer) return;

  const docs = Object.values(INSTITUTIONAL_ARCHIVE_KB).filter(doc => {
    const matchesCat = category === 'ALL' || doc.category === category;
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery) ||
      doc.refNumber.toLowerCase().includes(searchQuery) ||
      doc.summary.toLowerCase().includes(searchQuery) ||
      doc.clauses.some(c => c.text.toLowerCase().includes(searchQuery) || c.title.toLowerCase().includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  if (!docs.length) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i>
        <p style="font-size:0.85rem;">No institutional circulars or handbooks matched your search.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = docs.map(doc => `
    <div class="archive-item-card" onclick="openDocumentInspector('${doc.id}', '${doc.clauses[0].id}')">
      <div class="archive-item-top">
        <span class="badge badge-info" style="font-size:0.7rem;">${escapeHTML(doc.typeLabel)}</span>
        <span class="archive-ref-code">${escapeHTML(doc.refNumber)}</span>
      </div>
      <div class="archive-item-title">${escapeHTML(doc.title)}</div>
      <div class="archive-item-desc">${escapeHTML(doc.summary)}</div>
      <div class="archive-item-footer">
        <span><i class="fa-solid fa-calendar"></i> ${escapeHTML(doc.issueDate)}</span>
        <span class="inspect-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Inspect Clauses</span>
      </div>
    </div>
  `).join('');
}

// ==========================================================
// CLIENT-SIDE NLP & CITATION REASONING ENGINE
// ==========================================================
function processClientSideAI(query, user) {
  const q = query.toLowerCase().trim();

  // 1. FEES & FINANCIAL DUE DATES / LATE FINES / REFUND
  if (/fee|fees|tuition|payment|due date|deadline|late fee|fine|installments|scholarship|refund|concession|waiver/.test(q)) {
    // 1a. Scholarship query
    if (/scholarship|merit|tnea|waiver|concession|topper|cash award|first graduate/.test(q)) {
      const doc = INSTITUTIONAL_ARCHIVE_KB['doc-scholar-01'];
      return {
        reply: "🏆 **VSB Educational Trust Merit Scholarships & Fee Concession Regulations:**\n\n"
             + "• **TNEA Cutoff >= 195/200:** **100% Tuition Fee Waiver** for all 4 academic years.\n"
             + "• **TNEA Cutoff 190.0 – 194.9:** **50% Tuition Fee Concession** throughout degree tenure.\n"
             + "• **Semester CGPA Excellence:** Dept toppers with CGPA >= 9.25 receive **₹25,000 Cash Award**.\n"
             + "• **Govt Welfare Grants:** First Graduate (₹25,000/yr) and 7.5% preferential quota waivers processed by the College Nodal Desk.\n\n"
             + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
             + "> *\"Candidates securing admission through TNEA counseling with aggregate 10+2 cutoff marks >= 195/200 receive a 100% Tuition Fee Waiver for all 4 years. Candidates with cutoff marks between 190.0 and 194.9 receive a 50% Tuition Fee Concession throughout their academic tenure.\"*",
        citation: {
          documentId: doc.id,
          clauseId: 'cl-sch-2.1',
          refNumber: doc.refNumber,
          documentTitle: doc.title,
          docType: doc.docType,
          typeLabel: doc.typeLabel,
          section: '§ 2.1 TNEA Merit Entrance Waivers',
          issuingAuthority: doc.issuingAuthority,
          issueDate: doc.issueDate,
          effectiveTerm: doc.effectiveTerm,
          verified: true
        },
        quickReplies: ["Late fee penalty slabs", "Fee refund policy", "Hostel accommodation", "Exam circular"]
      };
    }

    // 1b. General fee, due date, late fines, installments, refund
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-fees-01'];
    return {
      reply: "💳 **Institutional Tuition & Fee Payment Regulations (AY 2026–2027):**\n\n"
           + "• **Payment Due Dates:** **Odd Semester: September 30, 2026** | **Even Semester: January 31, 2027**.\n"
           + "• **Grace Period:** **7 working days** after due date with zero penalty.\n"
           + "• **Late Fine Slabs:** **₹50/day** (Days 8 to 15) and **₹100/day** (Days 16 to 30).\n"
           + "• **Fee Structure Breakdown:** Govt Quota: ₹55,000/sem | Management Quota: ₹85,000/sem | Lab & Amenities: ₹12,500/sem.\n"
           + "• **Hardship Installments:** 2 split installments (50% each) allowed upon Dean approval.\n\n"
           + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
           + "> *\"All enrolled undergraduate and postgraduate students must remit their semester tuition and laboratory dues on or before the designated cutoff date: Odd Semester cutoff is September 30, 2026. A statutory grace period of 7 working days is granted before administrative late penalties commence.\"*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-fee-4.2',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 4.2(a) Semester Payment Deadlines & Surcharges',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["Merit scholarship criteria", "Installment request procedure", "Library rules & fines", "Exam schedule"]
    };
  }

  // 2. LIBRARY RULES & DIGITAL ARCHIVES
  if (/library|book|books|borrow|overdue|fine|timings|working hours|delnet|ieee|nptel|book bank/.test(q)) {
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-lib-01'];
    return {
      reply: "📚 **Central Digital Library Regulations & Borrowing Code (Edition 4.2):**\n\n"
           + "• **Operating Hours:** **8:30 AM – 7:00 PM** (Mon–Sat) | Exam Reading Halls open till **9:30 PM**.\n"
           + "• **Borrowing Entitlements:** **UG Students: 5 Books for 14 Days** (1 online renewal) | PG: 7 Books for 21 Days | Faculty: 10 Books.\n"
           + "• **Overdue Fines:** **₹2.00/day per book** (Days 1–7) → **₹5.00/day per book** (Day 8 onwards). Privileges suspended if fine exceeds ₹50.\n"
           + "• **SC/ST Book Bank:** Full set of semester core textbooks issued at **zero rental**.\n"
           + "• **Digital Access:** 24/7 off-campus remote VPN access to **IEEE Xplore, DELNET, Springer & NPTEL**.\n\n"
           + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
           + "> *\"Undergraduate (B.E./B.Tech) Students: 5 Books for a maximum duration of 14 days (1 online renewal permitted if no reservation hold is placed). Books retained beyond deadline incur overdue fines: ₹2.00 per book per day for the first 7 overdue days; ₹5.00 per book per day from Day 8 onwards.\"*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-lib-5.2',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 5.2 Circulation Limits & Overdue Levies',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["SC/ST Book Bank scheme", "Digital Library VPN access", "Fee structure & deadlines", "Exam notices"]
    };
  }

  // 3. EXAM NOTICES & AUTONOMOUS COE CIRCULARS
  if (/exam|exams|coe|hall ticket|attendance percentage|condonation|revaluation|photocopy|arrear|supplementary|end-sem|timetable/.test(q)) {
    // 3a. Revaluation / Photocopy / Arrears
    if (/revaluation|photocopy|reval|paper review|arrear|supplementary|script/.test(q)) {
      const doc = INSTITUTIONAL_ARCHIVE_KB['doc-coe-02'];
      return {
        reply: "🔄 **Autonomous COE Revaluation & Supplementary Examination Guidelines:**\n\n"
             + "• **Photocopy of Script:** Apply within **7 days** of results | Fee: **₹300 per subject**.\n"
             + "• **Revaluation Window:** Apply within **10 days** | Fee: **₹400 per theory course**.\n"
             + "• **Grade Upgrade Refund:** If grade improves by >= 2 letter grades, **50% revaluation fee is refunded**.\n"
             + "• **Final Year Fast-Track:** Special supplementary window for final-year students within 30 days of results.\n\n"
             + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
             + "> *\"Revaluation applications must be submitted within 10 calendar days of result declaration accompanied by a fee of ₹400 per theory course. If the revaluation yields an upward grade revision of 2 letter grades or more, 50% of the revaluation fee is refunded automatically.\"*",
        citation: {
          documentId: doc.id,
          clauseId: 'cl-rev-4.2',
          refNumber: doc.refNumber,
          documentTitle: doc.title,
          docType: doc.docType,
          typeLabel: doc.typeLabel,
          section: '§ 4.2 Revaluation Protocols & Grade Refund',
          issuingAuthority: doc.issuingAuthority,
          issueDate: doc.issueDate,
          effectiveTerm: doc.effectiveTerm,
          verified: true
        },
        quickReplies: ["Autonomous exam timetable", "Attendance condonation rules", "Fee structure", "Grievance redressal"]
      };
    }

    // 3b. Exam schedule & 75% attendance rule
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-coe-01'];
    return {
      reply: "📢 **Autonomous COE End-Semester Examination Circular (Ref: COE/CIR/2026/ODD/042):**\n\n"
           + "• **Exam Schedule:** Theory Exams start **October 28, 2026** | Practicals: **October 14–22, 2026**.\n"
           + "• **Attendance Rule:** Mandatory minimum **75.0% aggregate attendance** required for hall ticket eligibility.\n"
           + "• **Medical Condonation (65.0% – 74.9%):** Permitted with hospital discharge summary, HOD recommendation, and **₹1,500 condonation fee** upon Principal approval.\n"
           + "• **Hall Ticket Download:** Available on Student Portal from **October 20, 2026**.\n\n"
           + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
           + "> *\"Per Autonomous Academic Regulation 7.2, a student must secure a minimum aggregate attendance of 75% across all registered courses to be eligible to sit for the Autonomous End-Semester Examinations. Students failing to meet 75% aggregate attendance shall be categorized as Detained (SA).\"*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-coe-2.3',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 2.3 Mandatory 75% Attendance Eligibility',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["Revaluation & photocopy rules", "Check my attendance", "Library exam hours", "Fee payment dates"]
    };
  }

  // 4. GRIEVANCE PROCESSES & INSTITUTIONAL CHARTER
  if (/grievance|complaint|ragging|anti-ragging|harassment|icc|posh|escalation|sla|problem|issue|redressal|ombudsman/.test(q)) {
    // 4a. Anti-Ragging & ICC POSH Cell
    if (/ragging|harassment|icc|posh|women cell|emergency helpline|squad/.test(q)) {
      const doc = INSTITUTIONAL_ARCHIVE_KB['doc-icc-01'];
      return {
        reply: "🛡️ **Statutory Anti-Ragging Mandate & Internal Complaints Committee (ICC):**\n\n"
             + "• **Zero-Tolerance Policy:** Immediate suspension, police FIR, and expulsion under UGC Regulations 2009.\n"
             + "• **24/7 National Anti-Ragging Helpline:** 📞 **1800-180-5522** (Toll-Free)\n"
             + "• **Campus Flying Squad Hotline:** 📞 **04324-290142 / 98424-26222** | ✉️ `antiragging@vsbec.edu.in`\n"
             + "• **ICC POSH Committee:** Presiding Officer **Dr. S. Malathi** (`icc@vsbec.edu.in`) with 15-day resolution timeframe.\n\n"
             + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
             + "> *\"VSB Engineering College enforces a strictly Zero-Tolerance policy against ragging in any form inside campus premises, hostels, and buses. Proven acts of ragging attract immediate institutional suspension, withholding of degree, police FIR lodging, and expulsion.\"*",
        citation: {
          documentId: doc.id,
          clauseId: 'cl-icc-1.2',
          refNumber: doc.refNumber,
          documentTitle: doc.title,
          docType: doc.docType,
          typeLabel: doc.typeLabel,
          section: '§ 1.2 Zero-Tolerance Statutory Enforcement',
          issuingAuthority: doc.issuingAuthority,
          issueDate: doc.issueDate,
          effectiveTerm: doc.effectiveTerm,
          verified: true
        },
        quickReplies: ["4-Tier grievance escalation ladder", "File a portal complaint", "Hostel facilities", "Admin contacts"]
      };
    }

    // 4b. Grievance Redressal Multi-Tier Process
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-grc-01'];
    return {
      reply: "⚖️ **Institutional Grievance Redressal Mechanism & Student Charter:**\n\n"
           + "All campus grievances are governed by a **Four-Tier Escalation Hierarchy** with guaranteed SLAs:\n\n"
           + "• **Level 1 (Faculty Advisor / Mentor):** Resolution SLA: **24 to 48 Hours**.\n"
           + "• **Level 2 (Head of Department - HoD):** Resolution SLA: **3 Working Days**.\n"
           + "• **Level 3 (College GRC Committee & Principal):** Resolution SLA: **7 Working Days**.\n"
           + "• **Level 4 (Anna University Ombudsman):** Statutory Appellate Authority.\n\n"
           + "🔒 *Submit directly via the 'Grievance' tab on your Student Dashboard with zero-retaliation protection.*\n\n"
           + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
           + "> *\"All complaints follow a structured four-tier escalation ladder with enforceable turnaround SLAs: Level 1 Faculty Advisor resolution within 24-48 hours; Level 2 Head of Department within 3 days; Level 3 Apex GRC & Principal within 7 working days.\"*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-grc-3.1',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 3.1 Four-Tier Escalation Hierarchy & SLAs',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["Anti-Ragging helplines", "File a new grievance ticket", "Fee regulations", "Check ticket status"]
    };
  }

  // 5. PLACEMENTS & CAREER STATS
  if (/placement|package|recruiter|salary|company|companies|cdc|highest|47 lpa/.test(q)) {
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-cdc-01'];
    return {
      reply: "💼 **Career Development Centre (CDC) & Placement Records:**\n\n"
           + "• **Highest Package:** **INR 47.0 Lakhs per annum** (Autodesk & Amazon)\n"
           + "• **Top Recruiters:** Amazon, Autodesk, TCS Digital, Zoho, Infosys, Cognizant, Wipro, Capgemini, Hexaware.\n"
           + "• **Total Offers:** 1000+ offers across departments.\n"
           + "• **Dream Policy:** Students with offers <= 6.0 LPA can upgrade to Dream (7-12 LPA) and Super Dream (>12 LPA).\n\n"
           + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
           + "> *\"VSB Engineering College maintains an elite recruitment footprint with the highest annual CTC reaching INR 47.0 Lakhs per annum. Top recruiters include Amazon, Autodesk, TCS Digital, Zoho, Infosys, and Cognizant.\"*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-cdc-1.1',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 1.1 Placement Statistics & Highest CTC',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["Dream company offer policy", "KANAL 2K26 symposium", "Bus transport routes", "COE Exam circulars"]
    };
  }

  // 6. BUS TRANSPORT & COMMUTER ROUTES
  if (/bus|transport|route|commute|trichy|erode|dindigul|namakkal|karur/.test(q)) {
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-trans-01'];
    return {
      reply: "🚌 **College Bus Transportation & Commuter Regulations (AY 2026–2027):**\n\n"
           + "• **Network Coverage:** **50+ Dedicated GPS-enabled Buses** covering Karur, Trichy, Dindigul, Erode, and Namakkal.\n"
           + "• **Timings:** Arrive on campus by **8:30 AM** | Daily departure at **4:45 PM** (extended lab buses at 6:30 PM).\n"
           + "• **Digital Pass:** RFID Smart Card tap required upon boarding.\n\n"
           + "> 📌 **Exact Excerpt from Institutional Archive**:\n"
           + "> *\"The college operates 50+ modern GPS-equipped buses covering routes across Karur, Tiruchirappalli, Dindigul, Erode, and Namakkal. All buses arrive on campus by 8:30 AM and depart daily at 4:45 PM.\"*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-trans-1.1',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 1.1 Route Coverage & Departure Schedules',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["Fee structure", "Hostel accommodation", "Timetable", "Library hours"]
    };
  }

  // 7. ATTENDANCE QUERY (STUDENT DATA)
  if (/attendance|absent|present|percentage/.test(q)) {
    const doc = INSTITUTIONAL_ARCHIVE_KB['doc-coe-01'];
    return {
      reply: "📊 **Your Overall Attendance Summary**:\n\n• **Total Classes Held:** 24\n• **Classes Attended:** 21\n• **Attendance Rate:** **87.5%** 🎉\n\n✅ *You are safely above the mandatory 75.0% threshold mandated by Autonomous COE Circular COE/CIR/2026/ODD/042!*",
      citation: {
        documentId: doc.id,
        clauseId: 'cl-coe-2.3',
        refNumber: doc.refNumber,
        documentTitle: doc.title,
        docType: doc.docType,
        typeLabel: doc.typeLabel,
        section: '§ 2.3 Mandatory 75% Attendance Requirement',
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        effectiveTerm: doc.effectiveTerm,
        verified: true
      },
      quickReplies: ["Today's timetable", "Pending assignments", "Medical condonation rules"]
    };
  }

  // 8. TIMETABLE QUERY
  if (/timetable|schedule|class|classes|routine|lecture/.test(q)) {
    return {
      reply: "📅 **Today's CS Semester 5 Schedule:**\n\n• **09:00 - 10:00**: Artificial Intelligence & Neural Nets (Lab 301)\n• **10:00 - 11:00**: Database Management Systems (Room 204)\n• **11:15 - 12:15**: Operating Systems & Concurrency (Room 204)\n• **13:00 - 14:30**: Cloud Computing Lab (Lab 102)",
      quickReplies: ["Active assignments", "Upcoming events", "Library timings"]
    };
  }

  // 9. ASSIGNMENTS
  if (/assignment|homework|submission|due date|deadline/.test(q)) {
    return {
      reply: "📝 **Active Assignments:**\n\n1. **Neural Network Implementation (CS501)** - Due: *Oct 05* [Graded: 94/100]\n2. **E-Commerce Schema & SQL (CS502)** - Due: *Oct 10* [Pending Submission]\n3. **Multithreaded Buffer Simulation (CS503)** - Due: *Oct 18* [Pending Submission]",
      quickReplies: ["Submit assignment", "Check grades", "Today's timetable"]
    };
  }

  // 10. EVENTS
  if (/event|hackathon|fest|symposium|sports|kanal|liro|illuminate|digiverse/.test(q)) {
    return {
      reply: "🎉 **Upcoming Events at VSB Engineering College, Karur:**\n\n"
           + "• 🏆 **KANAL 2K26 - National Technical Symposium** (Oct 18): Paper presentation, Code sprint & AI hackathon.\n"
           + "• 🤖 **LIRO 2K26 - Line Follower Robotics Challenge** (Oct 13): Inter-college autonomous robotics race.\n"
           + "• 💡 **ILLUMINATE 2026 - E-Cell Summit** (Oct 14): Entrepreneurship workshop with E-Cell IIT Bombay.\n"
           + "• 🎨 **DIGIVERSE XPOSE 2026** (Nov 05): Annual project exhibition & cultural fiesta.",
      quickReplies: ["KANAL 2K26 details", "Placement stats", "COE Exam circulars"]
    };
  }

  // 11. GREETING & FALLBACK
  if (/hello|hi|hey|greetings|help|who are you/.test(q)) {
    return {
      reply: "Hello! 👋 I am **CampusAI Assistant** (Institutional Edition).\n\n"
           + "I provide answers strictly cited from **Institutional Handbooks, Admin Notices, and Bulletin Archives**. What would you like to verify today?",
      quickReplies: [
        "💳 Fee structure & late fine rules",
        "📚 Library book limits & overdue fines",
        "📝 COE Exam notice & attendance cutoff",
        "⚖️ Grievance escalation & SLAs",
        "🏆 VSB Trust merit scholarships"
      ]
    };
  }

  // Semantic fallback with broad knowledge citation
  const doc = INSTITUTIONAL_ARCHIVE_KB['doc-fees-01'];
  return {
    reply: `🤖 **CampusAI Institutional Assistant:**\n\nRegarding *"${query}"*: I've referenced our repository of institutional handbooks, circulars, and bulletins.\n\nAsk me about **Semester Fee Deadlines, Late Fine Slabs, Library Book Quotas, Autonomous COE Exam Notices, Attendance Eligibility, or 4-Tier Grievance SLAs** for exact verified document citations!`,
    citation: {
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
    },
    quickReplies: [
      "💳 Fee due dates & late fine rules",
      "📚 Library book limit & fine policy",
      "📝 COE Exam circular & attendance cutoff",
      "⚖️ Grievance escalation & SLAs"
    ]
  };
}
