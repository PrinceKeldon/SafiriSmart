import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const path: string = body.path || '/migration/score';

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    // Placeholder scoring engine — replace with real metrics later.
    const now = new Date().toISOString();

    if (path === '/migration/score') {
      return json({
        score: 42,
        phase: 'Phase 2 · Foundation',
        updated_at: now,
        details: { completed_modules: 4, total_modules: 10 },
      });
    }

    if (path === '/migration/score/history') {
      return json([
        { score: 10, phase: 'Phase 1', recorded_at: '2025-01-01T00:00:00Z' },
        { score: 25, phase: 'Phase 1', recorded_at: '2025-03-01T00:00:00Z' },
        { score: 42, phase: 'Phase 2 · Foundation', recorded_at: now },
      ]);
    }

    if (path === '/migration/phase') {
      return json({ phase: 'Phase 2 · Foundation' });
    }

    return json({ error: 'Unknown path' }, 404);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
