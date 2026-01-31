import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// System prompt to restrict to agriculture only
const SYSTEM_PROMPT = `You are an expert agricultural advisor chatbot for Indian farmers. Your role is to provide accurate, practical farming advice.

STRICT RULES:
1. ONLY answer questions related to agriculture, farming, crops, livestock, soil, weather impact on farming, pest control, irrigation, fertilizers, seeds, harvesting, agricultural markets, and farm equipment.
2. If asked about ANYTHING else (politics, sports, entertainment, general knowledge, personal questions, math problems, coding, etc.), respond EXACTLY with: "I apologize, but I can only assist with agriculture and farming-related questions. Please ask me about crops, livestock, soil management, pest control, irrigation, or other farming topics."
3. Keep answers practical and relevant to Indian farming context
4. Use simple language that farmers can understand
5. Provide actionable advice

Current conversation context: You are helping farmers make better decisions about their crops and farming practices.`;

// Check if question is agriculture-related (backup validation)
function isAgricultureRelated(question: string): boolean {
  const agriKeywords = [
    'crop', 'farm', 'soil', 'seed', 'plant', 'harvest', 'wheat', 'rice', 'tomato',
    'pest', 'fertilizer', 'irrigation', 'cattle', 'livestock', 'vegetable', 'fruit',
    'tractor', 'land', 'agriculture', 'farming', 'yield', 'disease', 'insect',
    'weather', 'rain', 'drought', 'water', 'organic', 'chemical', 'mandi', 'market',
    'potato', 'onion', 'corn', 'cotton', 'sugarcane', 'milk', 'poultry', 'chicken',
    'goat', 'sheep', 'fish', 'aquaculture', 'horticulture', 'nursery', 'greenhouse'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return agriKeywords.some(keyword => lowerQuestion.includes(keyword));
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      return NextResponse.json({
        response: 'I apologize, but the chatbot service is currently not configured. Please contact the administrator to set up the GROQ_API_KEY.'
      });
    }

    // Optional: Pre-filter non-agriculture questions (extra safety)
    if (!isAgricultureRelated(message) && message.length > 10) {
      return NextResponse.json({
        response: "I apologize, but I can only assist with agriculture and farming-related questions. Please ask me about crops, livestock, soil management, pest control, irrigation, or other farming topics."
      });
    }

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      
      if (response.status === 429) {
        return NextResponse.json({
          response: 'Rate limit exceeded. Please wait a moment and try again.'
        });
      }
      
      if (response.status === 401) {
        return NextResponse.json({
          response: 'API key error. Please check your GROQ_API_KEY configuration.'
        });
      }
      
      return NextResponse.json({
        response: 'Sorry, something went wrong. Please try again.'
      });
    }

    const data = await response.json();
    const botResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response: botResponse });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}