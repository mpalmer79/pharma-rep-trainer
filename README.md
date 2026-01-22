# PharmaRep Trainer  
**Explainable, Adaptive AI Training for Regulated Sales Teams**

<a href="https://www.linkedin.com/in/mpalmer1234/" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/LinkedIn-Michael%20Palmer-blue?logo=linkedin&logoColor=white" alt="LinkedIn Profile"/>
</a>

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E)
![AI Powered](https://img.shields.io/badge/AI-Explainable%20Coaching-orange)
![Compliance Ready](https://img.shields.io/badge/Compliance-Audit%20Ready-success)

🔗 **Live Demo** | 📚 **Training Library**

---

## Overview

PharmaRep Trainer is an AI-powered sales training and coaching platform designed for pharmaceutical and life sciences organizations operating in regulated environments.

Unlike traditional role-play simulators, PharmaRep Trainer delivers explainable coaching intelligence, adaptive training journeys, and compliance-ready audit artifacts that support onboarding, continuous improvement, and managerial oversight.

This repository demonstrates a production-grade architecture for AI-assisted training systems where trust, transparency, and accountability are required.

---

## Key Capabilities

### Explainable Coaching Intelligence

Every coaching outcome is deterministic, evidence-backed, human-readable, and auditable.

The system provides transcript-linked feedback tied to specific utterances, clear reasoning for each coaching recommendation, defined skill dimensions, and zero black-box decision making.

---

### Adaptive Training Journeys

Training paths automatically adjust based on observed performance patterns.

Improving skills unlock higher-difficulty scenarios.  
Plateauing skills trigger targeted reinforcement.  
Declining skills downgrade difficulty to reinforce fundamentals.  

All journey adjustments include explicit reasoning.

---

### Session Comparison and Pattern Detection

The platform tracks progression across sessions to detect consistent improvement, skill plateaus, and performance decline.

This enables objective progress measurement and early identification of coaching needs.

---

### Manager Coaching and Oversight

Managers receive actionable insight without reviewing raw transcripts.

Features include team-level pattern rollups, at-risk rep detection, drill-down by sales rep views, risk classification, coaching focus recommendations, and adaptive journey reassignment visibility.

---

### Compliance and Audit Readiness

PharmaRep Trainer is built for regulated environments.

Supported outputs include immutable session audit reports, evidence-linked feedback records, exportable coaching summaries in PDF format, email delivery for QA and HR, and CRM webhook integration.

All outputs are deterministic and reviewable.

---

## System Architecture (High Level)

Training Flow:
AI-driven role-play session  
Transcript capture  
Explainable feedback generation  
Session comparison  
Cross-session pattern detection  
Journey reassignment  
Manager insights and exports  

Enterprise Outputs:
Coaching summaries  
Audit reports  
PDF exports  
Email delivery  
Various CRM webhooks  

---

## Technology Stack

Frontend: React, Next.js (App Router), TypeScript  
Styling and Motion: Tailwind CSS, Framer Motion  
AI Integration: LLM-driven role-play with deterministic orchestration  
Auth and Data: Supabase (Auth and Database)  
Exports: jsPDF  
Integrations: Email delivery and CRM webhooks  
Architecture: Modular, provider-agnostic, audit-friendly  

---

## File Branch Map (Root to Key Paths)

This project is organized to clearly separate UI, domain logic, integrations, and compliance artifacts.

/
README.md – Project overview and positioning  
package.json – Dependencies and scripts  
tsconfig.json – TypeScript configuration  
next.config.js – Next.js configuration  
tailwind.config.js – Tailwind CSS configuration  
postcss.config.js – PostCSS configuration  
public/ – Static assets  

src/
app/
app/api/email/send-coaching-summary/route.ts – Email delivery with PDF attachment  
app/api/crm/send-coaching-summary/route.ts – CRM webhook integration  
app/layout.tsx – Root layout  
app/page.tsx – Entry page  

components/
components/training/TrainingJourney.tsx – Adaptive training journey UI  
components/session/MobileSessionReplay.tsx – Mobile session replay  
components/session/PatternInsights.tsx – Pattern visualization  
components/manager/ManagerInsights.tsx – Team rollups  
components/manager/UserDrilldown.tsx – Per-rep drill-down  
components/compliance/AuditReportView.tsx – Audit report UI  
components/exports/CoachingSummaryView.tsx – Coaching summary preview  

lib/
lib/sessions/patterns.ts – Pattern detection engine  
lib/journeys/recommendation.ts – Journey recommendations  
lib/journeys/reassignment.ts – Skill-based reassignment  
lib/manager/rollups.ts – Manager aggregation logic  
lib/manager/userDrilldown.ts – Drill-down builder  
lib/compliance/auditReport.ts – Audit report builder  
lib/exports/coachingSummary.ts – Coaching summary model  
lib/exports/pdfExport.ts – PDF export (Blob-based)  
lib/email/emailClient.ts – Email abstraction  
lib/crm/webhookClient.ts – CRM webhook client  
lib/haptics.ts – Mobile haptic feedback  

types/ – Shared domain types  
docs/ – Optional diagrams and assets  

---

## Designed For

Pharmaceutical sales organizations  
Medical device companies  
Life sciences onboarding teams  
Compliance-conscious training programs  
AI deployment and enablement demonstrations  

---

This project is structured to support commercialization through enterprise licensing, per-rep SaaS pricing, compliance reporting add-ons, CRM integration packages, manager analytics tiers, and white-label deployments.

<a href="https://www.linkedin.com/in/mpalmer1234/" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin&logoColor=white" alt="LinkedIn Profile"/>
</a>

---

## Disclaimer

This project is a technical and architectural demonstration.  
It is not affiliated with any pharmaceutical company and does not provide medical or regulatory advice.

---

## Project Status

Actively developed.

Feature-complete for explainable coaching, adaptive training, manager oversight, compliance exports, and email and CRM integration.

---

