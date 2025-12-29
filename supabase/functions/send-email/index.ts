import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailRequest {
  type: 'lead_notification' | 'itinerary_delivery' | 'confirmation' | 'custom';
  to: string;
  subject?: string;
  data?: Record<string, unknown>;
  html?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: EmailRequest = await req.json();
    const { type, to, subject, data, html } = body;

    // Validate required fields
    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailSubject = subject || "Safari Guide Notification";
    let emailHtml = html || "";

    // Generate email content based on type
    switch (type) {
      case 'lead_notification':
        emailSubject = subject || `New Lead: ${data?.traveler_name || 'New Inquiry'}`;
        emailHtml = generateLeadNotificationHtml(data);
        break;

      case 'itinerary_delivery':
        emailSubject = subject || `Your Safari Itinerary - ${data?.tour_name || 'Custom Safari'}`;
        emailHtml = generateItineraryHtml(data);
        break;

      case 'confirmation':
        emailSubject = subject || "Thank you for your inquiry!";
        emailHtml = generateConfirmationHtml(data);
        break;

      case 'custom':
        if (!html) {
          return new Response(
            JSON.stringify({ success: false, error: "HTML content required for custom emails" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log("Sending email to:", to, "type:", type);

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Safari Guide <onboarding@resend.dev>",
      to: [to],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(
        JSON.stringify({ success: false, error: emailError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailResponse?.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: { id: emailResponse?.id },
        message: "Email sent successfully",
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

function generateLeadNotificationHtml(data: Record<string, unknown> | undefined): string {
  const travelerName = data?.traveler_name || "Unknown";
  const travelerEmail = data?.traveler_email || "Not provided";
  const travelerPhone = data?.traveler_phone || "Not provided";
  const duration = data?.duration || "Not specified";
  const groupSize = data?.group_size || "Not specified";
  const budget = data?.budget || "Not specified";
  const interests = Array.isArray(data?.interests) ? data.interests.join(", ") : "Not specified";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-row { display: flex; border-bottom: 1px solid #eee; padding: 12px 0; }
        .label { font-weight: 600; width: 140px; color: #666; }
        .value { flex: 1; }
        .cta { background: #4a7c23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🦁 New Safari Lead!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A new traveler is interested in your services</p>
        </div>
        <div class="content">
          <h2 style="margin-top: 0;">Traveler Details</h2>
          <div class="info-row"><span class="label">Name:</span><span class="value">${travelerName}</span></div>
          <div class="info-row"><span class="label">Email:</span><span class="value">${travelerEmail}</span></div>
          <div class="info-row"><span class="label">Phone:</span><span class="value">${travelerPhone}</span></div>
          
          <h2>Trip Preferences</h2>
          <div class="info-row"><span class="label">Duration:</span><span class="value">${duration} days</span></div>
          <div class="info-row"><span class="label">Group Size:</span><span class="value">${groupSize} travelers</span></div>
          <div class="info-row"><span class="label">Budget:</span><span class="value">${budget}</span></div>
          <div class="info-row"><span class="label">Interests:</span><span class="value">${interests}</span></div>
          
          <p style="margin-top: 24px;">Log in to your dashboard to view the full details and respond to this lead.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateItineraryHtml(data: Record<string, unknown> | undefined): string {
  const tourName = data?.tour_name || "Your Safari Adventure";
  const summary = data?.summary || "";
  const travelerName = data?.traveler_name || "Traveler";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🌍 ${tourName}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your personalized safari itinerary</p>
        </div>
        <div class="content">
          <p>Dear ${travelerName},</p>
          <p>Thank you for your interest in our safari services. Please find your personalized itinerary attached.</p>
          ${summary ? `<p><strong>Summary:</strong> ${summary}</p>` : ''}
          <p>If you have any questions or would like to make adjustments, please don't hesitate to reach out.</p>
          <p>Best regards,<br>Your Safari Guide Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateConfirmationHtml(data: Record<string, unknown> | undefined): string {
  const travelerName = data?.traveler_name || "there";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Thank You!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your safari inquiry</p>
        </div>
        <div class="content">
          <p>Hi ${travelerName},</p>
          <p>Thank you for reaching out to us about your safari adventure! We've received your inquiry and our team is already working on crafting the perfect itinerary for you.</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our safari experts will review your preferences</li>
            <li>We'll match you with the best operators for your trip</li>
            <li>You'll receive personalized itinerary options within 24-48 hours</li>
          </ul>
          <p>In the meantime, feel free to reply to this email if you have any questions.</p>
          <p>We can't wait to help you experience the magic of Africa!</p>
          <p>Warm regards,<br>The Safari Guide Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
