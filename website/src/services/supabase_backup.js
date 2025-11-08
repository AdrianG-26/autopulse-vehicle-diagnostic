import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = url && anon ? createClient(url, anon) : null;

export const isSupabaseConfigured = () => Boolean(supabase);

// SIMPLE SIGNUP - Just create the user
export async function signupUser({ username, email, password }) {
  if (!supabase) throw new Error('Supabase is not configured');

  console.log('🔐 Signing up:', email);

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('Signup failed');

  console.log('✅ Auth user created');
  
  // Create profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      username,
      email
    });

  if (profileError) throw new Error(profileError.message);
  
  console.log('✅ Profile created');
  return { username, email };
}

// SIMPLE LOGIN - Just sign in
export async function loginUser({ usernameOrEmail, password }) {
  if (!supabase) throw new Error('Supabase is not configured');
  
  console.log('🔐 Logging in:', usernameOrEmail);
  
  let email = usernameOrEmail;
  
  // If it's a username, look up the email
  if (!usernameOrEmail.includes('@')) {
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('username', usernameOrEmail)
      .single();
    
    if (!data) throw new Error('User not found');
    email = data.email;
  }
  
  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) throw new Error('Invalid credentials');
  
  // Get profile
  const { data: userData } = await supabase
    .from('users')
    .select('username, email')
    .eq('id', authData.user.id)
    .single();
  
  console.log('✅ Logged in');
  return userData || { email };
}

export async function logoutUser() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Legacy functions for Settings page compatibility
export async function updateUserFields({ matchUsernameOrEmail, updates }) {
  if (!supabase) throw new Error('Supabase is not configured');
  
  // Remove password from updates - it goes through changeUserPassword
  const { password, ...safeUpdates } = updates;
  
  const { error } = await supabase
    .from('users')
    .update(safeUpdates)
    .or(`username.eq.${matchUsernameOrEmail},email.eq.${matchUsernameOrEmail}`);
  
  if (error) throw new Error(error.message);
  return true;
}

export async function changeUserPassword({ matchUsernameOrEmail, newPassword }) {
  if (!supabase) throw new Error('Supabase is not configured');
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw new Error(error.message);
  return true;
}
