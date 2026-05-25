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
  const sessionId = url.pathname.replace(/^\/?plan\/?/, "").replace(/^\/+/, "");

  if (req.method === "GET" && sessionId) {
    try {
      const upstream = await fetch(`${aiCoreUrl}/plan/${sessionId}`, {
        headers: { Accept: "application/json" },
      });
      const body = await upstream.text();

      return new Response(body, {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Planning service unavailable", detail: String(error) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const upstream = await fetch(`${aiCoreUrl}/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Planning service unavailable", detail: String(error) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
