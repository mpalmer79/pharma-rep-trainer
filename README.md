# PharmaRep Trainer (RepIQ)
**Explainable, Adaptive AI Training for Regulated Sales Teams**

<a href="https://www.linkedin.com/in/michael-palmer-qa/" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/LinkedIn-Michael%20Palmer-blue?logo=linkedin&logoColor=white" alt="LinkedIn Profile"/>
</a>

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E)
![AI Powered](https://img.shields.io/badge/AI-Explainable%20Coaching-orange)
![Compliance Ready](https://img.shields.io/badge/Compliance-Audit%20Ready-success)
![Gamified](https://img.shields.io/badge/🎮-Gamified%20Training-purple)

🔗 **Live Demo** | 📚 **Training Library**

---

## Overview

PharmaRep Trainer is an AI-powered sales training and coaching platform designed for pharmaceutical and life sciences organizations operating in regulated environments.

Unlike traditional role-play simulators, PharmaRep Trainer delivers explainable coaching intelligence, adaptive training journeys, and compliance-ready audit artifacts that support onboarding, continuous improvement, and managerial oversight.

**New in v2.0:** A fully gamified training experience where every response is scored in real-time, time bonuses reward excellence, and reps progress through challenge tiers toward the ultimate goal — winning long-term pharmaceutical partnerships.

This repository demonstrates a production-grade architecture for AI-assisted training systems where trust, transparency, and accountability are required.

---

## 🎮 Can You Beat the Game?

PharmaRep Trainer transforms sales training into an engaging challenge that motivates continuous improvement.

### The Challenge

Every conversation is a test. The AI evaluates your responses in real-time across five dimensions:

| Dimension | What It Measures |
|-----------|------------------|
| **Attention Grabbing** | Did you capture the physician's interest? |
| **Sales Quality** | Professional technique, consultative approach |
| **Accuracy** | Correct product and clinical information |
| **Rapport** | Building relationship with the persona |
| **Overall Impression** | Combined effectiveness |

### Dynamic Timer System

Your performance directly impacts your available time:

| Score | Timer Adjustment | Meaning |
|-------|------------------|---------|
| 8-10 | **+15 seconds** | Excellent — you've earned more time |
| 6-7 | **+8 seconds** | Good — positive impression |
| 5 | 0 seconds | Average — neutral |
| 3-4 | **-5 seconds** | Poor — losing their interest |
| 1-2 | **-10 seconds** | Terrible — wasting their time |

Great responses buy you time. Poor responses cost you. Every second counts.

### The Journey: Newcomer to Champion

Progress through four challenge tiers as you prove your skills:

**Level 1: The Newcomer**
Start with friendly personas who give you time to make your pitch. Focus on building rapport and presenting patient benefits clearly.

**Level 2: The Challenger**  
Face skeptical physicians who demand data and evidence. Know your clinical data cold.

**Level 3: The Expert**  
Navigate gatekeepers and time-pressured situations. This is where bonus time mechanics matter most.

**Level 4: The Champion**  
Master all personas. Win long-term partnerships. Establish trusted relationships between your pharmaceutical company and healthcare providers.

### Unlock System

- Start with easier personas unlocked
- Demonstrate competency to unlock harder challenges
- Track progress across six core skill dimensions
- Advance from Beginner → Intermediate → Advanced → Expert tier

### 🏆 The Ultimate Goal

Your mission isn't survival — it's building lasting partnerships. Master every persona, reach Expert tier, score 85%+ consistently, and prove you have what it takes to win the contract.

---

## Key Capabilities

### Explainable Coaching Intelligence

Every coaching outcome is deterministic, evidence-backed, human-readable, and auditable.

The system provides transcript-linked feedback tied to specific utterances, clear reasoning for each coaching recommendation, defined skill dimensions, and zero black-box decision making.

---

### Real-Time Response Assessment

**New:** The AI evaluates each user response in parallel with generating the persona's reply:

- Five-dimension scoring (1-10 scale)
- Immediate timer adjustment based on performance
- Visual feedback showing time earned or lost
- Brief coaching tips after each exchange
- No added latency — assessment runs in parallel

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
```
AI-driven role-play session
    ↓
Real-time response scoring (5 dimensions)
    ↓
Dynamic timer adjustment
    ↓
Transcript capture
    ↓
Explainable feedback generation
    ↓
Session comparison
    ↓
Cross-session pattern detection
    ↓
Persona unlock evaluation
    ↓
Journey reassignment
    ↓
Manager insights and exports
```

Enterprise Outputs:
- Coaching summaries  
- Audit reports  
- PDF exports  
- Email delivery  
- CRM webhooks  

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Next.js (App Router), TypeScript |
| Styling & Motion | Tailwind CSS, Framer Motion |
| AI Integration | Claude API with parallel scoring, deterministic orchestration |
| Auth & Data | Supabase (Auth and Database) |
| Exports | jsPDF |
| Integrations | Email delivery, CRM webhooks |
| Architecture | Modular, provider-agnostic, audit-friendly |

---

## File Branch Map (Root to Key Paths)

This project is organized to clearly separate UI, domain logic, integrations, and compliance artifacts.

```
/
├── README.md – Project overview and positioning
├── package.json – Dependencies and scripts
├── tsconfig.json – TypeScript configuration
├── next.config.js – Next.js configuration
├── tailwind.config.js – Tailwind CSS configuration
├── postcss.config.js – PostCSS configuration
├── public/ – Static assets

src/
├── app/
│   ├── api/chat/route.ts – AI conversation + real-time scoring
│   ├── api/score/route.ts – End-of-session scoring
│   ├── api/email/send-coaching-summary/route.ts – Email delivery
│   ├── api/crm/send-coaching-summary/route.ts – CRM webhook
│   ├── layout.tsx – Root layout
│   └── page.tsx – Entry page with gamification flow
│
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx – Hero with challenge teaser
│   │   ├── GameJourneySection.tsx – 4-level journey visualization
│   │   ├── StatsBanner.tsx – Gamified challenge stats
│   │   ├── SimulatorSection.tsx – Training launcher
│   │   └── CTASection.tsx – "Win the Game" CTA
│   ├── training/TrainingJourney.tsx – Adaptive journey UI
│   ├── session/MobileTrainingScreen.tsx – Training UI + timer feedback
│   ├── session/PatternInsights.tsx – Pattern visualization
│   ├── manager/ManagerInsights.tsx – Team rollups
│   ├── manager/UserDrilldown.tsx – Per-rep drill-down
│   ├── compliance/AuditReportView.tsx – Audit report UI
│   └── exports/CoachingSummaryView.tsx – Coaching summary preview
│
├── hooks/
│   ├── useProgressionSystem.ts – Unlock and tier logic
│   ├── useCoachingMode.ts – Real-time coaching hints
│   └── useSessionHistory.ts – Session persistence
│
├── lib/
│   ├── sessions/patterns.ts – Pattern detection engine
│   ├── journeys/recommendation.ts – Journey recommendations
│   ├── journeys/reassignment.ts – Skill-based reassignment
│   ├── manager/rollups.ts – Manager aggregation logic
│   ├── compliance/auditReport.ts – Audit report builder
│   ├── exports/pdfExport.ts – PDF export
│   └── crm/webhookClient.ts – CRM webhook client
│
└── types/
    └── index.ts – Shared domain types including ResponseAssessment
```

---

## Gamification Features Summary

| Feature | Description |
|---------|-------------|
| **Real-Time Scoring** | Every response graded on 5 dimensions (1-10 scale) |
| **Dynamic Timer** | +15s to -10s adjustments based on performance |
| **Visual Feedback** | Green/red badges show time earned/lost |
| **Persona Unlocks** | Master easy personas to unlock harder challenges |
| **Progression Tiers** | Beginner → Intermediate → Advanced → Expert |
| **Journey Visualization** | 4-level path from Newcomer to Champion |
| **Ultimate Goal** | Win long-term pharmaceutical partnerships |

---

## Designed For

- Pharmaceutical sales organizations  
- Medical device companies  
- Life sciences onboarding teams  
- Compliance-conscious training programs  
- AI deployment and enablement demonstrations  
- Teams seeking engaging, gamified skill development

---

## Commercialization

This project is structured to support commercialization through:

- Enterprise licensing
- Per-rep SaaS pricing
- Compliance reporting add-ons
- CRM integration packages
- Manager analytics tiers
- White-label deployments
- Gamification feature tiers

<a href="https://www.linkedin.com/in/michael-palmer-qa/" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin&logoColor=white" alt="LinkedIn Profile"/>
</a>

---

## Disclaimer

This project is a technical and architectural demonstration.  
It is not affiliated with any pharmaceutical company and does NOT provide medical or regulatory advice.

---

## Project Status

**Actively developed.**

Feature-complete for:
- ✅ Explainable coaching
- ✅ Adaptive training journeys
- ✅ Manager oversight
- ✅ Compliance exports
- ✅ Email and CRM integration
- ✅ **Gamified training with real-time scoring**
- ✅ **Dynamic timer system**
- ✅ **Persona unlock progression**
- ✅ **Challenge tier advancement**

---

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Add your Anthropic API key to Vercel environment variables
5. Deploy to Vercel or run locally: `npm run dev`

**Note:** The gamification features (real-time scoring, dynamic timer) require a valid Anthropic API key. Without one, the system uses intelligent fallback responses with basic scoring.

---
