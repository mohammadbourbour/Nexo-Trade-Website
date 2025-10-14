import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "general" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Customize system prompt based on type
    let systemPrompt = "You are an expert AI trading assistant specializing in cryptocurrency, stocks, and commodities markets.";
    
    if (type === "technical") {
      systemPrompt = "You are an expert technical analyst. Analyze charts, patterns, indicators (RSI, MACD, EMA, Fibonacci, etc.) and provide actionable trading insights. Be specific about entry/exit points and risk management.";
    } else if (type === "news") {
      systemPrompt = "You are a financial news analyst. Analyze market news sentiment, assess impact on various assets, and provide trading recommendations based on fundamental analysis.";
    } else if (type === "general") {
      systemPrompt = "You are a helpful AI trading assistant. Answer questions about market analysis, trading strategies, risk management, and provide insights on cryptocurrencies, stocks, gold, and forex markets.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limits exceeded. Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits depleted. Please add credits to continue." 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An error occurred processing your request" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
