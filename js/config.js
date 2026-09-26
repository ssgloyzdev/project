// --- KONFIGURASI SUPABASE LOYZDEV ---
const SUPABASE_URL = 'https://khlzjpfatevjtkiziyok.supabase.co'; // Ganti dengan URL Supabase kamu
const SUPABASE_ANON_KEY = 'sb_publishable_3lbPrS7vhOzJpDwstP5jGg_zet-o9e5';                // Ganti dengan Anon Key kamu

// Deklarasi variabel global supabase
let supabase;

try {
    // Ambil client Supabase dari window.supabase atau supabase library
    const supabaseClient = window.supabase || window.supabaseClient;

    if (supabaseClient && typeof supabaseClient.createClient === 'function') {
        supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("SDK Supabase JS belum dimuat dari CDN!");
    }
} catch (err) {
    console.error("Gagal menginisialisasi Supabase:", err);
}
