import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

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
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "This email is already on the list. Please login instead." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
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

    // 3. Send Confirmation Email via Resend
    if (process.env.RESEND_API_KEY) {
      const firstName = fullName.split(' ')[0];
      await resend.emails.send({
        from: "Igor's All White Party <rsvp@jeniebirthday.com>",
        to: email,
        subject: "You're on the list: Igor's All White Party",
        html: `
          <div style="background-color: #f7f4ef; color: #1c1c1c; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0;">
            <div style="background: #f7f4ef; padding: 60px 20px 40px; text-align: center;">
              <p style="color: #6e5840; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 20px;">Exclusive Invitation</p>
              <h1 style="color: #1c1c1c; text-transform: uppercase; font-size: 32px; letter-spacing: 4px; margin: 0 0 10px; font-weight: 700;">You're on the list</h1>
              <h2 style="color: #6e5840; font-size: 18px; font-weight: 400; margin: 0; font-style: italic;">${firstName}</h2>
            </div>

            <div style="max-width: 520px; margin: 0 auto; padding: 0 20px 50px;">
              <div style="background-color: #fffdfb; padding: 30px; border: 1px solid rgba(110, 88, 64, 0.22); border-radius: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid rgba(110,88,64,0.15);">
                      <p style="color: #6e5840; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px;">When</p>
                      <p style="font-size: 16px; margin: 0; color: #1c1c1c;">November 7th &bull; 8:00 PM – 2:00 AM</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid rgba(110,88,64,0.15);">
                      <p style="color: #6e5840; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px;">Where</p>
                      <p style="font-size: 16px; margin: 0; color: #1c1c1c;">544 North Victoria Park Road<br/>Fort Lauderdale, FL 33301</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid rgba(110,88,64,0.15);">
                      <p style="color: #6e5840; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px;">Experience</p>
                      <p style="font-size: 15px; margin: 0; color: #6d645b;">Premium Top Shelf Open Bar &bull; Internationally Known DJs &bull; Performances &bull; Complimentary Valet Parking</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0;">
                      <p style="color: #6e5840; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px;">Dress code</p>
                      <p style="color: #1c1c1c; font-size: 16px; font-weight: bold; margin: 0; letter-spacing: 1px;">All white, head to toe</p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #6d645b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
                  See you in white.
                </p>
              </div>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API RSVP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
