import { supabase } from '../config/supabase.js';

export async function getCache(key) {
    const { data } = await supabase
        .from('cache')
        .select('value, expires_at')
        .eq('key', key)
        .single();
    if (data && new Date(data.expires_at) > new Date()) return data.value;
    return null;
}

export async function setCache(key, value, ttlSeconds = 3600) {
    const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await supabase
        .from('cache')
        .upsert({ key, value, expires_at }, { onConflict: ['key'] });
}
