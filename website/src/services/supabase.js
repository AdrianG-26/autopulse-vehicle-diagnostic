import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Only create client if environment variables are configured
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ================================================================
// SIMPLE SIGNUP - Just insert into users table
// ================================================================
export async function signupUser({ username, email, password }) {
  console.log('🔐 Simple signup:', { username, email });
  
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  
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
    return data;
  } catch (error) {
    console.error('❌ Signup failed:', error);
    throw error;
  }
}

// ================================================================
// SIMPLE LOGIN - Check username/email and password
// ================================================================
export async function loginUser({ usernameOrEmail, password }) {
  console.log('🔐 Simple login:', { usernameOrEmail });
  
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  
  if (!usernameOrEmail || !password) {
    throw new Error('Username/email and password are required');
  }
  
  try {
    // Check if it's an email or username
    const isEmail = usernameOrEmail.includes('@');
    
    console.log('🔍 Searching for user:', { usernameOrEmail, isEmail });
    
    // Query the users table - try multiple strategies
    let users = null;
    let error = null;
    
    // Strategy 1: Try email if it looks like an email
    if (isEmail) {
      console.log('🔍 Strategy 1: Searching by email...');
      const result = await supabase
        .from('users')
        .select('*')
        .eq('email', usernameOrEmail)
        .limit(1);
      
      users = result.data;
      error = result.error;
      
      if (error) {
        console.error('❌ Email query error:', error);
        // Check if table doesn't exist
        if (error.code === '42P01') {
          throw new Error('Users table does not exist. Please run the SQL script to create it in Supabase.');
        }
        // Check if RLS is blocking
        if (error.code === '42501' || error.message?.includes('permission')) {
          throw new Error('Permission denied. Check your Supabase RLS policies for the users table.');
        }
      }
    }
    
    // Strategy 2: Try username if not found or if it's not an email
    if ((!users || users.length === 0) && !isEmail) {
      console.log('🔍 Strategy 2: Searching by username...');
      const result = await supabase
        .from('users')
        .select('*')
        .eq('username', usernameOrEmail)
        .limit(1);
      
      users = result.data;
      error = result.error;
      
      if (error) {
        console.error('❌ Username query error:', error);
        if (error.code === '42P01') {
          throw new Error('Users table does not exist. Please run the SQL script to create it in Supabase.');
        }
        if (error.code === '42501' || error.message?.includes('permission')) {
          throw new Error('Permission denied. Check your Supabase RLS policies for the users table.');
        }
      }
    }
    
    // Strategy 3: Try both if still not found
    if ((!users || users.length === 0) && !error) {
      console.log('🔍 Strategy 3: Searching by email OR username...');
      const result = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${usernameOrEmail},username.eq.${usernameOrEmail}`)
        .limit(1);
      
      users = result.data;
      error = result.error;
    }

    if (error && error.code !== '42P01' && error.code !== '42501') {
      console.error('❌ Query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found');
      // Check if table is accessible at all
      const testResult = await supabase.from('users').select('id').limit(1);
      if (testResult.error) {
        if (testResult.error.code === '42P01') {
          throw new Error('Users table does not exist. Please create it in Supabase first.');
        }
        throw new Error(`Cannot access users table: ${testResult.error.message}`);
      }
      throw new Error('Invalid credentials - user not found');
    }

    const user = users[0];
    console.log('✅ User found:', { id: user.id, email: user.email, username: user.username });

    // Check password (plain text comparison)
    if (!user.password) {
      console.log('❌ User has no password set');
      throw new Error('Invalid credentials');
    }
    
    if (user.password !== password) {
      console.log('❌ Wrong password');
      throw new Error('Invalid credentials');
    }

    console.log('✅ Login successful:', user);
    // Return user data in the format expected by the login handler
    return {
      id: user.id,
      username: user.username,
      email: user.email
    };
  } catch (error) {
    console.error('❌ Login failed:', error);
    // Return user-friendly error message
    if (error.message) {
      throw error;
    }
    throw new Error('Login failed. Please try again.');
  }
}

// ================================================================
// UPDATE USER - For settings page
// ================================================================
export async function updateUserFields(userId, updates) {
  console.log('📝 Updating user:', userId, updates);
  
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ User updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

// ================================================================
// CHANGE PASSWORD - For settings page
// ================================================================
export async function changeUserPassword(userIdOrEmail, currentPassword, newPassword) {
  console.log('🔑 Changing password for:', userIdOrEmail, 'Type:', typeof userIdOrEmail);
  
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  
  if (!userIdOrEmail) {
    throw new Error('User identifier is required');
  }
  
  try {
    let user;
    let queryError = null;
    
    // Try multiple strategies to find the user
    // Strategy 1: Try as ID (could be number or UUID string)
    if (userIdOrEmail) {
      console.log('🔍 Strategy 1: Trying to find user by ID...');
      const { data: idData, error: idError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userIdOrEmail)
        .maybeSingle();
      
      if (!idError && idData) {
        console.log('✅ Found user by ID');
        user = idData;
      } else {
        console.log('❌ Not found by ID:', idError?.message || 'No data');
        queryError = idError;
      }
    }
    
    // Strategy 2: Try as email
    if (!user && userIdOrEmail && userIdOrEmail.includes('@')) {
      console.log('🔍 Strategy 2: Trying to find user by email...');
      const { data: emailData, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userIdOrEmail)
        .limit(1);
      
      if (!emailError && emailData && emailData.length > 0) {
        console.log('✅ Found user by email');
        user = emailData[0];
      } else {
        console.log('❌ Not found by email:', emailError?.message || 'No data');
        queryError = emailError || queryError;
      }
    }
    
    // Strategy 3: Try as username
    if (!user && userIdOrEmail) {
      console.log('🔍 Strategy 3: Trying to find user by username...');
      const { data: usernameData, error: usernameError } = await supabase
        .from('users')
        .select('*')
        .eq('username', userIdOrEmail)
        .limit(1);
      
      if (!usernameError && usernameData && usernameData.length > 0) {
        console.log('✅ Found user by username');
        user = usernameData[0];
      } else {
        console.log('❌ Not found by username:', usernameError?.message || 'No data');
        queryError = usernameError || queryError;
      }
    }
    
    // If still not found, check if it's an RLS issue
    if (!user) {
      console.error('❌ User not found after all strategies');
      console.error('Query errors:', queryError);
      
      // Check if users table exists and is accessible
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id, email, username')
        .limit(1);
      
      if (testError) {
        if (testError.code === '42P01') {
          throw new Error('Users table does not exist. Please run the SQL script to create it.');
        } else if (testError.code === '42501' || testError.message?.includes('permission')) {
          throw new Error('Permission denied. Check your Supabase RLS policies for the users table.');
        } else {
          throw new Error(`Cannot access users table: ${testError.message}`);
        }
      }
      
      if (!testData || testData.length === 0) {
        throw new Error('Users table is empty. No users found in database.');
      }
      
      throw new Error(`User not found with identifier: ${userIdOrEmail}. Please check your email/username.`);
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email, username: user.username });
    
    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Update password - don't use .single() on update, just check if it succeeded
    console.log('🔄 Updating password for user ID:', user.id);
    console.log('🔄 User data before update:', { id: user.id, email: user.email, username: user.username });
    
    // First, check if we can even read the user (RLS check)
    const { data: canRead, error: readError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('id', user.id)
      .maybeSingle();
    
    if (readError) {
      console.error('❌ Cannot read user (RLS issue?):', readError);
      throw new Error(`Cannot access user data: ${readError.message}. Check your Supabase RLS policies.`);
    }
    
    if (!canRead) {
      throw new Error('User not found or you do not have permission to access this user.');
    }
    
    // Now try the update
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', user.id)
      .select();

    console.log('Update response:', { 
      updateData, 
      updateError, 
      dataLength: updateData?.length,
      hasError: !!updateError 
    });

    if (updateError) {
      console.error('Update error details:', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      });
      
      // Check if it's an RLS (Row Level Security) error
      if (updateError.code === '42501' || updateError.message?.includes('permission') || updateError.message?.includes('policy')) {
        throw new Error('Permission denied. You may not have permission to update passwords. Check your Supabase RLS policies.');
      }
      
      throw new Error(updateError.message || 'Failed to update password');
    }
    
    if (!updateData || updateData.length === 0) {
      // Try to verify the update worked by querying the user again
      console.log('⚠️ No data returned from update, verifying...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .maybeSingle();
      
      if (verifyError) {
        console.error('Verify error:', verifyError);
        throw new Error('Password update may have failed. Please check your Supabase RLS policies.');
      }
      
      if (verifyData && verifyData.password === newPassword) {
        console.log('✅ Password updated successfully (verified)');
        return verifyData;
      }
      
      throw new Error('Password update failed - no rows affected. Check your Supabase RLS policies.');
    }
    
    console.log('✅ Password changed successfully');
    return updateData[0];
  } catch (error) {
    console.error('❌ Password change failed:', error);
    // Return a user-friendly error message
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to change password. Please try again.');
  }
}

export default supabase;

// ================================================================
// HELPER FUNCTIONS
// ================================================================
export const isSupabaseConfigured = () => Boolean(supabase && supabaseUrl && supabaseAnonKey);
