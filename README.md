# PharmaRep Trainer

**AI-Powered Pharmaceutical Sales Simulation Platform**

Practice and perfect your pharmaceutical sales skills with realistic AI physician simulations. Get instant feedback, track your progress, and master the art of the detail.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E)
![Claude AI](https://img.shields.io/badge/Claude-AI%20Powered-cc785c)

🔗 **[Live Demo](https://pharma-rep-trainer.vercel.app)** | 📚 **[Training Library](https://pharma-rep-trainer.vercel.app/training-library)**

---

## Overview

PharmaRep Trainer is an AI-powered training simulator that helps pharmaceutical sales representatives practice physician interactions in a risk-free environment. Using Claude AI, the platform creates realistic physician personas that respond dynamically to your sales approach, then provides detailed coaching feedback to help you improve.

### The Problem

- New pharma reps take 6-12 months to become proficient
- Live physician time is expensive and limited (average detail is under 2 minutes)
- Traditional role-play with managers lacks realism and scalability
- Compliance training is often disconnected from real-world scenarios
- Managers lack visibility into rep training progress and skill gaps

### The Solution

PharmaRep Trainer provides:
- **Realistic AI Physicians** - Five distinct personas with authentic behaviors, objections, and communication styles
- **Real-Time Pressure** - Timed scenarios that simulate the urgency of actual physician encounters
- **Instant Coaching** - AI-powered evaluation across six key competency areas with radar chart visualization
- **Safe Practice Environment** - Make mistakes and learn without real-world consequences
- **Progress Tracking** - Session history, skill trends, and personal bests
- **Manager Dashboard** - Team analytics, leaderboards, and performance insights (demo mode)

---

## ✨ Features

### 🎭 Five Physician Personas

| Persona | Challenge Type | Difficulty | Time Limit |
|---------|---------------|------------|------------|
| **Dr. Sarah Chen** | Time-Pressed PCP | Hard | 90 seconds |
| **Dr. Michael Torres** | Data-Driven Skeptic | Hard | 3 minutes |
| **Dr. Patricia Williams** | Competitor Loyalist | Medium | 2.5 minutes |
| **Monica Reynolds** | Office Gatekeeper | Medium | 2 minutes |
| **Dr. James Park** | Early Adopter | Easy | 3 minutes |

### 💊 Five Therapeutic Areas

- **CardioStat** - Cardiovascular (Hypertension)
- **GlucoNorm XR** - Diabetes (Type 2)
- **Immunex Pro** - Immunology (Rheumatoid Arthritis)
- **NeuroCalm** - CNS (Generalized Anxiety Disorder)
- **OncoShield** - Oncology (Non-Small Cell Lung Cancer)

### 📊 Six-Dimension Scoring with Radar Chart

1. **Opening** - Did you respect their time and establish relevance quickly?
2. **Clinical Knowledge** - Did you use specific data and speak credibly?
3. **Objection Handling** - Did you address concerns effectively?
4. **Time Management** - Were your responses appropriately concise?
5. **Compliance** - Did you avoid unsupported claims?
6. **Closing** - Did you establish clear next steps?

### 🔐 Authentication & User Management (Supabase)

- Email/password authentication
- Secure signup with email verification
- Password reset flow
- User profiles with customizable settings
- Session persistence across devices
- Row Level Security (RLS) for data protection

### 📈 Progress Tracking

- **Session History** - Review past training sessions with full conversation replay
- **Skill Breakdown** - Track improvement across all six competency areas
- **Personal Bests** - Celebrate achievements by persona and product
- **Streak Tracking** - Build consistent practice habits
- **Trend Analysis** - See if you're improving, stable, or declining

### 👔 Manager Dashboard (Demo Mode)

Experience enterprise-level team management features:
- **Team Overview** - 10 mock sales reps with realistic performance data
- **Leaderboard** - Ranked performance across the team
- **Individual Analytics** - Deep dive into each rep's strengths and weaknesses
- **Performance by Product** - See which products need more training focus
- **Performance by Persona** - Identify challenging physician types
- **Certification Tracking** - Monitor team credentials and progress

### 📚 Training Library

Comprehensive objection handling reference guide:
- **Price & Cost** objections with proven responses
- **Efficacy & Clinical Data** rebuttals
- **Safety & Side Effects** handling
- **Competition** differentiation strategies
- **Access & Logistics** solutions
- Searchable database with keyword matching
- Copy-to-clipboard functionality

### ⏱️ Flexible Timer Options

- **Default Mode** - Use persona's recommended time limit
- **Custom Mode** - Set your own duration (1-10 minutes)
- **Unlimited Mode** - Practice without time pressure

### 🎲 Quick Practice

One-click "Surprise Me" feature randomly selects a product and persona for spontaneous practice sessions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **AI Engine** | Claude API (Anthropic) |
| **Authentication** | Supabase Auth |
| **Database** | Supabase PostgreSQL |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Supabase project ([Create one here](https://supabase.com/dashboard))

### Installation

1. **Clone the repository**
```bash
