import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, history } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get Supabase client for storing conversation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Build system prompt based on context
    const systemPrompt = buildSystemPrompt(context);

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI gateway error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store conversation in database if user is authenticated
    let conversationId = null;
    if (userId) {
      const { data: conversation, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          question: message,
          response: aiResponse,
          context: context,
        })
        .select()
        .single();

      if (!error) {
        conversationId = conversation.id;
      }
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildSystemPrompt(context: any): string {
  const { skillLevel, skillScore, complexity, tone, section } = context;

  let prompt = 'You are a helpful cryptocurrency trading assistant. ';

  // Adjust tone
  if (tone === 'casual') {
    prompt += 'Be friendly, use emojis, and keep explanations simple and fun! ';
  } else if (tone === 'friendly') {
    prompt += 'Be approachable and clear in your explanations. ';
  } else {
    prompt += 'Be professional, concise, and precise in your explanations. ';
  }

  // Adjust complexity
  if (skillLevel === 'beginner' || skillScore < 4) {
    prompt += 'The user is a beginner, so avoid technical jargon and explain concepts simply. ';
    prompt += 'Use analogies and examples to make concepts easier to understand. ';
  } else if (skillLevel === 'intermediate' || skillScore < 7) {
    prompt += 'The user has intermediate knowledge, so you can use some technical terms but still explain them. ';
  } else {
    prompt += 'The user is advanced/expert, so feel free to use technical terminology and provide detailed analysis. ';
  }

  // Add section context
  prompt += `The user is currently viewing the ${section} section. `;
  prompt += 'Answer questions related to crypto sentiment analysis, technical indicators, and market trends. ';

  // Length guidance
  if (complexity === 'simple') {
    prompt += 'Keep responses under 100 words. ';
  } else if (complexity === 'moderate') {
    prompt += 'Keep responses under 150 words. ';
  }

  return prompt;
}
