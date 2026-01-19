import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonaById } from '@/data/personas';
import { getDrugById } from '@/data/drugs';
import { Message } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { personaId, drugId, messages, timeRemaining } = await request.json();

    const persona = getPersonaById(personaId);
    const drug = getDrugById(drugId);

    if (!persona || !drug) {
      return NextResponse.json(
        { error: 'Invalid persona or drug ID' },
        { status: 400 }
      );
    }

    // Build the system prompt with drug context
    const systemPrompt = `${persona.systemPrompt}

CURRENT CONTEXT:
- The rep is detailing: ${drug.name} (${drug.category})
- Indication: ${drug.indication}
- Key clinical data: ${drug.keyData}
- Main competitor: ${drug.competitorName || 'Standard of care'}
- Mechanism: ${drug.mechanismOfAction || 'Not specified'}
- Time remaining in conversation: approximately ${timeRemaining} seconds

Remember: Stay in character as ${persona.name}. Respond naturally as a physician would in this situation.`;

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: Message) => ({
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
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
