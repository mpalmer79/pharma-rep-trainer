# PharmaRep Trainer

**AI-Powered Pharmaceutical Sales Simulation Platform**

Practice and perfect your pharmaceutical sales skills with realistic AI physician simulations. Get instant feedback, track your progress, and master the art of the detail.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## Overview

PharmaRep Trainer is an AI-powered training simulator that helps pharmaceutical sales representatives practice physician interactions in a risk-free environment. Using Claude AI, the platform creates realistic physician personas that respond dynamically to your sales approach, then provides detailed coaching feedback to help you improve.

### The Problem

- New pharma reps take 6-12 months to become proficient
- Live physician time is expensive and limited (average detail is under 2 minutes)
- Traditional role-play with managers lacks realism and scalability
- Compliance training is often disconnected from real-world scenarios

### The Solution

PharmaRep Trainer provides:
- **Realistic AI Physicians** - Five distinct personas with authentic behaviors, objections, and communication styles
- **Real-Time Pressure** - Timed scenarios that simulate the urgency of actual physician encounters
- **Instant Coaching** - AI-powered evaluation across six key competency areas
- **Safe Practice Environment** - Make mistakes and learn without real-world consequences

---

## Features

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

### 📊 Six-Dimension Scoring

1. **Opening** - Did you respect their time and establish relevance quickly?
2. **Clinical Knowledge** - Did you use specific data and speak credibly?
3. **Objection Handling** - Did you address concerns effectively?
4. **Time Management** - Were your responses appropriately concise?
5. **Compliance** - Did you avoid unsupported claims?
6. **Closing** - Did you establish clear next steps?

### 🎯 Additional Features

- Real-time countdown timer creating authentic pressure
- Dynamic AI responses that adapt to your approach
- Detailed post-session coaching with actionable tips
- Persona-specific advice based on physician type
- Fallback scoring when offline

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **AI Engine** | Claude API (Anthropic) |
| **Icons** | Lucide React |
| **Deployment** | Vercel (recommended) |

---

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pharma-rep-trainer.git
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
   
   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
pharma-rep-trainer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts        # Conversation endpoint
│   │   │   └── score/
│   │   │       └── route.ts        # Evaluation endpoint
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Main application
│   │
│   ├── components/
│   │   ├── Header.tsx              # App header with timer
│   │   ├── SetupScreen.tsx         # Drug/persona selection
│   │   ├── TrainingScreen.tsx      # Chat interface
│   │   ├── FeedbackScreen.tsx      # Results and coaching
│   │   └── index.ts                # Component exports
│   │
│   ├── data/
│   │   ├── drugs.ts                # Product definitions
│   │   └── personas.ts             # Physician personas + prompts
│   │
│   └── types/
│       └── index.ts                # TypeScript interfaces
│
├── .env.example                    # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## API Documentation

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
  "messages": [
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ]
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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. Add environment variables:
   - Go to Project Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` with your API key

4. Deploy

### Netlify

1. Push your code to GitHub

2. Connect to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Import your repository

3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

4. Add environment variables in Site Settings

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## Configuration

### Adding New Drugs

Edit `src/data/drugs.ts`:

```typescript
{
  id: 'newdrug',
  name: 'NewDrug Pro',
  category: 'Therapeutic Area',
  indication: 'Primary Indication',
  keyData: 'Key clinical trial results and differentiators',
  competitorName: 'Competitor Product',
  mechanismOfAction: 'How the drug works',
}
```

### Adding New Personas

Edit `src/data/personas.ts`:

```typescript
{
  id: 'newpersona',
  name: 'Dr. New Persona',
  title: 'Persona Description',
  description: 'Brief challenge description',
  avatar: '👨‍⚕️',
  timerSeconds: 120,
  difficulty: 'medium',
  systemPrompt: `Detailed persona instructions for Claude...`,
}
```

### Adjusting Scoring

The scoring logic lives in `src/app/api/score/route.ts`. You can:
- Modify score weights
- Add new evaluation criteria
- Adjust the Claude evaluation prompt
- Customize fallback scoring algorithms

---

## Roadmap

### Phase 1: MVP (Current)
- [x] Core training simulation
- [x] Five physician personas
- [x] Five therapeutic products
- [x] AI-powered conversations
- [x] Six-dimension scoring
- [x] Coaching feedback

### Phase 2: Analytics
- [ ] User authentication
- [ ] Session history persistence
- [ ] Progress tracking over time
- [ ] Performance analytics dashboard

### Phase 3: Team Features
- [ ] Manager dashboard
- [ ] Team leaderboards
- [ ] Cohort comparisons
- [ ] Training assignment system

### Phase 4: Advanced Training
- [ ] Custom product upload
- [ ] Custom persona builder
- [ ] Multi-call scenarios (follow-up visits)
- [ ] Compliance certification tracks
- [ ] Video/audio mode

### Phase 5: Enterprise
- [ ] SSO integration
- [ ] LMS integration (SCORM)
- [ ] Custom branding
- [ ] API for third-party integration

---

## Use Cases

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

---

## Contributing

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

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## Support

For questions or issues:
- Open an issue on GitHub

---

## Licensing & Contact

Interested in licensing this platform for your organization?

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mpalmer1234/)

**Michael Palmer** — AI Deployment & Solutions Specialist

[![Contact on LinkedIn](https://img.shields.io/badge/Contact_for_Licensing-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mpalmer1234/?msgOverlay=true)

---

**Built for pharmaceutical sales excellence.**
