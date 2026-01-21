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
- **Progress Tracking** - Session history, skill trends, and personal best
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
   git clone https://github.com/mpalmer79/pharma-rep-trainer.git
   cd pharma-rep-trainer
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment variables**
```bash
   cp .env.example .env.local
```
   
   Edit `.env.local` and add your keys:
```env
   # Anthropic API
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL editor:
```bash
   # The schema is located at:
   supabase/schema.sql
```

5. **Start the development server**
```bash
   npm run dev
```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure
```
pharma-rep-trainer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts           # AI conversation endpoint
│   │   │   └── score/route.ts          # AI evaluation endpoint
│   │   ├── auth/
│   │   │   ├── callback/page.tsx       # OAuth callback handler
│   │   │   ├── login/page.tsx          # Sign in page
│   │   │   ├── signup/page.tsx         # Registration page
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/page.tsx          # User dashboard
│   │   ├── profile/page.tsx            # Profile settings
│   │   ├── settings/page.tsx           # App settings
│   │   ├── training-library/page.tsx   # Objection handling reference
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Main application
│   │
│   ├── components/
│   │   ├── landing/                    # Landing page sections
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PlatformSection.tsx
│   │   │   ├── TrainingProgramsSection.tsx
│   │   │   ├── SimulatorSection.tsx
│   │   │   ├── RolesSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   ├── ui/
│   │   │   ├── RadarChart.tsx          # Score visualization
│   │   │   ├── AnimatedSection.tsx     # Scroll animations
│   │   │   └── index.ts
│   │   ├── FeedbackStage.tsx           # Results & coaching
│   │   ├── ManagerDashboard.tsx        # Team analytics (demo)
│   │   ├── MobileTrainingScreen.tsx    # Chat interface
│   │   ├── ProgressDashboard.tsx       # Personal stats
│   │   ├── SessionDetailModal.tsx      # Session replay
│   │   ├── UserMenu.tsx                # Auth dropdown
│   │   └── Providers.tsx               # Context providers
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx             # Supabase auth state
│   │
│   ├── data/
│   │   ├── drugs.ts                    # Product definitions
│   │   ├── personas.ts                 # Physician personas + prompts
│   │   └── mockTeamData.ts             # Manager dashboard mock data
│   │
│   ├── hooks/
│   │   ├── useSessionHistory.ts        # Local session persistence
│   │   ├── useSupabaseSession.ts       # Cloud session persistence
│   │   ├── useHybridSession.ts         # Combined local + cloud
│   │   └── useScrollAnimation.ts       # Intersection observer
│   │
│   ├── lib/
│   │   └── supabase.ts                 # Supabase client config
│   │
│   └── types/
│       ├── index.ts                    # Core TypeScript interfaces
│       └── database.ts                 # Supabase schema types
│
├── supabase/
│   └── schema.sql                      # Database schema
│
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔌 API Documentation

### POST `/api/chat`

Generates physician responses during training sessions.

**Request Body:**
```json
{
  "personaId": "rush",
  "drugId": "cardiostat",
  "messages": [
    { "role": "user", "content": "Hi Dr. Chen, I'm here to discuss CardioStat..." }
  ],
  "timeRemaining": 75
}
```

**Response:**
```json
{
  "message": "*glances at watch* Okay, but make it quick. What's the data?",
  "endConversation": false
}
```

### POST `/api/score`

Evaluates completed training sessions and generates coaching feedback.

**Request Body:**
```json
{
  "personaId": "rush",
  "drugId": "cardiostat",
  "messages": [...]
}
```

**Response:**
```json
{
  "scores": {
    "opening": 85,
    "clinicalKnowledge": 72,
    "objectionHandling": 78,
    "timeManagement": 90,
    "compliance": 95,
    "closing": 70
  },
  "overall": 82,
  "strengths": [
    "Strong, concise opening that respected the physician's time",
    "Maintained compliant messaging throughout"
  ],
  "improvements": [
    "Include more specific clinical data",
    "End with a clear next step or call to action"
  ],
  "tips": "With time-pressed physicians, lead with your single strongest differentiator."
}
```

---

## 🗄️ Database Schema (Supabase)

### Tables

**profiles**
- User profile data linked to Supabase Auth
- Stores display name, avatar, role, organization

**training_sessions**
- Complete session records with conversation history
- Feedback scores and coaching data
- Duration and timestamp tracking

### Row Level Security

All tables implement RLS policies ensuring users can only access their own data. Team/organization features use role-based access controls.

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the schema SQL in the SQL Editor:
   - Copy contents of `supabase/schema.sql`
   - Execute in Supabase SQL Editor

3. Configure Auth:
   - Enable Email provider in Authentication settings
   - Set Site URL to your deployment URL
   - Add redirect URLs for auth callbacks

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Core training simulation
- [x] Five physician personas
- [x] Five therapeutic products
- [x] AI-powered conversations
- [x] Six-dimension scoring
- [x] Coaching feedback
- [x] Radar chart visualization
- [x] Framer Motion animations

### Phase 2: User Experience ✅
- [x] User authentication (Supabase)
- [x] Session history persistence
- [x] Progress tracking over time
- [x] Personal progress dashboard
- [x] Timer customization
- [x] Quick practice mode
- [x] Training library / objection bank
- [x] Mobile-responsive design

### Phase 3: Team Features ✅ (Demo)
- [x] Manager dashboard (mock data demo)
- [x] Team leaderboards
- [x] Individual rep analytics
- [x] Performance by product/persona
- [x] Certification tracking display

### Phase 4: Enterprise (Planned)
- [ ] Real team data with Supabase
- [ ] Training assignment system
- [ ] Custom product upload
- [ ] Custom persona builder
- [ ] Multi-call scenarios (follow-up visits)
- [ ] Compliance certification tracks
- [ ] SSO integration
- [ ] LMS integration (SCORM)
- [ ] Custom branding
- [ ] API for third-party integration

### Phase 5: Advanced (Future)
- [ ] Voice input/output mode
- [ ] Video avatar responses
- [ ] AI-generated coaching videos
- [ ] Peer comparison analytics
- [ ] Gamification & achievements

---

## 💼 Use Cases

### New Rep Onboarding
Accelerate time-to-productivity by letting new hires practice hundreds of calls before going live.

### Product Launch Training
Prepare your team for new product launches with scenario-based practice.

### Compliance Reinforcement
Ensure reps stay within approved messaging through realistic practice scenarios.

### Skills Assessment
Evaluate rep competencies objectively with standardized AI scoring.

### Continuous Improvement
Let experienced reps sharpen their skills and try new approaches.

### Manager Oversight
Track team progress, identify skill gaps, and target coaching efforts.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes locally before submitting
- Maintain mobile responsiveness

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Authentication & Database by [Supabase](https://supabase.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Charts by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support & Licensing

For questions or issues:
- Open an issue on GitHub
- Connect on LinkedIn

---

## 👨‍💻 About the Developer

**Michael Palmer** — AI Deployment & Solutions Specialist | Product Manager

Currently leading AI innovation at Quirk Auto Dealers, one of New England's largest automotive dealership networks. Specializing in building AI-powered solutions that solve real business problems.

<a href="https://www.linkedin.com/in/mpalmer1234/" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
</a>
<a href="https://github.com/mpalmer79" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
</a>

### Other Projects
- **QUIRK AI Kiosk** - AI-powered automotive showroom experience
- **Quirk Trade Tool** - Multi-source vehicle valuation platform
- **DriveDecision** - Buy vs. lease calculator

---

**Interested in licensing this platform for your organization?**

<a href="https://www.linkedin.com/in/mpalmer1234/" target="_blank">
  <img src="https://img.shields.io/badge/Contact_for_Licensing-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Contact for Licensing" />
</a>

---

<p align="center">
  <strong>Built for pharmaceutical sales excellence.</strong>
  <br>
  <sub>Powered by Claude AI • Secured by Supabase • Deployed on Vercel</sub>
</p>
