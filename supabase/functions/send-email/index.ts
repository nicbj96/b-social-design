/**
 * send-email — transactional email via Resend
 *
 * Env vars (set via supabase secrets set):
 *   RESEND_API_KEY  — from resend.com (free tier: 3,000/month)
 *   FROM_EMAIL      — sender address, e.g. "B-Social <noreply@b-social.net>"
 *
 * POST body:
 *   { to, subject, html, text? }
 *
 * Trigger it from the frontend:
 *   await supabase.functions.invoke('send-email', { body: { to, subject, html } })
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
  const FROM      = Deno.env.get("FROM_EMAIL") ?? "B-Social <noreply@b-social.net>";

  if (!RESEND_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      { status: 503, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  try {
    const { to, subject, html, text } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "to, subject, html required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    FROM,
        to:      Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text ?? undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
