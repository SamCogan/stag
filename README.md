# Ste's Stag 2026

A mobile-first React application for live scoring across Pub Golf, Vila Sol Texas Scramble, and Coollattin Individual Stableford.

## Game modes

| Game                  | Scoring                                                            | Access                           |
| --------------------- | ------------------------------------------------------------------ | -------------------------------- |
| Pub Golf              | Best two adjusted player scores per team and hole                  | Team password                    |
| Vila Sol Scramble     | Team score to par with selected-drive tracking                     | Team password                    |
| Coollattin Stableford | Individual Stableford points from gross score and playing handicap | Individual username and password |

Stableford player credentials use the normalized player ID for both username and password. For example, Sam signs in with `sam` / `sam`. Team and organizer credentials are convenience gates in client-side code, not a security boundary.

## Routes

| Route                                                | Purpose                                                |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `?mode=home`                                         | Public visitor board, access forms, and live standings |
| `?mode=captain&event=stag2026&team=A&key=<team-key>` | Pub Golf team scorecard                                |
| `?mode=stats&event=stag2026`                         | Pub Golf individual statistics                         |
| `?mode=organizer&event=stag2026`                     | Pub Golf organizer                                     |
| `?mode=scramble&event=vilasol&team=A&key=<team-key>` | Vila Sol Scramble team scorecard                       |
| `?mode=scramble-org&event=vilasol`                   | Vila Sol Scramble organizer                            |
| `?mode=stableford&event=coollattin-stableford`       | Signed-in player's Stableford scorecard                |
| `?mode=stableford-stats&event=coollattin-stableford` | Public Stableford leaderboard                          |
| `?mode=stableford-org&event=coollattin-stableford`   | Stableford organizer                                   |

The legacy `stroke`, `stroke-stats`, and `stroke-org` modes remain accepted as aliases for the corresponding Stableford routes. Stableford always uses its isolated event namespace, including when reached through an old Stroke URL.

## Stableford behavior

- The course is Coollattin Golf Club from the men's white tees: 18 holes, par 72, 6,229 yards.
- Playing handicaps allocate strokes by stroke index, including multiple strokes above handicap 18.
- A gross score produces uncapped Stableford points using `max(0, 2 + par - net)`.
- A pickup completes the hole for zero points and removes any gross score.
- Clearing a hole returns it to the unplayed state.
- Players can edit only their own scorecard, and organizer locks disable player writes for that hole.
- The organizer can edit all player scores, pickups, handicaps, group assignments, optional group names, and hole locks.
- Group validation expects three groups of four unique players and displays imbalances.
- Stableford has its own reset and is excluded from the Pub Golf and Scramble team-to-par aggregate.

The 12 Stableford players currently use initials placeholders. Add photographs through `PlayerHeadshot` when the final assets are available.

## Persistence

Firebase Realtime Database paths are rooted at `events/<event-code>`.

| Data                  | Firebase event          | Browser storage                        |
| --------------------- | ----------------------- | -------------------------------------- |
| Pub Golf              | `stag2026`              | `pub-golf-local-state-v2`              |
| Vila Sol Scramble     | `vilasol-scramble`      | `golf-scramble-state-v1`               |
| Vila Sol loop         | `vilasol-config`        | `golf-loops-v1`                        |
| Shared team names     | `stag-config`           | `team-names-v1`                        |
| Coollattin Stableford | `coollattin-stableford` | `coollattin-stableford-state-v1`       |
| Stableford identity   | N/A                     | `coollattin-stableford-player-v1`      |
| Organizer session     | N/A                     | `organizer-auth-v1` in session storage |

When Firebase configuration is absent, the app runs in local-only mode. Local writes are optimistic and use the same runtime validation as remote snapshots.

## Local development

This project pins Bun 1.3.14.

1. Install dependencies:

   ```shell
   bun install --frozen-lockfile
   ```

2. Copy `.env.example` to `.env.local` and provide the Firebase web configuration.

3. Start Vite:

   ```shell
   bun run dev
   ```

4. Run the complete validation:

   ```shell
   bun run check
   ```

`bun run check` verifies formatting, strict TypeScript, zero-warning ESLint, the Bun test suite with coverage thresholds, and a production build.

## Deployment

Build and deploy to GitHub Pages:

```shell
bun run deploy
```

Vite uses a relative base so the application works below a repository path. The service worker derives its cache paths from its registration scope, serves navigation requests network-first, and is registered only in production. Increment `CACHE_NAME` in `public/sw.js` when deployment assets or shell behavior change so existing installations discard stale caches.
