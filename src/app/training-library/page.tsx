'use client';

import { useState, useMemo } from 'react';

interface Objection {
  id: string;
  objection: string;
  response: string;
  tips: string[];
  keywords: string[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  objections: Objection[];
}

const trainingLibrary: Category[] = [
  {
    id: 'price-cost',
    name: 'Price & Cost',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    description: 'Objections related to medication pricing, insurance coverage, and budget constraints.',
    objections: [
      {
        id: 'pc-1',
        objection: "Your medication is too expensive compared to generics.",
        response: "I understand cost is a significant factor. While [Drug] has a higher acquisition cost, studies show it reduces hospitalizations by X%, which translates to substantial downstream savings. Additionally, we have a comprehensive patient assistance program that can reduce out-of-pocket costs by up to 80% for eligible patients. May I share the total cost-of-care data with you?",
        tips: [
          "Always pivot from price to value",
          "Have specific cost-savings data ready",
          "Know your patient assistance programs inside and out",
          "Quantify the cost of treatment failure"
        ],
        keywords: ['expensive', 'cost', 'price', 'generic', 'budget', 'afford']
      },
      {
        id: 'pc-2',
        objection: "My patients can't afford the copay.",
        response: "That's a concern I hear often, and we've worked hard to address it. Our copay assistance card can bring the patient's cost down to as low as $X per month. For patients without commercial insurance, our patient assistance foundation provides medication at no cost for qualifying individuals. I can leave materials that explain the enrollment process—it takes less than 5 minutes.",
        tips: [
          "Lead with the solution, not the problem",
          "Have copay cards and PAP information readily available",
          "Offer to help staff understand the enrollment process",
          "Follow up to ensure patients received assistance"
        ],
        keywords: ['copay', 'afford', 'assistance', 'patient cost', 'out of pocket']
      },
      {
        id: 'pc-3',
        objection: "The insurance companies won't cover it.",
        response: "I understand formulary access can be challenging. Currently, [Drug] is covered on X% of commercial plans in this region. For plans requiring prior authorization, our team provides dedicated support with a 92% approval rate. We also have a bridge program that provides free medication while PA is pending. Would it help if I provided a formulary lookup tool for your staff?",
        tips: [
          "Know the local formulary landscape",
          "Offer PA support and resources",
          "Mention bridge programs to eliminate coverage gaps",
          "Position yourself as a resource, not just a salesperson"
        ],
        keywords: ['insurance', 'coverage', 'formulary', 'prior authorization', 'PA', 'covered']
      }
    ]
  },
  {
    id: 'efficacy-clinical',
    name: 'Efficacy & Clinical Data',
    image: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800&q=80',
    description: 'Objections about clinical effectiveness, trial data, and real-world outcomes.',
    objections: [
      {
        id: 'ec-1',
        objection: "I haven't seen enough data to convince me it works better.",
        response: "I appreciate your commitment to evidence-based medicine. The LANDMARK trial, published in [Journal], demonstrated a X% improvement in the primary endpoint versus standard of care (p<0.001). Additionally, real-world data from over 50,000 patients confirms these findings translate outside the clinical trial setting. Would you like me to send you the full publication and the real-world evidence summary?",
        tips: [
          "Know your pivotal trials cold",
          "Always cite the source (journal, date)",
          "Bridge clinical trial data to real-world evidence",
          "Offer to provide the actual publications"
        ],
        keywords: ['data', 'evidence', 'study', 'trial', 'works', 'effective', 'proof']
      },
      {
        id: 'ec-2',
        objection: "The trial population doesn't match my patients.",
        response: "That's an excellent point about external validity. While the pivotal trial had specific inclusion criteria, we now have subgroup analyses and real-world data across diverse populations. Specifically, data shows consistent efficacy in patients over 75, those with renal impairment, and patients with multiple comorbidities. Which patient population would be most relevant for your practice?",
        tips: [
          "Acknowledge the limitation honestly",
          "Pivot to subgroup analyses and real-world data",
          "Ask about their specific patient population",
          "Tailor your response to their practice"
        ],
        keywords: ['patients', 'population', 'trial', 'real world', 'elderly', 'comorbidities']
      },
      {
        id: 'ec-3',
        objection: "I want to wait for more long-term data.",
        response: "I understand the desire for long-term outcomes data. We now have X-year follow-up data from the extension study showing sustained efficacy and no new safety signals. Additionally, post-marketing surveillance from over 2 million patient-years of exposure confirms the long-term safety profile. Given that your patients with [condition] face progressive disease, would the current evidence support a trial in appropriate patients while we continue to gather data?",
        tips: [
          "Respect their caution while providing available data",
          "Cite extension studies and post-marketing data",
          "Gently remind them of the cost of inaction for patients",
          "Suggest a limited trial in appropriate patients"
        ],
        keywords: ['long-term', 'wait', 'more data', 'years', 'duration', 'sustained']
      },
      {
        id: 'ec-4',
        objection: "Head-to-head trials show your competitor performs similarly.",
        response: "You're right that the head-to-head data shows similar primary endpoint results. However, there are important differentiators to consider: [Drug] showed superior results in [secondary endpoint], has a more convenient dosing schedule, and demonstrated better tolerability with X% fewer discontinuations due to adverse events. For which patients might these differences matter most in your practice?",
        tips: [
          "Don't argue against valid data",
          "Pivot to differentiating factors",
          "Focus on secondary endpoints, dosing, tolerability",
          "Ask about specific patient scenarios"
        ],
        keywords: ['head-to-head', 'competitor', 'similar', 'compare', 'versus', 'same']
      }
    ]
  },
  {
    id: 'safety-side-effects',
    name: 'Safety & Side Effects',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
    description: 'Concerns about adverse events, contraindications, and patient safety.',
    objections: [
      {
        id: 'ss-1',
        objection: "I'm concerned about the side effect profile.",
        response: "Patient safety is paramount, and I appreciate your diligence. In clinical trials, the most common adverse events were [X, Y, Z], occurring in X% of patients and typically mild to moderate. Importantly, discontinuation rates due to adverse events were only X%, similar to placebo. The safety profile has been consistent across 3 years of real-world use. Which specific side effects are you most concerned about?",
        tips: [
          "Never minimize safety concerns",
          "Quantify adverse event rates with context",
          "Compare to placebo and standard of care",
          "Ask specifically what concerns them"
        ],
        keywords: ['side effect', 'safety', 'adverse', 'risk', 'dangerous', 'harm']
      },
      {
        id: 'ss-2',
        objection: "I had a patient who experienced [adverse event] on this medication.",
        response: "I'm sorry to hear about your patient's experience. While [adverse event] can occur in approximately X% of patients, there are strategies that may help. [Specific mitigation strategy]. Would it be helpful to discuss how other physicians in the area have successfully managed this, or should I connect you with our medical affairs team for a more detailed discussion?",
        tips: [
          "Express genuine empathy",
          "Acknowledge the adverse event is real",
          "Provide specific mitigation strategies",
          "Offer medical affairs support for complex cases"
        ],
        keywords: ['patient', 'experienced', 'happened', 'reaction', 'problem']
      },
      {
        id: 'ss-3',
        objection: "The black box warning concerns me.",
        response: "I understand—black box warnings warrant careful attention. The warning for [Drug] relates to [specific situation], which occurred in [X%] of a specific patient subset. The label provides clear guidance on appropriate patient selection and monitoring. In properly selected patients with [criteria], the benefit-risk profile remains favorable. Would it help to review the specific patient selection criteria together?",
        tips: [
          "Take black box warnings seriously",
          "Explain the specific context of the warning",
          "Emphasize proper patient selection",
          "Review monitoring requirements"
        ],
        keywords: ['black box', 'warning', 'FDA', 'label', 'serious', 'risk']
      },
      {
        id: 'ss-4',
        objection: "What about drug-drug interactions?",
        response: "Great question—polypharmacy is a real consideration. [Drug] is metabolized via [pathway] and has [minimal/moderate] interaction potential. The key interactions to be aware of are [X, Y, Z]. For patients on [common medications], no dose adjustment is needed. I have a drug interaction reference card that your staff might find useful. Would that be helpful?",
        tips: [
          "Know the metabolic pathway",
          "Be specific about significant interactions",
          "Provide practical resources",
          "Address common co-medications in their specialty"
        ],
        keywords: ['interaction', 'drug-drug', 'combination', 'taking', 'medications', 'polypharmacy']
      }
    ]
  },
  {
    id: 'time-access',
    name: 'Time & Access',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
    description: 'Objections about limited time, busy schedules, and access constraints.',
    objections: [
      {
        id: 'ta-1',
        objection: "I only have 2 minutes.",
        response: "I respect your time completely. In 60 seconds: [Drug] is indicated for [condition], demonstrated X% improvement versus standard of care in the [TRIAL] study, and has a patient assistance program covering most patients. I'll leave this summary card with the key points. When might be a better time for a fuller conversation?",
        tips: [
          "Respect their time constraint absolutely",
          "Have a 60-second elevator pitch ready",
          "Leave something tangible",
          "Always ask for a better time"
        ],
        keywords: ['time', 'busy', 'minutes', 'quick', 'hurry', 'short']
      },
      {
        id: 'ta-2',
        objection: "I don't see reps anymore.",
        response: "I understand many physicians have limited their rep interactions. I'm not here to take your time—I'm here to be a resource. If there's ever a question about dosing, a patient assistance issue, or you need samples for an uninsured patient, I want to be available. May I leave my card and perhaps check in quarterly with any updates that might impact your patients?",
        tips: [
          "Respect their policy",
          "Reposition yourself as a resource, not a salesperson",
          "Offer specific value (samples, PA help, answers)",
          "Request minimal, infrequent contact"
        ],
        keywords: ['see reps', 'no reps', 'policy', 'appointment', 'access']
      },
      {
        id: 'ta-3',
        objection: "Just leave your information with the front desk.",
        response: "Absolutely, I'm happy to do that. Before I go, is there any specific information that would be most useful—perhaps the dosing guide, the patient savings card, or the clinical summary? And if questions come up, what's the best way for your staff to reach me?",
        tips: [
          "Comply graciously",
          "Try to leave the most relevant materials",
          "Build relationship with office staff",
          "Make yourself easy to contact"
        ],
        keywords: ['leave', 'front desk', 'materials', 'information', 'drop off']
      }
    ]
  },
  {
    id: 'loyalty-habits',
    name: 'Prescribing Habits & Loyalty',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    description: 'Resistance based on established prescribing patterns and competitor loyalty.',
    objections: [
      {
        id: 'lh-1',
        objection: "I'm happy with what I'm currently prescribing.",
        response: "That's great that you have a treatment approach that works for many of your patients. I'm curious—are there any patients where you're not getting the outcomes you'd like, or where tolerability is an issue? [Drug] might be worth considering specifically for those challenging cases. Even if it's just 1-2 patients initially, would you be open to seeing how it performs?",
        tips: [
          "Don't attack their current choice",
          "Look for gaps in their current approach",
          "Suggest a small trial in specific patients",
          "Position as complementary, not replacement"
        ],
        keywords: ['happy', 'satisfied', 'current', 'already use', 'working', 'prescribe']
      },
      {
        id: 'lh-2',
        objection: "I've been using [Competitor] for years with good results.",
        response: "It sounds like [Competitor] has served your patients well, and I respect that experience. What I hear from physicians who've added [Drug] to their toolkit is that it fills a specific niche—particularly for patients who [specific differentiator]. Are there patients in your practice who fit that profile?",
        tips: [
          "Validate their experience",
          "Don't criticize the competitor",
          "Identify the specific niche for your product",
          "Focus on complementary use, not switching"
        ],
        keywords: ['years', 'always used', 'competitor', 'experience', 'loyal', 'familiar']
      },
      {
        id: 'lh-3',
        objection: "I don't want to be an early adopter.",
        response: "I completely understand the desire to let others work out the kinks. The good news is that [Drug] has now been on the market for [X years], with over [X million] patients treated. We have robust real-world data confirming what the clinical trials showed. You'd be joining thousands of physicians who have successfully integrated it into their practice. Would the real-world safety data help give you more confidence?",
        tips: [
          "Respect their conservative approach",
          "Provide post-marketing experience data",
          "Emphasize adoption by peers",
          "Offer real-world evidence to build confidence"
        ],
        keywords: ['early adopter', 'new', 'wait', 'others', 'first', 'established']
      }
    ]
  },
  {
    id: 'formulary-pa',
    name: 'Formulary & Prior Authorization',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    description: 'Administrative barriers, insurance hurdles, and formulary restrictions.',
    objections: [
      {
        id: 'fp-1',
        objection: "The prior authorization process is too burdensome.",
        response: "I hear this concern frequently, and we've invested heavily in making PA easier. Our dedicated PA support team handles the entire process—they'll complete the forms, submit to the payer, and follow up. Average approval time is [X days] with a [X%] approval rate. We also have a bridge program providing free medication while PA is pending. Can I have our PA team reach out to your office manager?",
        tips: [
          "Acknowledge the burden is real",
          "Offer specific PA support services",
          "Quantify approval rates and timelines",
          "Introduce the PA team personally when possible"
        ],
        keywords: ['prior authorization', 'PA', 'paperwork', 'burden', 'forms', 'approval']
      },
      {
        id: 'fp-2',
        objection: "It's not on our hospital/health system formulary.",
        response: "I understand formulary status is important for practical prescribing. We're actively working with your P&T committee—our next review is scheduled for [date]. In the meantime, the non-formulary exception process typically takes [X days], and our team can support that documentation. We also have outcomes data from similar health systems that found [positive outcome]. Would it be helpful to connect you with a physician at [similar institution] who's had success with this?",
        tips: [
          "Know the formulary status and P&T schedule",
          "Offer to support exception requests",
          "Share outcomes data from similar systems",
          "Facilitate peer-to-peer connections"
        ],
        keywords: ['formulary', 'hospital', 'health system', 'P&T', 'committee', 'approved']
      },
      {
        id: 'fp-3',
        objection: "Step therapy requires failure on other medications first.",
        response: "Step therapy can be frustrating when you know which medication is right for your patient. For patients who meet medical exception criteria—such as [contraindication to step 1, prior failure, specific comorbidity]—we can often obtain approval without step therapy. Our support team has detailed payer-specific exception criteria. Which payers do most of your patients have? I can provide the specific bypass criteria.",
        tips: [
          "Know step therapy bypass criteria for major payers",
          "Help identify patients who qualify for exceptions",
          "Provide payer-specific guidance",
          "Offer documentation support"
        ],
        keywords: ['step therapy', 'step edit', 'fail first', 'try first', 'required']
      }
    ]
  },
  {
    id: 'samples-resources',
    name: 'Samples & Resources',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
    description: 'Requests for samples and questions about available support resources.',
    objections: [
      {
        id: 'sr-1',
        objection: "Do you have samples?",
        response: "Yes, I have samples available and would be happy to leave some. To make sure we're covering patients appropriately, may I ask about the patients you're considering? That way I can also make sure you have the right dosing information and patient education materials. How many patients are you thinking might benefit?",
        tips: [
          "Use samples as an opportunity for dialogue",
          "Ask about the intended patients",
          "Pair samples with appropriate education",
          "Follow up on sample patients"
        ],
        keywords: ['samples', 'try', 'free', 'starter']
      },
      {
        id: 'sr-2',
        objection: "I need samples but don't want the sales pitch.",
        response: "Understood—I'll keep it brief. Here are the samples along with the dosing guide and patient savings card. The only thing I'd mention is the [one key differentiator]. If you have any questions after trying it with patients, I'm always available. Is there anything specific you'd like to know before I go?",
        tips: [
          "Respect their request",
          "Provide samples with minimal talk",
          "Include essential materials only",
          "Leave the door open for questions"
        ],
        keywords: ['samples only', 'just samples', 'no pitch', 'quick']
      }
    ]
  },
  {
    id: 'clinical-guidelines',
    name: 'Guidelines & Standards of Care',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80',
    description: 'Objections based on clinical guidelines and established treatment protocols.',
    objections: [
      {
        id: 'cg-1',
        objection: "The guidelines don't recommend your medication as first-line.",
        response: "You're right that current guidelines position [Drug] as a [second-line/alternative] option. However, the guideline committee is reviewing new data from [recent trial] that shows [benefit]. Several key opinion leaders are already incorporating it earlier in therapy based on this evidence. In the meantime, for patients who [specific criteria], guidelines do support its use. Would it be helpful to see where it fits in the current algorithm?",
        tips: [
          "Acknowledge guideline positioning",
          "Reference emerging data",
          "Identify guideline-supported use cases",
          "Discuss ongoing guideline reviews"
        ],
        keywords: ['guidelines', 'first-line', 'recommended', 'standard', 'protocol', 'algorithm']
      },
      {
        id: 'cg-2',
        objection: "My institution has its own protocol that doesn't include your drug.",
        response: "I respect institutional protocols—they're developed thoughtfully for your patient population. I'm curious about the criteria used when the protocol was created. With the new data from [study] and real-world outcomes from similar institutions, would there be an opportunity to present to your protocol committee? I can provide a summary of the evidence that's emerged since the protocol was established.",
        tips: [
          "Respect institutional autonomy",
          "Inquire about protocol review processes",
          "Offer to support protocol discussions",
          "Provide updated evidence summaries"
        ],
        keywords: ['protocol', 'institution', 'policy', 'our hospital', 'pathway']
      }
    ]
  },
  {
    id: 'competition',
    name: 'Competitive Positioning',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    description: 'Direct comparisons with competitor products and differentiation challenges.',
    objections: [
      {
        id: 'cp-1',
        objection: "[Competitor] just launched and everyone is talking about it.",
        response: "There's definitely excitement around new options. What I'd encourage is looking at the totality of evidence. [Drug] has [X years] of real-world experience with over [X] patients treated, long-term safety data, and established efficacy across multiple trials. While [Competitor] shows promise, the long-term outcomes and real-world performance are still emerging. For patients where you want proven, established efficacy, [Drug] offers that confidence. What matters most to you when evaluating a new therapy?",
        tips: [
          "Don't disparage the competitor",
          "Emphasize your established track record",
          "Highlight long-term data and experience",
          "Ask what factors matter most to them"
        ],
        keywords: ['competitor', 'new drug', 'launched', 'everyone', 'buzz', 'talking']
      },
      {
        id: 'cp-2',
        objection: "Your competitor rep told me their product is better.",
        response: "I'd expect them to believe in their product, just as I believe in mine. Rather than debating claims, I'd suggest looking at the data side by side. Here's a comparison of the key clinical trials. You'll see [Drug] demonstrated [specific advantage]. I'm confident that when you review the evidence objectively, the differentiation becomes clear. Would it be helpful to walk through this together?",
        tips: [
          "Stay professional—never attack competitors",
          "Pivot to objective data comparison",
          "Have comparison materials ready",
          "Let the data speak for itself"
        ],
        keywords: ['rep said', 'told me', 'better', 'competitor says', 'claims']
      },
      {
        id: 'cp-3',
        objection: "There's a generic alternative that's good enough.",
        response: "Generics play an important role in healthcare, and for some patients they're entirely appropriate. Where [Drug] differentiates is [specific advantage—better efficacy, tolerability, dosing]. For patients who [specific scenario], the incremental benefit may justify the cost difference. The total cost of care analysis shows [outcome]. Would it make sense to reserve [Drug] for those patients where the differentiation matters most?",
        tips: [
          "Acknowledge generics have their place",
          "Identify specific patients who need more",
          "Focus on total cost of care",
          "Position for appropriate patient selection"
        ],
        keywords: ['generic', 'good enough', 'cheaper', 'alternative', 'same thing']
      }
    ]
  },
  {
    id: 'patient-specific',
    name: 'Patient Population Concerns',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
    description: 'Questions about specific patient populations and appropriate use.',
    objections: [
      {
        id: 'ps-1',
        objection: "Most of my patients are elderly with multiple comorbidities.",
        response: "That's exactly the population where thoughtful treatment selection matters most. [Drug] has been studied in patients over 75 and those with [common comorbidities]. The dosing doesn't require adjustment for mild-moderate renal impairment, and the interaction profile is favorable with common medications like [examples]. We also have a geriatric-specific dosing guide that might be useful. Would you like me to leave that?",
        tips: [
          "Know your geriatric data",
          "Address renal/hepatic dosing",
          "Discuss drug interactions with common medications",
          "Provide age-appropriate resources"
        ],
        keywords: ['elderly', 'older', 'geriatric', 'comorbidities', 'complex', 'frail']
      },
      {
        id: 'ps-2',
        objection: "I see a lot of patients with renal impairment.",
        response: "Renal impairment is an important consideration. [Drug] can be used in patients with CrCl down to [X] mL/min without dose adjustment. For more severe impairment, the recommended adjustment is [specific guidance]. Unlike some alternatives, it's not primarily renally eliminated, which simplifies management. I have a renal dosing card that provides quick reference guidance. Would that be helpful for your practice?",
        tips: [
          "Know exact renal dosing thresholds",
          "Compare to alternatives if favorable",
          "Provide practical dosing tools",
          "Address dialysis considerations if relevant"
        ],
        keywords: ['renal', 'kidney', 'CKD', 'creatinine', 'GFR', 'dialysis']
      },
      {
        id: 'ps-3',
        objection: "What about patients who are pregnant or planning pregnancy?",
        response: "Reproductive safety is critically important. [Drug] is Pregnancy Category [X]. The current data shows [specific information]. For women of childbearing potential, [specific guidance about contraception/monitoring]. For patients planning pregnancy, we recommend [specific approach]. I'd suggest reviewing the full prescribing information section on pregnancy, and our medical affairs team is available for complex cases.",
        tips: [
          "Know pregnancy category and specific data",
          "Discuss contraception requirements if applicable",
          "Have clear guidance for pregnancy planning",
          "Offer medical affairs support for complex questions"
        ],
        keywords: ['pregnant', 'pregnancy', 'childbearing', 'fertility', 'women']
      }
    ]
  }
];

export default function TrainingLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedObjections, setExpandedObjections] = useState<string[]>([]);

  const filteredLibrary = useMemo(() => {
    if (!searchTerm.trim()) return trainingLibrary;

    const term = searchTerm.toLowerCase();
    return trainingLibrary
      .map(category => ({
        ...category,
        objections: category.objections.filter(obj =>
          obj.objection.toLowerCase().includes(term) ||
          obj.response.toLowerCase().includes(term) ||
          obj.keywords.some(kw => kw.toLowerCase().includes(term)) ||
          obj.tips.some(tip => tip.toLowerCase().includes(term))
        )
      }))
      .filter(category => category.objections.length > 0);
  }, [searchTerm]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleObjection = (objectionId: string) => {
    setExpandedObjections(prev =>
      prev.includes(objectionId)
        ? prev.filter(id => id !== objectionId)
        : [...prev, objectionId]
    );
  };

  const totalObjections = trainingLibrary.reduce((acc, cat) => acc + cat.objections.length, 0);
  const filteredObjections = filteredLibrary.reduce((acc, cat) => acc + cat.objections.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a 
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                HOME
              </a>
              <h1 className="text-xl font-bold text-[#1B4D7A]">Training Library</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Professional Background */}
      <section className="relative bg-gradient-to-r from-[#0F2D44] to-[#1B4D7A] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Objection Handling Library
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Master every conversation with evidence-based responses to common physician objections. 
              Your comprehensive resource for turning challenges into opportunities.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search objections, responses, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-14 rounded-xl border-0 shadow-lg text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-[#E67E22]/30 text-lg"
                />
                <svg 
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex justify-center gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-3xl font-bold text-white">{trainingLibrary.length}</span>
                <span className="text-gray-200 ml-2">Categories</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-3xl font-bold text-[#E67E22]">{totalObjections}</span>
                <span className="text-gray-200 ml-2">Objections</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg shadow-sm px-6 py-4 flex items-center justify-between">
            <p className="text-gray-600">
              Found <span className="font-semibold text-[#1B4D7A]">{filteredObjections}</span> objections 
              in <span className="font-semibold text-[#1B4D7A]">{filteredLibrary.length}</span> categories
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#E67E22] hover:text-[#d06b1a] font-medium"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Category Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredLibrary.length === 0 ? (
          <div className="text-center py-12">
            <div 
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-cover bg-center opacity-50"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80)'
              }}
            />
            <p className="text-xl text-gray-500">No objections found matching your search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-[#1B4D7A] hover:underline font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLibrary.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Category Header with Image */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-stretch hover:bg-gray-50 transition-colors"
                >
                  {/* Category Image */}
                  <div 
                    className="w-32 md:w-48 flex-shrink-0 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${category.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                  </div>
                  
                  {/* Category Content */}
                  <div className="flex-1 px-6 py-5 flex items-center justify-between">
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-[#1B4D7A]">{category.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="bg-[#E67E22] text-white text-sm font-semibold px-3 py-1 rounded-full">
                        {category.objections.length} objection{category.objections.length !== 1 ? 's' : ''}
                      </span>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Category Content */}
                {expandedCategories.includes(category.id) && (
                  <div className="border-t border-gray-200">
                    {category.objections.map((obj, index) => (
                      <div
                        key={obj.id}
                        className={`${index !== 0 ? 'border-t border-gray-100' : ''}`}
                      >
                        {/* Objection Header */}
                        <button
                          onClick={() => toggleObjection(obj.id)}
                          className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex-1 pr-4">
                            <p className="font-semibold text-gray-900">
                              <span className="inline-block w-6 h-6 bg-red-100 text-red-600 rounded-full text-center text-sm font-bold mr-3 leading-6">?</span>
                              {obj.objection}
                            </p>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${expandedObjections.includes(obj.id) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Response & Tips */}
                        {expandedObjections.includes(obj.id) && (
                          <div className="px-6 pb-6 space-y-4">
                            {/* Response */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                                Recommended Response
                              </h4>
                              <p className="text-gray-700 leading-relaxed pl-8">{obj.response}</p>
                            </div>

                            {/* Tips */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </span>
                                Pro Tips
                              </h4>
                              <ul className="space-y-2 pl-8">
                                {obj.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="flex items-start gap-3 text-gray-700">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Keywords */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-2">Keywords:</span>
                              {obj.keywords.map((keyword, kwIndex) => (
                                <span
                                  key={kwIndex}
                                  className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with Background Image */}
      <footer className="relative bg-[#0F2D44] text-gray-300 py-12 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-6">Part of the RepIQ Training Platform</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Main Site
          </a>
        </div>
      </footer>
    </div>
  );
}
