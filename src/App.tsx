import { useEffect, useMemo, useState } from "react";

import { createRemoteStore } from "./firebaseStore";
import { useAppRoute } from "./routes";

const EVENT = {
  title: "Stag Pub Golf",
  holes: [
    {
      id: "h1",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 1",
      par: 3,
    },
    {
      id: "h2",
      name: "Baby Guinness Shot",
      pub: "Pub 1 (Ease In) | Hole 2",
      par: 2,
    },
    {
      id: "h3",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 3",
      par: 3,
    },
    {
      id: "h4",
      name: "Vodka & Mixer (single)",
      pub: "Pub 1 (Ease In) | Hole 4",
      par: 3,
    },
    {
      id: "h5",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 5",
      par: 3,
    },
    {
      id: "h6",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 1 (Ease In) | Hole 6",
      par: 3,
    },
    {
      id: "h7",
      name: "Pint Beer / Long Drink",
      pub: "Pub 2 (Steady) | Hole 7",
      par: 4,
    },
    {
      id: "h8",
      name: "Gin & Tonic (single)",
      pub: "Pub 2 (Steady) | Hole 8",
      par: 3,
    },
    {
      id: "h9",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 2 (Steady) | Hole 9",
      par: 3,
    },
    {
      id: "h10",
      name: "Pint Beer / Long Drink",
      pub: "Pub 2 (Steady) | Hole 10",
      par: 4,
    },
    {
      id: "h11",
      name: "Vodka & Mixer (single)",
      pub: "Pub 2 (Steady) | Hole 11",
      par: 3,
    },
    {
      id: "h12",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 2 (Steady) | Hole 12",
      par: 3,
    },
    {
      id: "h13",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 3 (Finish Strong) | Hole 13",
      par: 3,
    },
    {
      id: "h14",
      name: "Baby Guinness Shot",
      pub: "Pub 3 (Finish Strong) | Hole 14",
      par: 2,
    },
    {
      id: "h15",
      name: "Half Pint Beer / Small Mixer",
      pub: "Pub 3 (Finish Strong) | Hole 15",
      par: 3,
    },
    {
      id: "h16",
      name: "Gin & Tonic (single)",
      pub: "Pub 3 (Finish Strong) | Hole 16",
      par: 3,
    },
    {
      id: "h17",
      name: "Choice Drink (light)",
      pub: "Pub 3 (Finish Strong) | Hole 17",
      par: 3,
    },
    {
      id: "h18",
      name: "Pint Beer / Long Drink",
      pub: "Pub 3 (Finish Strong) | Hole 18",
      par: 4,
    },
  ],
  teams: {
    A: {
      label: "Team A",
      key: "alpha123",
      players: [
        { id: "a1", name: "Player A1" },
        { id: "a2", name: "Player A2" },
        { id: "a3", name: "Player A3" },
      ],
    },
    B: {
      label: "Team B",
      key: "bravo123",
      players: [
        { id: "b1", name: "Player B1" },
        { id: "b2", name: "Player B2" },
        { id: "b3", name: "Player B3" },
      ],
    },
    C: {
      label: "Team C",
      key: "charlie123",
      players: [
        { id: "c1", name: "Player C1" },
        { id: "c2", name: "Player C2" },
        { id: "c3", name: "Player C3" },
      ],
    },
  },
};

const STORAGE_KEY = "pub-golf-local-scores-v1";

type Scores = Record<string, number>;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readLocal = (): Scores => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    if (!isRecord(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === "number" && Number.isFinite(entry[1]),
      ),
    );
  } catch {
    return {};
  }
};

const scoreKey = (playerId: string, holeId: string) => `${playerId}::${holeId}`;

const sumPlayer = (scores: Scores, playerId: string) => {
  return EVENT.holes.reduce((accumulator, hole) => {
    const value = scores[scoreKey(playerId, hole.id)];
    return (
      accumulator +
      (typeof value === "number" && Number.isFinite(value) ? value : 0)
    );
  }, 0);
};

function App() {
  const [route] = useAppRoute();
  const mode = route.mode === "organizer" ? "organizer" : "captain";
  const { eventCode, key: teamKey } = route;
  const team =
    route.teamId === undefined ? undefined : EVENT.teams[route.teamId];

  const [scores, setScores] = useState<Scores>(readLocal);
  const remote = useMemo(() => createRemoteStore(eventCode), [eventCode]);
  const networkState = remote === null ? "local-only" : "connected";

  useEffect(() => {
    if (remote === null) {
      return;
    }

    const unsubscribe = remote.subscribe((incoming) => {
      setScores((previous) => ({ ...previous, ...incoming }));
    });

    return unsubscribe;
  }, [remote]);

  useEffect(() => {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const canEdit = mode === "captain" && team?.key === teamKey;

  const updateScore = async (
    playerId: string,
    holeId: string,
    delta: number,
  ) => {
    const key = scoreKey(playerId, holeId);
    const current = scores[key] ?? 0;
    const next = Math.max(1, current + delta);
    const patch = { [key]: next };

    setScores((previous) => ({ ...previous, ...patch }));
    if (remote !== null) {
      await remote.update(patch);
    }
  };

  const setExactScore = async (
    playerId: string,
    holeId: string,
    value: string,
  ) => {
    const asNumber = Number(value);
    if (!Number.isFinite(asNumber) || asNumber < 1) {
      return;
    }

    const key = scoreKey(playerId, holeId);
    const patch = { [key]: asNumber };
    setScores((previous) => ({ ...previous, ...patch }));
    if (remote !== null) {
      await remote.update(patch);
    }
  };

  const teamTotals = Object.entries(EVENT.teams)
    .map(([id, data]) => {
      const total = data.players.reduce(
        (accumulator, player) => accumulator + sumPlayer(scores, player.id),
        0,
      );
      return {
        id,
        label: data.label,
        total,
      };
    })
    .sort((a, b) => a.total - b.total);

  const drinksLegend = [
    ...new Map(
      EVENT.holes.map((hole) => [
        `${hole.name}-${String(hole.par)}`,
        { name: hole.name, par: hole.par },
      ]),
    ).values(),
  ];

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Live Scoring MVP</p>
        <h1>{EVENT.title}</h1>
        <p className="subtitle">
          Event: {eventCode} | Mode: {mode}
        </p>
        <p className="status-pill">Sync: {networkState}</p>
      </header>

      {mode === "captain" && (
        <section className="panel">
          <h2>Captain Scoring</h2>
          {!team && (
            <p>Invalid team. Use team=A, team=B or team=C in the URL.</p>
          )}
          {team && (
            <>
              <p className="muted">
                Team: {team.label} |{" "}
                {canEdit ? "Edit enabled" : "Read only (wrong key)"}
              </p>
              <div className="legend-panel">
                <h3>Drinks & Pars</h3>
                <div className="legend-grid">
                  {drinksLegend.map((drink) => (
                    <div
                      className="legend-item"
                      key={`${drink.name}-${String(drink.par)}`}
                    >
                      <span>{drink.name}</span>
                      <strong>Par {drink.par}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-grid">
                {team.players.map((player) => (
                  <article key={player.id} className="score-card">
                    <h3>{player.name}</h3>
                    {EVENT.holes.map((hole) => {
                      const key = scoreKey(player.id, hole.id);
                      const value = scores[key] ?? hole.par;
                      return (
                        <div className="score-row" key={hole.id}>
                          <div>
                            <strong>{hole.name}</strong>
                            <p>
                              {hole.pub} | Par {hole.par}
                            </p>
                          </div>
                          <div className="controls">
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() => {
                                void updateScore(player.id, hole.id, -1);
                              }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={value}
                              disabled={!canEdit}
                              aria-label={`${player.name}, ${hole.name} score`}
                              onChange={(event) => {
                                void setExactScore(
                                  player.id,
                                  hole.id,
                                  event.target.value,
                                );
                              }}
                            />
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() => {
                                void updateScore(player.id, hole.id, 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <p className="player-total">
                      Total: {sumPlayer(scores, player.id)}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <section className="panel">
        <h2>Organizer Leaderboard</h2>
        <div className="leaderboard">
          {teamTotals.map((entry, index) => (
            <div className="leader-row" key={entry.id}>
              <span>{index + 1}</span>
              <span>{entry.label}</span>
              <strong>{entry.total}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel notes">
        <h2>Captain Links</h2>
        <p>
          Share one link with each captain. These are default keys; change them
          in src/App.jsx before event day.
        </p>
        <ul>
          <li>?mode=captain&event=stag2026&team=A&key=alpha123</li>
          <li>?mode=captain&event=stag2026&team=B&key=bravo123</li>
          <li>?mode=captain&event=stag2026&team=C&key=charlie123</li>
          <li>?mode=organizer&event=stag2026</li>
        </ul>
      </section>
    </div>
  );
}

export default App;
