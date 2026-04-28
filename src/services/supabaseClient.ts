// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// These environment variables are standard in Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-public-anon-key';

/**
 * Supabase Client Instance
 * 
 * This client provides fully-typed access to your PostgreSQL database, 
 * built-in user authentication, and secure Row Level Security (RLS) policies.
 * 
 * Example Usage:
 * 
 * 1. Authenticate a User:
 *    const { data, error } = await supabase.auth.signInWithPassword({
 *      email: 'user@example.com',
 *      password: 'secretpassword'
 *    });
 * 
 * 2. Fetch User Session History:
 *    const { data, error } = await supabase
 *      .from('sessions')
 *      .select('*')
 *      .order('created_at', { ascending: false });
 * 
 * 3. Save a Custom Breathing Rhythm:
 *    const { error } = await supabase
 *      .from('custom_patterns')
 *      .insert([{
 *         name: 'Calm Waves',
 *         inhale: 4,
 *         hold_in: 4,
 *         exhale: 6,
 *         hold_out: 2,
 *         category: 'calm'
 *      }]);
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
