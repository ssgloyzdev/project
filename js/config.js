// --- KONFIGURASI SUPABASE LOYZDEV ---
const SUPABASE_URL = 'https://khlzjpfatevjtkiziyok.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_3lbPrS7vhOzJpDwstP5jGg_zet-o9e5'; 

// Deklarasi variabel global supabase
var supabase = null;

// Helper inisialisasi yang tahan terhadap delay pemuatan CDN di HP/koneksi lambat
function getSupabaseClient() {
    if (supabase) return supabase;

    // Ambil objek library dari CDN window
    const supabaseLib = window.supabase || window.supabaseClient;

    if (supabaseLib && typeof supabaseLib.createClient === 'function') {
        supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabase;
    }
    return null;
}

// Inisialisasi awal saat config.js di-load
getSupabaseClient();
