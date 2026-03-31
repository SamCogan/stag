# Stag Pub Golf MVP

Mobile-first pub golf web app for 3 team captains with a central organizer leaderboard.

## What this MVP does

- Captain mode: enter scores for one team using a unique team link.
- Organizer mode: see all team totals live on one screen.
- No login/auth flow.
- Realtime sync via Firebase Realtime Database when env config is provided.
- Local fallback mode when Firebase is not configured.
- PWA manifest + service worker so users can add to home screen.

## Captain and organizer links

Default links use query params:

- `?mode=captain&event=stag2026&team=A&key=alpha123`
- `?mode=captain&event=stag2026&team=B&key=bravo123`
- `?mode=captain&event=stag2026&team=C&key=charlie123`
- `?mode=organizer&event=stag2026`

Change team names, players, pubs, pars, and keys in `src/App.jsx`.

## Local run

1. `npm install`
2. Copy `.env.example` to `.env` and fill Firebase values.
3. `npm run dev`

## Firebase setup (no auth)

1. Create a Firebase project.
2. Enable Realtime Database.
3. Copy web app config values into `.env`.
4. For a quick trusted MVP, permissive rules can be used temporarily:

```json
{
	"rules": {
		".read": true,
		".write": true
	}
}
```

Use stricter rules before using this beyond a private event.

## GitHub Pages deploy

1. Create a GitHub repo and push this folder.
2. Run `npm run deploy` (uses `gh-pages` package).
3. In repo settings, enable GitHub Pages for the `gh-pages` branch.
4. Share the final URL + query links with captains.

## Build

`npm run build`
