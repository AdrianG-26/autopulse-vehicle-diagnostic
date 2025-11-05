import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ================================================================
// SIMPLE SIGNUP - Just insert into users table
// ================================================================
export async function signupUser({ username, email, password }) {
  console.log('🔐 Simple signup:', { username, email });
  
  try {
    // Just insert directly into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password  // Stored as plain text
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }

    console.log('✅ User created:', data);
    return { user: data, error: null };
  } catch (error) {
    console.error('❌ Signup failed:', error);
    return { user: null, error };
  }
}

// ================================================================
// SIMPLE LOGIN - Check username/email and password
// ================================================================
export async function loginUser({ usernameOrEmail, password }) {
  console.log('🔐 Simple login:', { usernameOrEmail });
  
  try {
    // Check if it's an email or username
    const isEmail = usernameOrEmail.includes('@');
    
    // Query the users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(isEmail ? `email.eq.${usernameOrEmail}` : `username.eq.${usernameOrEmail}`)
      .limit(1);

    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found');
      throw new Error('User not found');
    }

    const user = users[0];

    // Check password (plain text comparison)
    if (user.password !== password) {
      console.log('❌ Wrong password');
      throw new Error('Invalid password');
    }

    console.log('✅ Login successful:', user);
    return { user, error: null };
  } catch (error) {
    console.error('❌ Login failed:', error);
    return { user: null, error };
  }
}

// ================================================================
// UPDATE USER - For settings page
// ================================================================
export async function updateUserFields(userId, updates) {
  console.log('📝 Updating user:', userId, updates);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ User updated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Update failed:', error);
    return { data: null, error };
  }
}

// ================================================================
// CHANGE PASSWORD - For settings page
// ================================================================
export async function changeUserPassword(userId, newPassword) {
  console.log('🔑 Changing password for:', userId);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Password changed');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Password change failed:', error);
    return { data: null, error };
  }
}

export default supabase;
