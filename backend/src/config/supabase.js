import dotenv from 'dotenv';
dotenv.config();
console.log('URL=', process.env.SUPABASE_URL, 'KEY loaded?', !!process.env.SUPABASE_KEY);
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
}

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
