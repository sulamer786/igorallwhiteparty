import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';
import { EVENT_CONFIG } from '@/lib/eventConfig';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const rsvpSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  plusOneNames: z.string().optional(),
  // Allow empty string OR a valid 6+ char password
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.literal(''),
  ]).optional().transform(val => val || undefined),
  trackingRef: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  // This app only writes the All White Party list.
  host: z.literal('white').default('white'),
});

const PARTY_HOST = 'white';

function isExistingAccountError(message: string) {
  return /already (been )?registered/i.test(message);
}

// The old party and this one share one login per email.
// Someone from Casino Royale can still join this list.
async function findAuthUserId(email: string) {
  const normalized = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;
    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function sendConfirmation(email: string, fullName: string) {
  if (!process.env.RESEND_API_KEY) return;
  const firstName = fullName.split(' ')[0];
  const event = EVENT_CONFIG.white;
  const amenityLine = event.amenities.map((item) => item.label).join(' · ');
  await resend.emails.send({
    from: `${event.emailSubjectName} <rsvp@jeniebirthday.com>`,
    to: email,
    subject: `You're on the list: ${event.emailSubjectName}`,
    html: `
      <div style="background-color: #07111f; color: #f6f1e6; font-family: Georgia, 'Times New Roman', serif; padding: 0; margin: 0;">
        <div style="padding: 56px 24px 28px; text-align: center;">
          <p style="color: #e4c98a; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 18px;">${event.eyebrow}</p>
          <div style="width: 72px; height: 1px; background: #e4c98a; margin: 0 auto 16px;"></div>
          <h1 style="color: #f7f3ea; text-transform: uppercase; font-size: 40px; letter-spacing: 3px; margin: 0; font-weight: 500;">White Party</h1>
          <p style="color: #f7f3ea; font-size: 18px; font-style: italic; margin: 12px 0 0;">${event.italicLine}</p>
          <p style="color: #e4c98a; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 16px 0 0;">${event.city}</p>
          <p style="color: #f6f1e6; font-size: 16px; margin: 22px 0 0;">${firstName}, you're on the list.</p>
        </div>

        <div style="max-width: 480px; margin: 0 auto; padding: 8px 24px 56px; text-align: center;">
          <p style="font-size: 20px; letter-spacing: 1px; margin: 0 0 8px; color: #f7f3ea;">${event.dateLabel} &bull; ${event.hours}</p>
          <p style="font-size: 15px; margin: 0 0 18px; color: rgba(246,241,230,0.8);">${event.addressLines}</p>
          <p style="font-size: 14px; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 18px; color: #f6f1e6;">${event.attire}</p>
          <p style="font-size: 13px; line-height: 1.6; margin: 0 0 22px; color: #e4c98a;">${amenityLine}</p>
          <div style="width: 72px; height: 1px; background: #e4c98a; margin: 0 auto 14px;"></div>
          <p style="color: #e4c98a; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">${event.closing}</p>
        </div>
      </div>
    `,
  }).catch(console.error);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = rsvpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { fullName, email, phone, plusOneNames, password, trackingRef, avatarUrl, host } = result.data;

    // 1. Create auth user
    const userPassword = password || Math.random().toString(36).slice(-8) + 'X1!';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (!isExistingAccountError(authError.message)) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }

      const { data: existingGuest, error: lookupError } = await supabaseAdmin
        .from('guests')
        .select('id, host')
        .ilike('email', email)
        .maybeSingle();

      if (lookupError) {
        return NextResponse.json({ error: lookupError.message }, { status: 500 });
      }

      if (existingGuest?.host === PARTY_HOST) {
        return NextResponse.json(
          { error: "This email is already on the list. Please login instead." },
          { status: 409 }
        );
      }

      const userId = existingGuest?.id ?? await findAuthUserId(email);
      if (!userId) {
        return NextResponse.json(
          { error: "This email is already on the list. Please login instead." },
          { status: 409 }
        );
      }

      if (password) {
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        if (passwordError) {
          return NextResponse.json({ error: passwordError.message }, { status: 500 });
        }
      }

      const guestFields = {
        full_name: fullName,
        phone: phone || null,
        plus_one_names: plusOneNames || null,
        tracking_ref: trackingRef || null,
        host: PARTY_HOST,
        rsvp_status: 'attending',
        ...(avatarUrl ? { photo_url: avatarUrl } : {}),
      };

      const { error: moveError } = existingGuest
        ? await supabaseAdmin.from('guests').update(guestFields).eq('id', userId)
        : await supabaseAdmin.from('guests').insert({ id: userId, email, ...guestFields });

      if (moveError) {
        return NextResponse.json({ error: moveError.message }, { status: 500 });
      }

      await sendConfirmation(email, fullName);
      return NextResponse.json({ success: true });
    }

    const userId = authData.user.id;

    // 2. Create Guest Profile
    const { error: guestError } = await supabaseAdmin
      .from('guests')
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        phone: phone || null,
        plus_one_names: plusOneNames || null,
        photo_url: avatarUrl || null,
        tracking_ref: trackingRef || null,
        host: host,
      });

    if (guestError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: guestError.message }, { status: 500 });
    }

    await sendConfirmation(email, fullName);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API RSVP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
