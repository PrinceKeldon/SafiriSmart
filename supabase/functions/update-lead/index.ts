import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_STATUSES = ['new', 'pending', 'contacted', 'quoted', 'booked', 'archived', 'cancelled'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "PUT" && req.method !== "PATCH") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const { 
      lead_id, 
      status, 
      itinerary, 
      quoted_price, 
      quoted_currency,
      todo_list,
      notes,
      preferences,
    } = body;

    if (!lead_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Lead ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate lead_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lead_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid lead ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has access to this lead (admin or assigned operator)
    const { data: hasAdminRole } = await serviceClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    // Get the lead
    const { data: lead, error: leadError } = await serviceClient
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check authorization: must be admin, assigned operator, or in visibility list
    if (!hasAdminRole) {
      const isAssigned = lead.assigned_operator_id === user.id;
      
      if (!isAssigned) {
        // Check visibility table
        const { data: visibility } = await serviceClient
          .from("lead_visibility")
          .select("id")
          .eq("lead_id", lead_id)
          .eq("operator_id", user.id)
          .single();

        if (!visibility) {
          return new Response(
            JSON.stringify({ success: false, error: "Access denied to this lead" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Validate and add status
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updateData.status = status;
    }

    // Add itinerary if provided
    if (itinerary !== undefined) {
      updateData.itinerary = itinerary;
    }

    // Add quoted price if provided
    if (quoted_price !== undefined) {
      if (typeof quoted_price !== 'number' || quoted_price < 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid quoted price" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updateData.quoted_price = quoted_price;
    }

    // Add quoted currency if provided
    if (quoted_currency !== undefined) {
      if (typeof quoted_currency !== 'string' || quoted_currency.length !== 3) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid currency code (must be 3 characters)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updateData.quoted_currency = quoted_currency.toUpperCase();
    }

    // Add todo_list if provided (stored in preferences JSON)
    if (todo_list !== undefined) {
      const currentPreferences = lead.preferences || {};
      updateData.preferences = {
        ...currentPreferences,
        todo_list: todo_list,
      };
    }

    // Merge preferences if provided separately
    if (preferences !== undefined) {
      const currentPreferences = updateData.preferences || lead.preferences || {};
      updateData.preferences = {
        ...currentPreferences,
        ...preferences,
      };
    }

    console.log("Updating lead:", lead_id, "with data:", Object.keys(updateData));

    // Update the lead
    const { data: updatedLead, error: updateError } = await serviceClient
      .from("leads")
      .update(updateData)
      .eq("id", lead_id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add note if provided
    if (notes) {
      await serviceClient
        .from("lead_notes")
        .insert({
          lead_id: lead_id,
          note: notes,
          created_by: user.id,
        });
    }

    console.log("Lead updated successfully:", lead_id);

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedLead,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
