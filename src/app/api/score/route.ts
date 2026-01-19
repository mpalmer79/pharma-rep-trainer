import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonaById } from '@/data/personas';
import { getDrugById } from '@/data/drugs';
import { Message, Feedback, ScoreBreakdown } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { personaId, drugId, messages } = await request.json();

    const persona = getPersonaById(personaId);
    const drug = getDrugById(drugId);

    if (!persona || !drug) {
      return NextResponse.json(
        { error: 'Invalid persona or drug ID' },
        { status: 400 }
      );
    }

    // Format conversation for evaluation
    const conversationText = messages
      .map((msg: Message) => `${msg.role === 'user' ? 'REP' : 'PHYSICIAN'}: ${msg.content}`)
      .join('\n\n');

    const evaluationPrompt = `You are an expert pharmaceutical sales trainer evaluating a rep's performance in a simulated physician call.

CONTEXT:
- Product: ${drug.name} (${drug.category}) for ${drug.indication}
- Key data: ${drug.keyData}
- Physician persona: ${persona.name} - ${persona.title} (${persona.description})
- Difficulty: ${persona.difficulty}

CONVERSATION:
${conversationText}

Evaluate the rep's performance and respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "scores": {
    "opening": <0-100>,
    "clinicalKnowledge": <0-100>,
    "objectionHandling": <0-100>,
    "timeManagement": <0-100>,
    "compliance": <0-100>,
    "closing": <0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "tips": "<one specific actionable tip for this persona type>"
}

SCORING CRITERIA:
- opening: Did they get to the point quickly? Respect physician's time? Establish relevance?
- clinicalKnowledge: Did they use specific data? Cite trials? Speak credibly about the science?
- objectionHandling: Did they address concerns directly? Pivot effectively? Find common ground?
- timeManagement: Were responses appropriately concise for this persona? Did they prioritize key points?
- compliance: Did they avoid unsupported claims? Stay within approved messaging? No off-label promotion?
- closing: Did they establish next steps? Leave the door open? End professionally?

Be fair but rigorous. A score of 70 is "competent", 80+ is "strong", 90+ is "excellent".`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
    });

    const contentBlock = response.content[0];
    const responseText = contentBlock.type === 'text' ? contentBlock.text : '';
    
    // Parse the JSON response
    let evaluation;
    try {
      // Clean up any markdown formatting if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      evaluation = JSON.parse(cleanedResponse);
    } catch {
      // Fallback to algorithmic scoring if Claude's response isn't valid JSON
      evaluation = generateFallbackScores(messages, persona, drug);
    }

    // Calculate overall score
    const scores = evaluation.scores as ScoreBreakdown;
    const overall = Math.round(
      Object.values(scores).reduce((a: number, b: number) => a + b, 0) / 
      Object.keys(scores).length
    );

    const feedback: Feedback = {
      scores,
      overall,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      tips: evaluation.tips || getDefaultTip(persona.id),
    };

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

// Fallback scoring if Claude API fails or returns invalid JSON
function generateFallbackScores(messages: Message[], persona: { id: string }, drug: { name: string }): {
  scores: ScoreBreakdown;
  strengths: string[];
  improvements: string[];
  tips: string;
} {
  const userMessages = messages.filter((m: Message) => m.role === 'user');
  const allUserText = userMessages.map((m: Message) => m.content).join(' ').toLowerCase();
  
  const scores: ScoreBreakdown = {
    opening: evaluateOpening(userMessages[0]?.content || ''),
    clinicalKnowledge: evaluateClinicalContent(allUserText),
    objectionHandling: evaluateObjectionHandling(messages),
    timeManagement: evaluateTimeManagement(userMessages, persona.id),
    compliance: evaluateCompliance(allUserText),
    closing: evaluateClosing(userMessages[userMessages.length - 1]?.content || ''),
  };

  return {
    scores,
    strengths: getStrengths(scores),
    improvements: getImprovements(scores),
    tips: getDefaultTip(persona.id),
  };
}

function evaluateOpening(opening: string): number {
  if (!opening) return 40;
  const lower = opening.toLowerCase();
  let score = 60;
  if (lower.length < 100) score += 15;
  if (lower.includes('thank') || lower.includes('appreciate')) score += 5;
  if (lower.includes('minute') || lower.includes('brief') || lower.includes('quick')) score += 10;
  if (lower.length > 250) score -= 20;
  return Math.min(100, Math.max(0, score));
}

function evaluateClinicalContent(text: string): number {
  let score = 50;
  if (text.includes('%') || text.includes('percent')) score += 15;
  if (text.includes('trial') || text.includes('study') || text.includes('data')) score += 10;
  if (text.includes('patient')) score += 5;
  if (text.includes('side effect') || text.includes('tolerab') || text.includes('safety')) score += 10;
  if (text.includes('compar') || text.includes('versus') || text.includes('vs')) score += 10;
  return Math.min(100, score);
}

function evaluateObjectionHandling(history: Message[]): number {
  const turns = history.filter((m: Message) => m.role === 'user').length;
  if (turns >= 4) return 85;
  if (turns >= 3) return 70;
  if (turns >= 2) return 55;
  return 40;
}

function evaluateTimeManagement(userMessages: Message[], personaId: string): number {
  const avgLength = userMessages.reduce((a: number, m: Message) => a + m.content.length, 0) / (userMessages.length || 1);
  if (personaId === 'rush') {
    if (avgLength < 150) return 90;
    if (avgLength < 250) return 70;
    return 50;
  }
  return 75;
}

function evaluateCompliance(text: string): number {
  let score = 90;
  const redFlags = ['cure', 'guarantee', 'best drug', 'no side effects', '100%', 'miracle'];
  redFlags.forEach(flag => {
    if (text.includes(flag)) score -= 20;
  });
  return Math.max(0, score);
}

function evaluateClosing(closing: string): number {
  if (!closing) return 50;
  const lower = closing.toLowerCase();
  let score = 60;
  if (lower.includes('follow up') || lower.includes('next time')) score += 15;
  if (lower.includes('sample') || lower.includes('literature') || lower.includes('information')) score += 10;
  if (lower.includes('thank')) score += 5;
  return Math.min(100, score);
}

function getStrengths(scores: ScoreBreakdown): string[] {
  const strengths = [];
  if (scores.opening >= 75) strengths.push("Strong, concise opening that respected the physician's time");
  if (scores.clinicalKnowledge >= 75) strengths.push("Good use of clinical data and evidence-based language");
  if (scores.objectionHandling >= 75) strengths.push("Effectively navigated objections to advance the conversation");
  if (scores.timeManagement >= 75) strengths.push("Appropriate message length for the scenario");
  if (scores.compliance >= 85) strengths.push("Maintained compliant messaging throughout");
  if (scores.closing >= 75) strengths.push("Left the door open for future engagement");
  return strengths.length ? strengths : ["Completed the role-play exercise"];
}

function getImprovements(scores: ScoreBreakdown): string[] {
  const improvements = [];
  if (scores.opening < 70) improvements.push("Open more concisely - get to the value proposition faster");
  if (scores.clinicalKnowledge < 70) improvements.push("Include more specific clinical data (percentages, trial results, comparisons)");
  if (scores.objectionHandling < 70) improvements.push("Address objections more directly before moving on");
  if (scores.timeManagement < 70) improvements.push("Keep responses shorter - busy physicians lose patience with long pitches");
  if (scores.compliance < 80) improvements.push("Avoid absolute claims - stick to approved language");
  if (scores.closing < 70) improvements.push("End with a clear next step or call to action");
  return improvements;
}

function getDefaultTip(personaId: string): string {
  switch (personaId) {
    case 'rush':
      return "With time-pressed physicians, lead with your single strongest differentiator. You have 30 seconds to earn the next 60.";
    case 'skeptic':
      return "Academic physicians respect intellectual honesty. It's better to say 'I don't know, but I'll find out' than to bluff.";
    case 'loyalist':
      return "Don't attack their current choice. Instead, identify specific patient types where your product addresses an unmet need.";
    case 'gatekeeper':
      return "The office manager is your first ally or your biggest obstacle. Treat them as a partner, not a barrier.";
    case 'curious':
      return "Early adopters want to understand the science deeply. Prepare to discuss mechanism of action and ideal patient profiles.";
    default:
      return "Listen more than you speak. The best reps uncover needs before presenting solutions.";
  }
}
