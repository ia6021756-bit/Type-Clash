// Paste your Supabase project URL and anon/public key below.
// Find both in Supabase Dashboard > Project Settings > API.
// NEVER put a service_role key in this file.
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_PUBLIC_KEY"
};

// ---------- ADS / MONETIZATION ----------
// Your ad-network direct link. It opens in a NEW TAB so the game is never interrupted.
window.AD_CONFIG = {
  LINK: "",
  ENABLED: false,
  EVERY_N_FIGHTS: 2,        // open the ad link on every 2nd fight start (set 1 for every fight)
  COOLDOWN_SECONDS: 90,     // never open the ad link more often than this
  SUPPORT_BUTTON: true,     // shows a "Support the game" button players can click voluntarily
  SUPPORT_REWARD_XP: 0      // bonus XP for clicking the support button (0 = no reward; see README before using)
};
