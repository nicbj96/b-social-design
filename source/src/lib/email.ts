/**
 * email.ts — thin wrapper around the send-email Edge Function
 *
 * Provides ready-made email templates for common B-Social events.
 * Gracefully no-ops if the edge function is unavailable.
 */

import { supabase } from "@/lib/supabase";

const BASE_URL = "https://b-social.net";

async function send(to: string, subject: string, html: string) {
  try {
    await supabase.functions.invoke("send-email", {
      body: { to, subject, html },
    });
  } catch {
    // Email is best-effort — never throw
  }
}

/* ── Templates ─────────────────────────────────────────────────────────── */

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background:#060a0f; color:#e8f4f3; }
    .wrap { max-width:560px; margin:0 auto; padding:40px 24px; }
    .logo { font-size:24px; font-weight:700; color:#4ecdc4; margin-bottom:32px; }
    .card { background:#0d1117; border-radius:16px; padding:28px; margin-bottom:24px;
            border:1px solid rgba(255,255,255,0.08); }
    h2 { margin:0 0 12px; font-size:20px; color:#f0fffe; }
    p  { margin:8px 0; font-size:15px; line-height:1.6; color:rgba(255,255,255,0.7); }
    .btn { display:inline-block; margin-top:20px; padding:12px 24px; background:#4ecdc4;
           color:#060a0f; font-weight:700; font-size:15px; border-radius:10px;
           text-decoration:none; }
    .meta { font-size:13px; color:rgba(255,255,255,0.35); margin-top:4px; }
    .footer { font-size:12px; color:rgba(255,255,255,0.2); text-align:center; margin-top:32px; }
    .sep { border:none; border-top:1px solid rgba(255,255,255,0.07); margin:16px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">B-Social</div>
    ${content}
    <div class="footer">
      <p>B-Social · Norden · <a href="${BASE_URL}/indstillinger" style="color:#4ecdc4">Afmeld notifikationer</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendRsvpConfirmation(opts: {
  to: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventId: string;
}) {
  const d = new Date(opts.eventDate).toLocaleDateString("da-DK", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const html = layout(`
    <div class="card">
      <h2>Du er tilmeldt! 🎉</h2>
      <p>Hej ${opts.userName},</p>
      <p>Du er nu tilmeldt <strong>${opts.eventTitle}</strong>.</p>
      <hr class="sep" />
      <p class="meta">📅 ${d}</p>
      <p class="meta">📍 ${opts.eventLocation}</p>
      <a href="${BASE_URL}/event/${opts.eventId}" class="btn">Se event</a>
    </div>
  `);
  await send(opts.to, `Tilmeldt: ${opts.eventTitle}`, html);
}

export async function sendEventCreatedConfirmation(opts: {
  to: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventId: string;
}) {
  const d = new Date(opts.eventDate).toLocaleDateString("da-DK", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const html = layout(`
    <div class="card">
      <h2>Dit event er oprettet 🚀</h2>
      <p>Hej ${opts.userName},</p>
      <p>Dit event <strong>${opts.eventTitle}</strong> er nu synligt på B-Social.</p>
      <p class="meta">📅 ${d}</p>
      <a href="${BASE_URL}/event/${opts.eventId}" class="btn">Se dit event</a>
    </div>
  `);
  await send(opts.to, `Event oprettet: ${opts.eventTitle}`, html);
}

export async function sendNewCommentNotification(opts: {
  to: string;
  ownerName: string;
  commenterName: string;
  eventTitle: string;
  commentText: string;
  eventId: string;
}) {
  const html = layout(`
    <div class="card">
      <h2>Ny kommentar på dit event</h2>
      <p>Hej ${opts.ownerName},</p>
      <p><strong>${opts.commenterName}</strong> har kommenteret på <strong>${opts.eventTitle}</strong>:</p>
      <blockquote style="border-left:3px solid #4ecdc4;margin:12px 0;padding:8px 16px;
                         background:rgba(78,205,196,0.05);border-radius:0 8px 8px 0;
                         font-style:italic;color:rgba(255,255,255,0.65);">
        "${opts.commentText.slice(0, 200)}${opts.commentText.length > 200 ? '…' : ''}"
      </blockquote>
      <a href="${BASE_URL}/event/${opts.eventId}" class="btn">Se event</a>
    </div>
  `);
  await send(opts.to, `Ny kommentar: ${opts.eventTitle}`, html);
}

export async function sendNewRsvpNotification(opts: {
  to: string;
  ownerName: string;
  attendeeName: string;
  eventTitle: string;
  eventId: string;
  currentCount: number;
}) {
  const html = layout(`
    <div class="card">
      <h2>Ny tilmelding til dit event</h2>
      <p>Hej ${opts.ownerName},</p>
      <p><strong>${opts.attendeeName}</strong> har tilmeldt sig <strong>${opts.eventTitle}</strong>.</p>
      <p class="meta">Tilmeldte i alt: ${opts.currentCount}</p>
      <a href="${BASE_URL}/event/${opts.eventId}" class="btn">Se tilmeldinger</a>
    </div>
  `);
  await send(opts.to, `Ny tilmelding: ${opts.eventTitle}`, html);
}
