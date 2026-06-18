import { supabase } from './supabase';

export const GUEST_MODE_MESSAGE = 'You are in guest mode and cannot modify data.';

export function isRlsError(error) {
  if (!error) return false;

  const code = error.code;
  const message = (error.message || '').toLowerCase();

  return (
    code === '42501' ||
    code === 'PGRST5' ||
    message.includes('row-level security') ||
    message.includes('permission denied') ||
    message.includes('violates row-level security')
  );
}

export function getErrorMessage(error) {
  if (isRlsError(error)) return GUEST_MODE_MESSAGE;
  return error?.message || 'An unexpected error occurred.';
}

export async function getCurrentUserRole() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('[auth] no user session', userError?.message ?? '');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  console.log('[auth] user:', user.email, 'role:', data?.role ?? null, error ? `(fetch error: ${error.message})` : '');

  if (error) {
    console.warn('[auth] profile fetch failed:', error.message);
    return null;
  }

  if (!data?.role) {
    console.warn('[auth] profile missing or role empty for', user.email);
    return null;
  }

  return data.role;
}
