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
    const { email, password, name, company, specializations = [] } = await req.json();

    if (!email || !password || !name || !company) {
      return new Response(JSON.stringify({ success: false, message: "Email, password, name, and company are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check existing user
    const { data: existingOp } = await supabase.from("operators").select("id").eq("email", email).single();
    if (existingOp) {
      return new Response(JSON.stringify({ success: false, message: "A user with this email already exists" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, company } });
    if (authError) {
      return new Response(JSON.stringify({ success: false, message: authError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: operator, error: opError } = await supabase.from("operators").insert({
      id: authData.user.id, name, email, company, specializations, password_hash: "managed_by_supabase_auth", role: "operator", is_active: true
    }).select().single();

    if (opError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ success: false, message: opError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Insert role into user_roles table
    await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "operator" }).catch(() => {});

    return new Response(JSON.stringify({
      success: true, message: "Operator account created successfully",
      data: { operator: { id: operator.id, name: operator.name, email: operator.email, company: operator.company, role: "operator", specializations: operator.specializations || [] } }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
