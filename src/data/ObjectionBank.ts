// Objection Bank - Comprehensive prep data for each persona and drug combination

export interface Objection {
  objection: string;
  response: string;
  tip: string;
}

export interface DrugTalkingPoint {
  point: string;
  data: string;
  whenToUse: string;
}

export interface PersonaStrategy {
  doThis: string[];
  avoidThis: string[];
  openingTip: string;
  closingTip: string;
}

export interface ObjectionBankData {
  personaObjections: Record<string, Objection[]>;
  drugTalkingPoints: Record<string, DrugTalkingPoint[]>;
  personaStrategies: Record<string, PersonaStrategy>;
  exampleExchanges: Record<string, { persona: string; drug: string; exchange: { role: string; content: string }[] }[]>;
}

export const objectionBank: ObjectionBankData = {
  // Persona-specific objections and responses
  personaObjections: {
    rush: [
      {
        objection: "I only have 90 seconds, make it quick.",
        response: "Absolutely, Doctor. In one sentence: [Drug] offers [key differentiator] with [main benefit]. Can I leave you with the key study data?",
        tip: "Lead with your single strongest point. Don't try to cover everything."
      },
      {
        objection: "I don't have time for another drug pitch.",
        response: "I respect that. I'm here because [Drug] addresses [specific problem] your patients face. 30 seconds for the headline data?",
        tip: "Acknowledge their time, then pivot to patient benefit."
      },
      {
        objection: "Just leave the samples and go.",
        response: "Of course. Quick note: patients on [competitor] with [specific issue] saw [specific improvement]. Worth a look when you have a moment.",
        tip: "Plant a seed even when being dismissed. Be gracious."
      },
      {
        objection: "What's different from what I'm already prescribing?",
        response: "The key differentiator is [specific advantage]. In the Phase 3 trial, that translated to [concrete outcome].",
        tip: "Have your differentiator ready as a single, memorable sentence."
      },
    ],
    skeptic: [
      {
        objection: "What's the absolute risk reduction, not just relative?",
        response: "Great question. The ARR was [X]%, which gives us an NNT of [Y]. The trial population was [description].",
        tip: "Know your numbers cold. Skeptics test your credibility with specifics."
      },
      {
        objection: "I've read the trial. The control arm was suboptimal.",
        response: "You're right to note that. The comparator was [X], which was standard at the time. Post-hoc analysis against [Y] showed [result].",
        tip: "Don't be defensive. Acknowledge limitations and pivot to additional data."
      },
      {
        objection: "What about the patients who dropped out of the study?",
        response: "Dropout rate was [X]%. ITT analysis showed [result]. The main reasons for discontinuation were [reasons], mostly in the first [timeframe].",
        tip: "Knowing dropout data shows you've actually read the study."
      },
      {
        objection: "This sounds like marketing spin. Give me real data.",
        response: "Fair enough. Let me give you the numbers directly: [specific efficacy], [specific safety], [specific endpoint]. The full data is in [journal/study name].",
        tip: "Strip away adjectives. Lead with raw numbers when facing skepticism."
      },
    ],
    loyalist: [
      {
        objection: "I've been using [competitor] for years. My patients do fine.",
        response: "That makes sense for most patients. I'm specifically thinking about those who [specific limitation of competitor]. Have you seen patients with [specific issue]?",
        tip: "Don't attack their current choice. Find the gaps."
      },
      {
        objection: "Why would I switch and risk destabilizing my patients?",
        response: "For stable patients, I agree—don't fix what isn't broken. But for new starts or patients with [specific issue], [Drug] offers [specific advantage].",
        tip: "Position for new patients, not switching stable ones."
      },
      {
        objection: "The last 'breakthrough' drug I tried didn't live up to the hype.",
        response: "I hear that a lot. What specifically disappointed you? I want to make sure [Drug] actually addresses a real need you're seeing.",
        tip: "Ask about their past experience. It reveals what they actually need."
      },
      {
        objection: "Prior auths are a nightmare for new drugs.",
        response: "Understandable concern. [Drug] has [coverage status]. We also have [support program] that handles PA for your office.",
        tip: "Be ready with access and coverage information."
      },
    ],
    gatekeeper: [
      {
        objection: "The doctors are very busy. Leave your card.",
        response: "Of course. Before I go—which physicians here see the most [condition] patients? I have some clinical data that might be relevant to their practice.",
        tip: "Show you understand their role. Ask questions that demonstrate value."
      },
      {
        objection: "We have a policy about pharmaceutical reps.",
        response: "I completely respect that. Is there a process for sharing clinical updates? We have new data on [specific outcome] that might interest Dr. [Name].",
        tip: "Work within their system, not around it."
      },
      {
        objection: "You'll need to schedule an appointment.",
        response: "I'd be happy to. When does Dr. [Name] typically have time for clinical updates? I'm flexible and won't take more than 10 minutes.",
        tip: "Be specific about your time ask. Vague requests get rejected."
      },
      {
        objection: "What makes this worth the doctor's time?",
        response: "Fair question. [Drug] just showed [specific result] in [patient type]. If the practice sees those patients, it's worth 5 minutes.",
        tip: "Give Monica a reason to advocate for you internally."
      },
    ],
    curious: [
      {
        objection: "How does this work at the molecular level?",
        response: "[Drug] works by [mechanism]. What's unique is [specific binding/action]. This translates clinically to [patient benefit].",
        tip: "Know your MOA deeply. Curious physicians appreciate scientific detail."
      },
      {
        objection: "Where does this fit in my treatment algorithm?",
        response: "Based on the data, ideal positioning is [first/second/third line]. It's particularly suited after [scenario] or when [specific situation].",
        tip: "Help them think through practical implementation."
      },
      {
        objection: "What's the real-world experience so far?",
        response: "Post-marketing data from [X] patients shows [findings]. The main thing prescribers report is [real-world observation].",
        tip: "Bridge trial data to real-world practice."
      },
      {
        objection: "Who's the ideal patient for this?",
        response: "The sweet spot is [patient profile]: [characteristics]. The trial showed the best response in [subgroup].",
        tip: "Paint a clear picture of the target patient."
      },
    ],
  },

  // Drug-specific talking points
  drugTalkingPoints: {
    cardiostat: [
      {
        point: "Superior BP reduction",
        data: "23% greater BP reduction vs. ACE inhibitors in Phase 3",
        whenToUse: "When discussing efficacy with any physician"
      },
      {
        point: "Tolerability advantage",
        data: "40% fewer instances of dry cough compared to ACE inhibitors",
        whenToUse: "For patients who discontinued ACE inhibitors due to cough"
      },
      {
        point: "Dual mechanism",
        data: "Novel calcium channel blocker + endothelin receptor antagonism",
        whenToUse: "When speaking with curious/scientific physicians"
      },
      {
        point: "Once-daily dosing",
        data: "24-hour BP control with single morning dose",
        whenToUse: "When discussing patient adherence"
      },
    ],
    gluconorm: [
      {
        point: "Strong A1C reduction",
        data: "1.4% A1C reduction at 12 weeks",
        whenToUse: "Lead with this for efficacy-focused discussions"
      },
      {
        point: "Weight neutral",
        data: "No weight gain in clinical trials, unlike sulfonylureas",
        whenToUse: "For patients concerned about weight"
      },
      {
        point: "GI tolerability",
        data: "Lower GI side effects than metformin in head-to-head",
        whenToUse: "For patients who struggled with metformin"
      },
      {
        point: "Convenient dosing",
        data: "Once-daily, no titration required",
        whenToUse: "When discussing patient compliance"
      },
    ],
    immunex: [
      {
        point: "High ACR50 response",
        data: "62% ACR50 response at week 24",
        whenToUse: "Lead with efficacy data"
      },
      {
        point: "Extended dosing interval",
        data: "Every 2 weeks vs. weekly for some competitors",
        whenToUse: "When patient convenience is a priority"
      },
      {
        point: "Auto-injector design",
        data: "Simplified self-injection with auto-injector",
        whenToUse: "For patients with dexterity concerns"
      },
      {
        point: "Novel IL-6 mechanism",
        data: "IL-6 inhibitor with modified Fc for longer half-life",
        whenToUse: "When discussing mechanism with scientific physicians"
      },
    ],
    neurocalm: [
      {
        point: "Significant symptom reduction",
        data: "HAM-A reduction of 12.4 points vs. 8.2 for placebo",
        whenToUse: "Lead with efficacy"
      },
      {
        point: "Low discontinuation",
        data: "Discontinuation rate well below class average",
        whenToUse: "When tolerability is a concern"
      },
      {
        point: "Dual mechanism",
        data: "SSRI + 5-HT1A partial agonism for faster onset",
        whenToUse: "For physicians interested in mechanism"
      },
      {
        point: "Onset of action",
        data: "Significant improvement seen as early as week 2",
        whenToUse: "When patients need faster relief"
      },
    ],
    oncoshield: [
      {
        point: "PFS advantage",
        data: "Median PFS 18.9 months vs. 10.2 months standard of care",
        whenToUse: "Lead with survival data"
      },
      {
        point: "Manageable safety",
        data: "Adverse event profile consistent with class, no new signals",
        whenToUse: "When safety is a concern"
      },
      {
        point: "Novel MOA",
        data: "PD-L1 inhibition + tumor microenvironment modulation",
        whenToUse: "For oncologists interested in mechanism"
      },
      {
        point: "Combination potential",
        data: "Studies ongoing with chemo and other IO agents",
        whenToUse: "When discussing treatment sequencing"
      },
    ],
  },

  // Persona-specific strategies
  personaStrategies: {
    rush: {
      doThis: [
        "Lead with your single strongest differentiator",
        "Use numbers, not adjectives",
        "Offer to leave materials for later review",
        "Be ready to deliver your message in 30 seconds",
        "Respect their time cues"
      ],
      avoidThis: [
        "Extended small talk",
        "Covering multiple talking points",
        "Ignoring their time pressure",
        "Reading from materials",
        "Asking open-ended questions"
      ],
      openingTip: "Skip pleasantries. Open with: 'I know you're pressed for time. One key point about [Drug]...'",
      closingTip: "Close with: 'I'll leave the data. For patients with [specific issue], it's worth a look.'"
    },
    skeptic: {
      doThis: [
        "Know your clinical data cold",
        "Acknowledge study limitations proactively",
        "Use absolute numbers, not just relative",
        "Admit when you don't know something",
        "Reference the primary literature"
      ],
      avoidThis: [
        "Marketing language and superlatives",
        "Bluffing when you don't know",
        "Getting defensive about criticism",
        "Cherry-picking data",
        "Oversimplifying complex findings"
      ],
      openingTip: "Open with data, not benefits: 'The Phase 3 showed [specific endpoint] with [specific numbers].'",
      closingTip: "Close with intellectual honesty: 'The data supports [specific use]. Happy to discuss the full dataset.'"
    },
    loyalist: {
      doThis: [
        "Acknowledge their current success",
        "Find the gaps in their current therapy",
        "Position for new patients, not switches",
        "Identify specific patient populations",
        "Address access/coverage proactively"
      ],
      avoidThis: [
        "Criticizing their current choice",
        "Pushing to switch stable patients",
        "Ignoring their experience",
        "Overpromising outcomes",
        "Being pushy about samples"
      ],
      openingTip: "Open with validation: 'I know [competitor] works well for most patients. I'm here about the ones where it doesn't.'",
      closingTip: "Close with a specific scenario: 'Next time you see a patient with [issue], consider [Drug].'"
    },
    gatekeeper: {
      doThis: [
        "Treat them as a professional, not an obstacle",
        "Ask about the practice's needs",
        "Offer value beyond just seeing the doctor",
        "Be specific about your time ask",
        "Follow their process"
      ],
      avoidThis: [
        "Trying to go around them",
        "Being dismissive or impatient",
        "Vague requests for 'a few minutes'",
        "Name-dropping or power plays",
        "Pushing when they say no"
      ],
      openingTip: "Open with respect: 'Hi, I'm [Name] with [Company]. I know you manage the schedule here—what's the best way to share some clinical updates?'",
      closingTip: "Close by making them an ally: 'Thanks for your help. Is there anything the practice needs that I can help with?'"
    },
    curious: {
      doThis: [
        "Go deep on mechanism of action",
        "Discuss clinical positioning thoughtfully",
        "Share real-world experience",
        "Engage scientifically",
        "Help them identify ideal patients"
      ],
      avoidThis: [
        "Surface-level talking points only",
        "Rushing through the conversation",
        "Avoiding scientific questions",
        "Being unprepared for deep dives",
        "Treating them like other personas"
      ],
      openingTip: "Open with science: 'You'll appreciate the mechanism here—it's a [mechanism] with [unique aspect].'",
      closingTip: "Close with engagement: 'I'd love to hear how it works for your patients. Can I follow up in a few weeks?'"
    },
  },

  // Example exchanges showing "what good looks like"
  exampleExchanges: {
    rush: [
      {
        persona: "rush",
        drug: "cardiostat",
        exchange: [
          { role: "assistant", content: "I have about 90 seconds before my next patient. What do you have for me?" },
          { role: "user", content: "I'll be quick. CardioStat showed 23% better BP reduction than ACE inhibitors with 40% less cough. For your patients who stopped lisinopril due to cough—worth considering." },
          { role: "assistant", content: "*glances at watch* That's a real problem I see. What's the coverage situation?" },
          { role: "user", content: "Tier 2 on most plans, and we have a copay card. I'll leave the formulary guide with samples." },
          { role: "assistant", content: "Fine, leave it. I'll look at it between patients." },
        ]
      }
    ],
    skeptic: [
      {
        persona: "skeptic",
        drug: "gluconorm",
        exchange: [
          { role: "assistant", content: "What's the data look like for this medication?" },
          { role: "user", content: "Phase 3 showed 1.4% A1C reduction at 12 weeks. The ARR versus placebo was 1.1%, NNT of about 8 for clinically meaningful A1C improvement." },
          { role: "assistant", content: "*raises eyebrow* What was the comparator? Active or placebo?" },
          { role: "user", content: "The primary endpoint was placebo-controlled, but there's a head-to-head with metformin showing non-inferiority on A1C with significantly better GI tolerability." },
          { role: "assistant", content: "That's more useful. What were the dropout rates?" },
          { role: "user", content: "8.2% in the treatment arm, mostly in the first 4 weeks, primarily GI-related. Lower than the metformin comparator arm at 12.1%." },
        ]
      }
    ],
    loyalist: [
      {
        persona: "loyalist",
        drug: "immunex",
        exchange: [
          { role: "assistant", content: "I've been using Humira for years and my patients do well on it." },
          { role: "user", content: "Humira's a great drug—I'm not here to argue with success. I'm thinking specifically about patients who haven't hit their goals on it, or new starts where the 2-week dosing might matter." },
          { role: "assistant", content: "What do you mean, 2-week dosing?" },
          { role: "user", content: "Immunex Pro is every 2 weeks versus weekly. For patients with adherence challenges or needle fatigue, it can make a difference. Same efficacy bar—62% ACR50." },
          { role: "assistant", content: "I do have a few patients who struggle with the weekly injections..." },
        ]
      }
    ],
  },
};

// Helper functions
export const getObjectionsForPersona = (personaId: string): Objection[] => {
  return objectionBank.personaObjections[personaId] || [];
};

export const getTalkingPointsForDrug = (drugId: string): DrugTalkingPoint[] => {
  return objectionBank.drugTalkingPoints[drugId] || [];
};

export const getStrategyForPersona = (personaId: string): PersonaStrategy | null => {
  return objectionBank.personaStrategies[personaId] || null;
};

export const getExampleExchange = (personaId: string): { persona: string; drug: string; exchange: { role: string; content: string }[] } | null => {
  const examples = objectionBank.exampleExchanges[personaId];
  return examples ? examples[0] : null;
};
