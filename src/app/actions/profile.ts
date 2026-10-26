"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData, targetUserId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const userId = targetUserId || user.id;

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const plusOneNames = formData.get('plusOneNames') as string;

  const { error } = await supabase
    .from('guests')
    .update({
      full_name: fullName,
      phone: phone || null,
      plus_one_names: plusOneNames || null,
    })
    .eq('id', userId);

  if (error) {
    console.error('Update profile error:', error);
    throw new Error('Failed to update profile');
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleRsvpStatus(newStatus: 'attending' | 'declined', targetUserId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const userId = targetUserId || user.id;

  const { error } = await supabase
    .from('guests')
    .update({ rsvp_status: newStatus })
    .eq('id', userId);

  if (error) {
    console.error('RSVP toggle error:', error);
    throw new Error('Failed to update RSVP status');
  }

  revalidatePath('/dashboard');
  revalidatePath('/');
  return { success: true };
}
