import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// In-memory store for demo purposes. Replace with DB persistence as needed.
const sessions = new Map<string, { plan: Record<string, unknown>; created_at: string }>();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const action: string = body.action || 'create';

    if (action === 'get') {
      const sid = body.session_id;
      if (!sid) return json({ error: 'session_id required' }, 400);
      const entry = sessions.get(sid);
      if (!entry) return json({ error: 'Not found' }, 404);
      return json({ session_id: sid, plan: entry.plan });
    }

    // create
    const prompt: string = (body.prompt ?? '').toString().slice(0, 4000);
    const session_id = crypto.randomUUID();

    const plan = {
      summary: `Draft safari plan based on: ${prompt.slice(0, 120)}`,
      days: [
        { day: 1, location: 'Nairobi', activity: 'Arrival & briefing' },
        { day: 2, location: 'Maasai Mara', activity: 'Game drive' },
        { day: 3, location: 'Maasai Mara', activity: 'Full-day safari' },
      ],
      generated_at: new Date().toISOString(),
    };

    sessions.set(session_id, { plan, created_at: new Date().toISOString() });

    return json({ session_id, plan });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
