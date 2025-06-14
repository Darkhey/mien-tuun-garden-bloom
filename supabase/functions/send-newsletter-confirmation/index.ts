
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";

// Supabase Setup
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_NAME = "Mien Tuun";
const SITE_URL = "https://mien-tuun.de"; // ggf. anpassen.

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "E-Mail erforderlich." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generiere Token
    const confirmation_token = crypto.randomUUID();

    // E-Mail als lowercase, um mehrfach-Anmeldung zu verhindern
    const lowerEmail = email.trim().toLowerCase();

    // Versuche Eintrag (falls unique violation, dann einfach bestätigt wieder senden)
    const { error: insertError } = await supabase.from("newsletter_subscribers").upsert([
      {
        email: lowerEmail,
        confirmation_token,
        confirmed: false,
        confirmed_at: null,
      },
    ], { onConflict: ["email"] });

    if (insertError) {
      // Bei Unique violation schon da, also token aktualisieren
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ confirmation_token, confirmed: false, confirmed_at: null })
        .eq("email", lowerEmail);
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Bestätigungslink generieren
    const confirmUrl = `${SITE_URL}/newsletter-confirm?email=${encodeURIComponent(lowerEmail)}&token=${encodeURIComponent(confirmation_token)}`;

    // Sende Double-Opt-In E-Mail über Resend
    await resend.emails.send({
      from: `Mien Tuun <kontakt@mien-tuun.de>`,
      to: [lowerEmail],
      subject: `Newsletter Anmeldung bei ${SITE_NAME} bestätigen`,
      html: `
        <h2>Newsletter-Anmeldung bei ${SITE_NAME}</h2>
        <p>Bitte bestätige deine Anmeldung, indem du auf den folgenden Link klickst:</p>
        <p><a href="${confirmUrl}" style="color:#19793a;font-weight:bold">Hier Anmeldung bestätigen</a></p>
        <p>Falls du dich nicht angemeldet hast, ignoriere diese Nachricht einfach.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
