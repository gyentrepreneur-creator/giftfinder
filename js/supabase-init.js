// ──────────────────────────────────────────────
// GiftFinder — Initialisation du client Supabase
// ──────────────────────────────────────────────
// On sauvegarde createClient avant d'écraser window.supabase
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
