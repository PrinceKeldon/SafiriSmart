
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { packageName, context, userKeywords } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced prompt with user keywords integration
    const baseContext = context || 'safari tour package in Kenya';
    const keywordSection = userKeywords ? `\n\nUSER KEYWORDS & CONTEXT: ${userKeywords}\nPlease incorporate these keywords and themes naturally into the description.` : '';
    
    const prompt = `Write a compelling and professional description for a safari tour package called "${packageName}". 
    Context: ${baseContext}${keywordSection}
    
    The description should be:
    - 2-3 paragraphs long
    - Engaging and marketing-focused
    - Highlight unique experiences and wildlife encounters
    - Include practical information about what's included
    - Professional tone suitable for travel operators
    - Around 150-200 words
    - If user keywords are provided, incorporate them naturally and meaningfully
    
    Do not include pricing information as that will be handled separately.
    
    Make the description sound authentic and specific to Kenya's safari experience.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional travel and safari marketing expert who writes compelling package descriptions. You excel at incorporating user-provided keywords naturally into engaging content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 350,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ description }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating description:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
