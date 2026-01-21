import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Persona } from '@/types';
import { Drug } from '@/types';

// Fallback responses when API key is not configured
const getFallbackResponse = (
  persona: Persona,
  drug: Drug,
  messageCount: number,
  userMessage: string
): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Persona-specific fallback responses based on conversation stage and keywords
  const fallbacksByPersona: Record<string, string[]> = {
    skeptic: [
      `*raises eyebrow* Interesting. You mentioned ${drug.name}—what's the absolute risk reduction in those trials, not just the relative numbers?`,
      `I've seen the marketing materials. What I want to know is: what were the dropout rates, and why did patients leave the study?`,
      `That's the Phase 3 data. But what about real-world outcomes? Trial populations rarely match my patient panel.`,
      `*leans forward* You're confident about those numbers. What about the confidence intervals? And how does that compare head-to-head with ${drug.competitorName}?`,
      `Fair points. I'd want to see the full dataset before making any changes to my prescribing. Can you send me the primary publication?`,
      `*nods slowly* I appreciate you knowing your data. Most reps can't answer those questions. Leave the study information—I'll review it.`,
    ],
    rush: [
      `*glances at watch* Okay, but give me the headline. How is ${drug.name} different from what I'm already prescribing?`,
      `*phone buzzes* Sorry—what's the coverage situation? My patients can't afford another prior auth hassle.`,
      `I've got about 30 seconds. What's the one thing I should remember about this?`,
      `*stands up* Look, I need to get to my next patient. Leave the samples and the key study—I'll look at it tonight.`,
    ],
    loyalist: [
      `I hear you, but I've been using ${drug.competitorName} for years. My patients are stable. Why would I risk changing?`,
      `That's interesting, but every new drug promises better outcomes. What makes ${drug.name} actually different in practice?`,
      `*sighs* I've tried switching patients before. The hassle with insurance, the titration, the follow-up visits... it's not trivial.`,
      `Okay, I can see some patients might benefit. But for new starts only—I'm not disrupting my stable patients.`,
      `You make a fair case. Next time I have a patient with ${drug.indication} who isn't responding well, I'll consider it.`,
    ],
    gatekeeper: [
      `The doctors are in clinic all morning. What specifically did you want to share with them?`,
      `We get a lot of reps coming through. What makes this worth Dr. Martinez's time?`,
      `*checks schedule* I might be able to get you 5 minutes with Dr. Chen at 2pm, but you'll need to be quick.`,
      `I can pass along materials, but they're very selective about what they actually read. What's the key message?`,
      `Alright, I'll mention ${drug.name} to the team. Leave your card and the clinical summary.`,
    ],
    curious: [
      `Interesting! How does ${drug.name} work at the receptor level? I want to understand the mechanism.`,
      `*takes notes* And where would this fit in my treatment algorithm? First-line, or after ${drug.competitorName} fails?`,
      `What's the ideal patient profile? I'm thinking about a few specific cases where this might help.`,
      `I like what I'm hearing. What's the real-world experience been like? Any surprises post-marketing?`,
      `This is helpful. I'd like to try it with a few appropriate patients. Can you follow up with me in a month to see how it's going?`,
    ],
  };

  const responses = fallbacksByPersona[persona.id] || [
    `Tell me more about ${drug.name}. What should I know?`,
    `How does this compare to the current standard of care?`,
    `Interesting. What about side effects?`,
    `I'll need to think about this. Leave your information.`,
  ];

  // Select response based on message count (conversation progression)
  const index = Math.min(messageCount, responses.length - 1);
  return responses[index];
};

export async function POST(request: NextRequest) {
  try {
    const { personaId, drugId, messages, timeRemaining, persona, drug } = await request.json();

    // Support both new format (personaId/drugId) and old format (persona/drug objects)
    let personaData: Persona;
    let drugData: Drug;

    if (persona && drug) {
      // Old format from page.tsx - persona and drug objects passed directly
      personaData = persona;
      drugData = drug;
    } else if (personaId && drugId) {
      // New format with IDs - look them up
      const { getPersonaById } = await import('@/data/personas');
      const { getDrugById } = await import('@/data/drugs');
      const foundPersona = getPersonaById(personaId);
      const foundDrug = getDrugById(drugId);
      
      if (!foundPersona || !foundDrug) {
        return NextResponse.json(
          { error: 'Invalid persona or drug ID' },
          { status: 400 }
        );
      }
      personaData = foundPersona;
      drugData = foundDrug;
    } else {
      return NextResponse.json(
        { error: 'Missing persona or drug data' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your-api-key-here' || apiKey.length < 10) {
      // No valid API key - use intelligent fallback
      console.log('No API key configured, using fallback responses');
      
      const userMessage = messages[messages.length - 1]?.content || '';
      const fallbackMessage = getFallbackResponse(
        personaData,
        drugData,
        Math.floor(messages.length / 2), // Count of exchanges
        userMessage
      );

      return NextResponse.json({
        message: fallbackMessage,
        endConversation: messages.length >= 10,
        fallbackMode: true,
      });
    }

    // API key exists - use Claude
    const anthropic = new Anthropic({ apiKey });

    // Build the system prompt with drug context
    const systemPrompt = `${personaData.systemPrompt}

CURRENT CONTEXT:
- The rep is detailing: ${drugData.name} (${drugData.category})
- Indication: ${drugData.indication}
- Key clinical data: ${drugData.keyData}
- Main competitor: ${drugData.competitorName || 'Standard of care'}
- Mechanism: ${drugData.mechanismOfAction || 'Not specified'}
- Time remaining in conversation: approximately ${timeRemaining || 'unknown'} seconds

Remember: Stay in character as ${personaData.name}. Respond naturally as a physician would in this situation.`;

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const contentBlock = response.content[0];
    const assistantMessage = contentBlock.type === 'text' ? contentBlock.text : '';

    // Check if conversation should end based on response content
    const endingPhrases = [
      'have to go',
      'next patient',
      'thanks for stopping by',
      'leave some samples',
      'schedule more time',
      "let's talk again",
      'good discussion',
      'i appreciate',
      'think about it',
    ];
    
    const shouldEnd = endingPhrases.some(phrase => 
      assistantMessage.toLowerCase().includes(phrase)
    ) && messages.length >= 6;

    return NextResponse.json({
      message: assistantMessage,
      endConversation: shouldEnd,
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // Return a fallback message on error
    return NextResponse.json({
      message: "I'm reviewing what you've said. Could you elaborate on that point?",
      endConversation: false,
      error: true,
    });
  }
}
