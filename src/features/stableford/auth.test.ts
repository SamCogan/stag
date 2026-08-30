import { expect, test } from "bun:test";

import {
  authenticateStablefordPlayer,
  findStablefordPlayer,
  normalizeCredential,
} from "./auth";
import { STABLEFORD_CONFIG } from "./config";

test("normalizes credential case and whitespace", () => {
  expect(normalizeCredential("  SaM  ")).toBe("sam");
  expect(normalizeCredential(" Paul  C ")).toBe("paulc");
});

test("authenticates sam/sam", () => {
  expect(authenticateStablefordPlayer("sam", "sam")).toMatchObject({
    id: "sam",
    name: "Sam",
  });
});

test("authenticates Sam/Sam after normalization", () => {
  expect(authenticateStablefordPlayer("Sam", "Sam")).toMatchObject({
    id: "sam",
    name: "Sam",
  });
});

test("authenticates display names with spaces after normalization", () => {
  expect(authenticateStablefordPlayer("Paul C", "PAUL C")).toMatchObject({
    id: "paulc",
    name: "Paul C",
  });
});

test("authenticates ste/ste", () => {
  expect(authenticateStablefordPlayer("ste", "ste")).toMatchObject({
    id: "ste",
    name: "Ste",
  });
});

test("authenticates every roster player with matching username and password", () => {
  for (const player of STABLEFORD_CONFIG.players) {
    expect(authenticateStablefordPlayer(player.id, player.id)).toBe(player);
  }
});

test("rejects mismatched passwords", () => {
  expect(authenticateStablefordPlayer("sam", "ste")).toBeUndefined();
});

test("rejects matching credentials for an unknown player", () => {
  expect(authenticateStablefordPlayer("unknown", "unknown")).toBeUndefined();
});

test("rejects blank credentials", () => {
  expect(authenticateStablefordPlayer("", "")).toBeUndefined();
  expect(authenticateStablefordPlayer("   ", "   ")).toBeUndefined();
});

test("finds a player from a persisted player ID", () => {
  expect(findStablefordPlayer("sam")).toMatchObject({
    id: "sam",
    name: "Sam",
  });
});

test("does not find missing or unknown persisted player IDs", () => {
  const persistedIdentity: { playerId?: string } = {};

  expect(findStablefordPlayer(persistedIdentity.playerId)).toBeUndefined();
  expect(findStablefordPlayer("unknown")).toBeUndefined();
});
