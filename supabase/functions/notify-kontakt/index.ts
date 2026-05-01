// Supabase Edge Function: notify-kontakt
// Sendet eine E-Mail-Benachrichtigung wenn eine neue Kontaktanfrage eingeht.
//
// SETUP:
// 1. Erstelle einen kostenlosen Account auf https://resend.com
// 2. Hol dir deinen API Key unter resend.com/api-keys
// 3. Füge den Key in Supabase ein:
//    Dashboard → Edge Functions → Secrets → Add Secret
//    Name: RESEND_API_KEY  |  Value: re_xxxxxx
// 4. Ändere NOTIFY_EMAIL auf deine eigene E-Mail-Adresse
// 5. Deploy: supabase functions deploy notify-kontakt

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const NOTIFY_EMAIL = "deine@email.de"; // ← HIER deine E-Mail eintragen
const FROM_EMAIL   = "FlyOriginals <kontakt@flyoriginals.de>"; // ← Absender (muss in Resend verifiziert sein)

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const payload = await req.json();
    const { vorname, nachname, email, betreff, nachricht } = payload;

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not set");

    const emailBody = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #0d0005; color: #FAF5EF; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 32px; }
    .header { border-bottom: 2px solid #CC1020; padding-bottom: 20px; margin-bottom: 28px; }
    .logo { font-size: 1.8rem; letter-spacing: 6px; color: #CC1020; font-weight: 700; }
    .label { font-size: 0.65rem; letter-spacing: 4px; text-transform: uppercase; color: #CC1020; margin-bottom: 6px; }
    .value { font-size: 1rem; color: #FAF5EF; margin-bottom: 20px; line-height: 1.6; }
    .message-box { background: rgba(204,16,32,0.08); border: 1px solid rgba(204,16,32,0.25); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 32px; font-size: 0.72rem; color: rgba(250,245,239,0.3); border-top: 1px solid rgba(204,16,32,0.15); padding-top: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">FLYORIGINALS</div>
      <div style="font-size:0.75rem;letter-spacing:3px;color:rgba(250,245,239,0.4);margin-top:6px;">Neue Kontaktanfrage</div>
    </div>

    <div class="label">Von</div>
    <div class="value">${vorname} ${nachname || ""} &lt;${email}&gt;</div>

    ${betreff ? `<div class="label">Betreff</div><div class="value">${betreff}</div>` : ""}

    <div class="label">Nachricht</div>
    <div class="message-box">
      <div class="value" style="margin:0">${nachricht.replace(/\n/g, "<br>")}</div>
    </div>

    <div class="footer">
      Diese E-Mail wurde automatisch von der FlyOriginals Website gesendet.<br>
      Eingang: ${new Date().toLocaleString("de-DE")}
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        subject: `✦ Neue Kontaktanfrage von ${vorname} ${nachname || ""} – FlyOriginals`,
        html: emailBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${err}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err) {
    console.error("notify-kontakt error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
