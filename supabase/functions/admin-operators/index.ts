import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "No authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check admin role - try has_role first, fallback to operators table
    const { data: hasAdminRole } = await serviceClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (!hasAdminRole) {
      const { data: operator } = await serviceClient.from("operators").select("role").eq("id", user.id).single();
      if (operator?.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (req.method === "GET") {
      const { data: operators, error } = await serviceClient.from("operators").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: operators }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === "POST") {
      const { email, password, name, company, role = "operator" } = await req.json();
      if (!email || !password || !name || !company) {
        return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({ email, password, email_confirm: true });
      if (authError) return new Response(JSON.stringify({ success: false, error: authError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: operator, error: opError } = await serviceClient.from("operators").insert({ id: authData.user.id, email, name, company, role, is_active: true, password_hash: 'managed_by_supabase_auth' }).select().single();
      if (opError) {
        await serviceClient.auth.admin.deleteUser(authData.user.id);
        return new Response(JSON.stringify({ success: false, error: opError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      await serviceClient.from("user_roles").insert({ user_id: authData.user.id, role }).catch(() => {});
      return new Response(JSON.stringify({ success: true, data: operator }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === "PUT") {
      const { id, ...updateData } = await req.json();
      if (!id) return new Response(JSON.stringify({ success: false, error: "ID required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      delete updateData.password_hash;
      const { data, error } = await serviceClient.from("operators").update(updateData).eq("id", id).select().single();
      if (error) return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === "DELETE") {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) return new Response(JSON.stringify({ success: false, error: "ID required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      await serviceClient.from("operators").delete().eq("id", id);
      await serviceClient.auth.admin.deleteUser(id).catch(() => {});
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
