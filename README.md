# TYPE CLASH — Typing Fighter

A responsive typing-combat game starter for Android phones, tablets and PC. It includes:
- Stickman arena, health bars, hit/attack animations and sound effects generated in-browser
- Paragraph typing combat, WPM, accuracy, combo and power meter
- Levels, XP, increasingly strong opponents, selectable unlockable fighter styles
- Achievement milestones
- Optional Supabase email authentication, cloud profile save and leaderboard
- Guest mode with local progress (stored in that browser)

## 1. Test locally

1. Extract this ZIP.
2. Open `index.html` in Chrome. The game works in guest mode without Supabase.
3. For best results, use a simple static server or deploy to Vercel. Supabase auth requires your deployed site URL to be added to Supabase's allowed redirect URLs.

## 2. Create the Supabase backend

1. Go to https://supabase.com and create a project.
2. In the project, open **SQL Editor** → **New query**.
3. Open `supabase.sql` from this folder, copy all its contents, paste into SQL Editor and press **Run**.
4. Open **Project Settings → API**. Copy the Project URL and the `anon` / publishable public key.
5. Open `config.js`. Replace `https://YOUR-PROJECT.supabase.co` and `YOUR_SUPABASE_ANON_PUBLIC_KEY` with your own values.
6. In Supabase **Authentication → URL Configuration**, add your Vercel website URL to **Site URL** and **Redirect URLs**. For development you can also add `http://localhost:3000/**`.
7. In **Authentication → Providers → Email**, choose whether email confirmation is enabled. If it is enabled, the user must confirm their email before signing in.

**Security:** The anon/public key is designed to be used in a browser with Row Level Security enabled. Never paste a Supabase `service_role` / secret key into `config.js`, GitHub, or any frontend file.

## 3. Put the files on GitHub (Android or PC)

1. Sign in at https://github.com and create a new repository named `type-clash`.
2. Set it to **Public** or **Private** (either works for Vercel).
3. Open the new repository → **Add file → Upload files**.
4. Extract this ZIP on your device first, then upload these files and the `supabase.sql` file. Keep them in the repository root (not inside an extra nested folder).
5. Scroll down and tap **Commit changes**.

On Android, you can use your browser's desktop-site option if the upload controls are hard to find.

## 4. Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Tap **Add New → Project**, choose your `type-clash` repository.
3. Framework preset: choose **Other**. Build command: leave blank. Output directory: leave blank or use `.`. This is a static site; no build step is required.
4. Click **Deploy**.
5. Open the Vercel URL. The game should load. Test guest mode first, then sign-up after completing Supabase setup.
6. If sign-in redirects incorrectly, add the exact Vercel URL in Supabase Authentication → URL Configuration.

## 5. Files included

- `index.html` — page structure
- `styles.css` — responsive design and stickman visuals
- `game.js` — game logic, typing, combat, progression, Supabase connection
- `config.js` — your Supabase URL and public anon key
- `supabase.sql` — database table, security policies and signup trigger

## 6. Important starter limitations

This is a complete playable **starter version**, not a finished commercial multiplayer game. The fight animation is stylized 2D stickman animation, not realistic 3D combat. Music is not bundled; sound effects are synthesized by the browser. It currently has single-player battles, local progress, account sign-in, cloud profile saves and a global leaderboard. It does not yet include real-time PvP, server-verified anti-cheat scores, a music track, or advanced frame-by-frame character art.

For fair competitive rankings, the next development phase should validate match results on a Supabase Edge Function and store individual match records. Do not treat browser-submitted scores as cheat-proof.

## 7. Ads / monetization (added)

All settings are in `config.js` under `window.AD_CONFIG`:
- `LINK` — your ad-network direct link (already set).
- `EVERY_N_FIGHTS` — the link opens in a new tab on every Nth fight start (default 2), triggered by the player's own click on START FIGHT / NEXT OPPONENT, so browsers don't block it.
- `COOLDOWN_SECONDS` — minimum gap between ad tabs (default 90s).
- `SUPPORT_BUTTON` — a voluntary "Support the game" button in the mission card.
- `SUPPORT_REWARD_XP` — bonus XP for pressing that button. Default 0. Many ad networks forbid rewarding clicks, so check your network's rules before setting this above 0.
- `ENABLED: false` turns every ad off.

## 8. Fight screen v2
- `fx.js` = canvas fight engine (6 punch/kick moves, special blast, hit sparks, screen shake, KO) + music & sound effects, all generated in code (no audio files needed). Music/SFX buttons are in the arena corner and top bar.
- On a fight start the arena locks to the top of the screen and the paragraph sits directly below it, so the keyboard never hides the fight. You type straight into the paragraph (green = correct, red = wrong).
