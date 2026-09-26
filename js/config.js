// --- KONFIGURASI SUPABASE LOYZDEV ---
const SUPABASE_URL = 'https://khlzjpfatevjtkiziyok.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_3lbPrS7vhOzJpDwstP5jGg_zet-o9e5'; 

var supabase = null;

function getSupabaseClient() {
    if (supabase) return supabase;

    // Cari objek Supabase di berbagai namespace global CDN
    const lib = window.supabase || window.Supabase || window.supabaseClient;

    if (lib) {
        if (typeof lib.createClient === 'function') {
            supabase = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return supabase;
        }
    }

    if (typeof createClient === 'function') {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabase;
    }

    return null;
}

// Inisialisasi langsung saat script dimuat
getSupabaseClient();
