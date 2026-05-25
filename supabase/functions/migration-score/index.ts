const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const aiCoreUrl = Deno.env.get("AI_CORE_URL") || "http://host.docker.internal:8000";
  const url = new URL(req.url);
  const pathFromUrl = url.pathname
    .replace(/^\/?migration-score\/?/, "")
    .replace(/^\/+/, "");
  const path = req.headers.get("x-migration-path") || url.searchParams.get("path") || pathFromUrl || "score";
  const allowedPaths = new Set(["score", "score/history", "phase"]);

  if (!allowedPaths.has(path)) {
    return new Response(JSON.stringify({ error: "Unsupported migration score path" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(`${aiCoreUrl}/migration/${path}`, {
      headers: { Accept: "application/json" },
    });
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "AI Core unavailable", detail: String(error) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
