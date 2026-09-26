// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://qwhchtvmxbytxkkjlxwi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MIy6BVWFnDYlVgguqR_pow_jJHC6GXp';

// Inisialisasi Client Supabase Global
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
