import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = url && anon ? createClient(url, anon) : null;

export const isSupabaseConfigured = () => Boolean(supabase);

export async function signupUser({ username, email, password }) {
  if (!supabase) throw new Error('Supabase is not configured');

  // Option A: use your custom users table
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      email,
      password: password
    })
    .select('id, username, email');

  if (error) throw new Error(error.message || 'Failed to create user');
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

export async function loginUser({ usernameOrEmail, password }) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, password')
    .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
    .limit(1);
  if (error) throw new Error(error.message || 'Login failed');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || row.password !== password) throw new Error('Invalid username/email or password');
  return { username: row.username, email: row.email };
}

export async function updateUserFields({ matchUsernameOrEmail, updates }) {
  if (!supabase) throw new Error('Supabase is not configured');
  const query = supabase.from('users').update(updates).or(`username.eq.${matchUsernameOrEmail},email.eq.${matchUsernameOrEmail}`);
  const { error } = await query;
  if (error) throw new Error(error.message || 'Update failed');
  return true;
}

export async function changeUserPassword({ matchUsernameOrEmail, newPassword }) {
  return updateUserFields({ matchUsernameOrEmail, updates: { password: newPassword } });
}


